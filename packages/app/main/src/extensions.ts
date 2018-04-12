import { IPC, IDisposable, Disposable, CommandService, IExtensionConfig, uniqueId, NoopIPC } from '@bfemulator/sdk-shared';
import { ProcessIPC, WebSocketIPC, WebSocketServer } from '@bfemulator/sdk-main';
import { getDirectories, readFileSync, isDev } from './utils';
import { fork, ChildProcess } from 'child_process';
import * as path from 'path';
import { mainWindow } from './main';
import { CommandRegistry } from './commands';
import { ElectronIPC } from './ipc';
import * as WebSocket from 'ws';

//=============================================================================
export interface IExtension {
  readonly unid: string;
  readonly config: IExtensionConfig;
  on(event: 'exit', listener: NodeJS.ExitListener);
  call(commandName: string, ...args: any[]): Promise<any>;
  connect();
  disconnect();
}

//=============================================================================
export abstract class Extension extends Disposable implements IExtension {
  protected _ext: CommandService;
  protected _cli: CommandService;

  get unid(): string { return this._ipc.id.toString(); }
  get config(): IExtensionConfig { return this._config; }

  constructor(private _config: IExtensionConfig, protected _ipc: IPC) {
    super();
    this._ext = new CommandService(this._ipc, `ext-${this._ipc.id}`);
    this._cli = new CommandService(mainWindow.ipc, `ext-${this._ipc.id}`);
    this.toDispose(this._ipc);
    this.toDispose(this._ext);

    //-------------------------------------------------------------------------
    // Methods callable by extension
    this._ext.on('ext-ping', () => {
      return 'ext-pong';
    });

    //-------------------------------------------------------------------------
    // Methods callable by client interface
    this._cli.on('cli-ping', () => {
      return 'cli-pong';
    });

    //-------------------------------------------------------------------------
    // Pass unknown commands from client to extension
    this._cli.on('command-not-found', (commandName: string, ...args: any[]): Promise<any> => {
      return this._ext.remoteCall(commandName, ...args);
    });

    //-------------------------------------------------------------------------
    // Pass unknown commands from extension to shell
    this._ext.on('command-not-found', (commandName: string, ...args: any[]): Promise<any> => {
      return mainWindow.commandService.call(commandName, ...args);
    });
  }

  public call(commandName: string, ...args: any[]): Promise<any> {
    try {
      return this._ext.remoteCall(commandName, ...args);
    } catch (err) {
      return Promise.reject(err);
    }
  }

  abstract on(event: 'exit', listener: NodeJS.ExitListener);
  abstract connect();
  abstract disconnect();

  toDispose(obj: any) {
    super.toDispose(obj);
  }
}

//=============================================================================
export class ChildExtension extends Extension {

  constructor(config: IExtensionConfig, private _process: ChildProcess) {
    super(config, new ProcessIPC(_process));
  }

  public on(event: 'exit', listener: NodeJS.ExitListener) {
    this._process.on(event, listener);
  }

  public connect() {
    this.call('connect').catch(() => { });
  }

  public disconnect() {
    this.call('disconnect').catch(() => { });
    this._process.disconnect();
  }
}

//=============================================================================
export class PeerExtension extends Extension {
  constructor(config: IExtensionConfig, private _wsipc: WebSocketIPC) {
    super(config, _wsipc);
  }

  public on(event: 'exit', listener: NodeJS.ExitListener) {
    this._wsipc.ws.on('close', listener);
  }

  public connect() {
    this.call('connect').catch(() => { });
  }

  public disconnect() {
    this.call('disconnect').catch(() => { });
  }
}

//=============================================================================
export class ClientExtension extends Extension {
  static counter: number = 0;
  constructor(config: IExtensionConfig) {
    super(config, new NoopIPC(--ClientExtension.counter));
  }
  on(event: 'exit', listener: NodeJS.ExitListener) { }
  connect() { }
  disconnect() { }
}

//=============================================================================
export interface IExtensionManager {
  findExtension(name: string): IExtension;
  addExtension(extension: IExtension, configPath: string);
  loadExtensions();
  unloadExtensions();
}

