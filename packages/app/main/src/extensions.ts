import { IPC, IDisposable, Disposable, CommandService, IExtensionConfig, uniqueId } from '@bfemulator/sdk-shared';
import { ProcessIPC, WebSocketIPC } from '@bfemulator/sdk-main';
import { getDirectories, readFileSync, isDev } from './utils';
import { fork, ChildProcess } from 'child_process';
import * as path from 'path';
import { mainWindow } from './main';
import { CommandRegistry } from './commands';
import { ElectronIPC } from './ipc';

//=============================================================================
export interface IExtension {
  unid: string;
  config: IExtensionConfig;
  on(event: 'exit', listener: NodeJS.ExitListener);
  call<T = any>(commandName: string, ...args: any[]): Promise<T>;
  connect();
  disconnect();
}

//=============================================================================
export abstract class Extension extends Disposable implements IExtension {
  private _unid: string;
  protected _ext: CommandService;
  protected _cli: CommandService;

  get unid(): string { return this._unid; }
  get config(): IExtensionConfig { return this._config; }

  constructor(private _config: IExtensionConfig, protected _ipc: IPC) {
    super();
    this._unid = uniqueId();
    this._ext = new CommandService(this._ipc, `ext-${this._config.name}`);
    this._cli = new CommandService(mainWindow.ipc, `ext-${this._unid}`);
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
  constructor(config: IExtensionConfig, private _websocket: any) {
    super(config, new WebSocketIPC(_websocket));
  }

  public on(event: 'exit', listener: NodeJS.ExitListener) {
    // TODO
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
    folders.forEach(folder => this.spawnExtension(folder));
  }

  public unloadExtensions() {
    for (let unid in this.extensions) {
      this.unloadExtension(unid);
    }
  }

  public unloadExtension(unid: string) {
    if (this.extensions.hasOwnProperty(unid)) {
      // Disconnect from the extension process
      this.extensions[unid].disconnect();
      // Notify the client that the extension is gone.
      mainWindow.commandService.remoteCall('shell:extension-disconnect', unid);
      // Cleanup
      delete this.extensions[unid];
    }
  }

  public addExtension(extension: IExtension): IDisposable {
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
      while (config && config.location) {
        folder = path.resolve(config.location);
        config = JSON.parse(readFileSync(`${folder}/bf-extension.json`));
      }
      // Remove any previous extension with matching name.
      const existing = this.findExtension(config.name);
      if (existing) {
        this.unloadExtension(existing.unid);
      }
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
    } catch (err) {
      console.log("Failed to spawn extension", folder, err);
      if (child) {
        child.kill();
      }
    }
  }
}
