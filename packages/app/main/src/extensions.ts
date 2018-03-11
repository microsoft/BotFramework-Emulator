import { IPC, IDisposable, Disposable, CommandService, IExtensionConfig, uniqueId } from '@bfemulator/sdk-shared';
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
  call<T = any>(commandName: string, ...args: any[]): Promise<T>;
  connect();
  disconnect();
}

//=============================================================================
export abstract class Extension extends Disposable implements IExtension {
  protected _ext: CommandService;
  protected _cli: CommandService;

  get unid(): string { return this._ipc.id; }
  get config(): IExtensionConfig { return this._config; }

  constructor(private _config: IExtensionConfig, protected _ipc: IPC) {
    super();
    this._ext = new CommandService(this._ipc, `ext-${this._ipc.id}`);
    this._cli = new CommandService(mainWindow.ipc, `ext-${this._ipc.id}`);
    this.toDispose(this._ipc);
    this.toDispose(this._ext);

    //-------------------------------------------------------------------------
    // Methods callable by extension
    this._ext.registry.registerCommand('ext-ping', () => {
      return 'ext-pong';
    });

    //-------------------------------------------------------------------------
    // Methods callable by client interface
    this._cli.registry.registerCommand('cli-ping', () => {
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

  public call<T = any>(commandName: string, ...args: any[]): Promise<T> {
    try {
      return this._ext.remoteCall<T>(commandName, ...args);
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
  constructor(config: IExtensionConfig, ipc: WebSocketIPC) {
    super(config, ipc);
  }

  public on(event: 'exit', listener: NodeJS.ExitListener) {
    this._ipc.ws.on('close', listener);
  }

  public connect() {
    this.call('connect').catch(() => { });
  }

  public disconnect() {
    this.call('disconnect').catch(() => { });
  }
}

//=============================================================================
export interface IExtensionManager {
  findExtension(name: string): IExtension;
  addExtension(extension: IExtension);
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

  public addExtension(extension: IExtension) {
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
    // Connect to the extension.
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
      if (config.name) {
        const file = path.resolve(folder, config.main);
        // Start the extension in a child process.
        child = fork(file, [], {
          cwd: path.dirname(file),
          stdio: [0, 1, 2, 'ipc']
        });
        // Wrap the extension process.
        const extension = new ChildExtension(config, child);
        // Add it to the ecosystem (notifies client, etc).
        this.addExtension(extension);
      }
    } catch (err) {
      console.log("Failed to spawn extension", folder, err);
      if (child) {
        child.kill();
      }
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
        config: IExtensionConfig
      }) => {
        const ipc = new WebSocketIPC(this._ws);
        ipc.id = reply.id;
        const extension = new PeerExtension(reply.config, ipc);
        ExtensionManager.addExtension(extension);
        super.dispose();
      });
  }
}
//=============================================================================
export const ExtensionServer = new class extends WebSocketServer {

  init() { }

  public onConnection(ws: WebSocket): void {
    new PendingExtension(ws);
  }
}