//=============================================================================
export const ExtensionManager = new class extends Disposable implements IExtensionManager {

  private extensions: { [unid: string]: IExtension } = {};

  public findExtension(name: string): IExtension {
    for (let unid in this.extensions) {
      if (this.extensions[unid].config.name === name) {
        return this.extensions[unid];
      }
    }
    return undefined;
  }

  public loadExtensions() {
    let folders = [];
    try {
      // Get all subdirectories under ../extensions
      folders = getDirectories(`${__dirname}/../extensions`);
    } catch (err) { }
    // Load each extension
    folders.forEach(folder => {
      try {
        this.spawnExtension(folder);
      } catch (ex) {
        console.log(`Failed to spawn extension '${folder}'`, ex);
      }
    });
  }

  public unloadExtensions() {
    for (let unid in this.extensions) {
      this.unloadExtension(unid);
    }
  }

  public unloadExtension(unid: string) {
    if (this.extensions.hasOwnProperty(unid)) {
      console.log(`Removing extension ${this.extensions[unid].config.name}`);
      // Disconnect from the extension process
      this.extensions[unid].disconnect();
      // Notify the client that the extension is gone.
      mainWindow.commandService.remoteCall('shell:extension-disconnect', unid);
      // Cleanup
      delete this.extensions[unid];
    }
  }

  public addExtension(extension: IExtension, configPath: string) {
    // Cleanup configPath
    configPath = configPath.replace(/\\/g, '/');
    // Remove any previous extension with matching name.
    const existing = this.findExtension(extension.config.name);
    if (existing) {
      this.unloadExtension(existing.unid);
    }
    // Save it off.
    this.extensions[extension.unid] = extension;
    extension.on('exit', (code) => {
      // Unload the extension if its process exits.
      this.unloadExtension(extension.unid);
    });
    console.log(`Adding extension ${extension.config.name}`);
    // Cleanup some data
    extension.config.client = extension.config.client || {};
    extension.config.node = extension.config.node || {};
    // Cleanup basePath (root of webpack-dev-server, where index.html would live)
    extension.config.client.basePath = (extension.config.client.basePath || "").replace(/\\/g, '/');
    // Get the list of inspectors
    const inspectors = extension.config.client.inspectors || [];
    // Cleanup inspector paths
    inspectors.forEach(inspector => {
      inspector.src = (inspector.src || "").replace(/\\/g, '/');
    });
    if (extension.config.client.debug
      && extension.config.client.debug.enabled
      && extension.config.client.debug.webpack) {
      // If running in debug mode, rewrite inspector paths as http URLs for webpack-dev-server.
      const port = extension.config.client.debug.webpack.port || 3030;
      const host = extension.config.client.debug.webpack.host || "localhost";
      inspectors.forEach(inspector => {
        inspector.src = `http://${host}:${port}/${inspector.src}`.replace(extension.config.client.basePath, "");
      });
    } else {
      // If not in debug mode, rewrite paths as file path URLs.
      inspectors.forEach(inspector => {
        let folder = path.resolve(configPath).replace(/\\/g, '/');
        if (folder[0] != '/') {
          folder = `/${folder}`;
        }
        inspector.src = `file://${folder}/` + inspector.src;
      });
    }
    // Connect to the extension's node process (if any).
    extension.connect();
    // Notify the client of the new extension.
    mainWindow.commandService.remoteCall('shell:extension-connect', extension.config, extension.unid);
  }

  private spawnExtension(folder: string) {
    let child: ChildProcess;
    try {
      // Read the extension's config file.
      let config = JSON.parse(readFileSync(`${folder}/bf-extension.json`));
      // Follow redirections until we find a config file without one.
      while (config && config.location) {
        folder = path.resolve(config.location);
        try {
          config = JSON.parse(readFileSync(`${folder}/bf-extension.json`));
        } catch (ex) {
          config = null;
        }
      }
      if (config && config.name) {
        if (config.node) {
          if (config.node.debug && config.node.debug.enabled) {
            if (config.node.debug.websocket && config.node.debug.websocket.port) {
              const port = +config.node.debug.websocket.port;
              try {
                // This extension is going to connect to us over websocket. Once that
                // connection is established we'll add the extension.
                const wss = new ExtensionServer(port);
                console.log(`Waiting for extension ${config.name} to connect on port ${port}`);
              } catch (err) {
                console.log(`Failed to spawn WebSocketServer on port ${port}. Extension ${config.name} will be unable to connect.`, err);
              }
            }
          } else if (config.node.main) {
            // Launch node process as a child of this one.
            const file = path.resolve(folder, config.node.main);
            // Start the extension in a child process.
            child = fork(file, [], {
              cwd: path.dirname(file),
              stdio: [0, 1, 2, 'ipc']
            });
            // Wrap the extension process.
            const extension = new ChildExtension(config, child);
            // Add it to the ecosystem (notifies client, etc).
            this.addExtension(extension, folder);
          }
        } else {
          // It's a client-only extension
          const extension = new ClientExtension(config);
          // Add it to the ecosystem (notifies client, etc).
          this.addExtension(extension, folder);
        }
      }
    } catch (err) {
      // Something went wrong. If we still have a child process, try to kill it.
      console.log("Failed to spawn extension", folder, err);
      try {
        if (child) {
          child.kill();
        }
      } catch (ex) { }
    }
  }
}

//=============================================================================
class PendingExtension extends Disposable {
  private _ipc: WebSocketIPC;
  private _ext: CommandService;

  constructor(private _ws: WebSocket) {
    super();
    this._ipc = new WebSocketIPC(this._ws);
    this._ext = new CommandService(this._ipc, 'connector');
    super.toDispose(this._ipc);
    super.toDispose(this._ext);
    this._ext.remoteCall('hello')
      .then((reply: {
        id: number,
        configPath: string,
        config: IExtensionConfig
      }) => {
        const ipc = new WebSocketIPC(this._ws);
        ipc.id = reply.id;
        const configPath = reply.configPath;
        const extension = new PeerExtension(reply.config, ipc);
        ExtensionManager.addExtension(extension, configPath);
        super.dispose();
      });
  }
}
//=============================================================================
class ExtensionServer extends WebSocketServer {

  constructor(port: number) {
    super(port);
  }

  public onConnection(ws: WebSocket): void {
    new PendingExtension(ws);
  }
}
