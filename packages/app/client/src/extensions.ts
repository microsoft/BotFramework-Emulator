import { IExtensionConfig, Channel, IDisposable, CommandService } from '@bfemulator/sdk-shared';
import { ElectronIPC } from './ipc';
import { CommandRegistry } from './commands';
import { IActivity } from '@bfemulator/app-shared';

export class Extension {
  private _ext: CommandService;

  get unid(): string { return this._unid; }
  get config(): IExtensionConfig { return this._config; }

  constructor(private _config: IExtensionConfig, private _unid: string) {
    this._ext = new CommandService(ElectronIPC, `ext-${this._unid}`);
    /*
    this._ext.remoteCall('ext-ping')
      .then(reply => console.log(reply))
      .catch(err => console.log('ping failed', err));
    */
  }

  public call<T = any>(commandName: string, ...args: any[]): Promise<T> {
    return this._ext.remoteCall<T>(commandName, ...args);
  }

  public canActivateFile(filename: string): boolean {
    if (this._config.files && this._config.files.length) {
      for (let i = 0; i < this._config.files; ++i) {
        const pattern = this._config.files[i];
        if (typeof pattern === 'string') {
          if (pattern.startsWith('.')) {
            // Check file extension match
            if (filename.endsWith(pattern)) {
              return true;
            }
          } else if (pattern.startsWith('/')) {
            // Check regex match
            const regex = new RegExp(pattern);
            if (regex.test(filename)) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  public getInspectors(activities: IActivity[]) {

  }
}

export interface IExtensionManager {
  registerCommands();
  addExtension(config: Extension, unid: string);
  removeExtension(unid: string);
  fileActivated(path: string);
}

export const ExtensionManager = new class implements IExtensionManager {
  private extensions: { [unid: string]: Extension } = {};

  public addExtension(config: IExtensionConfig, unid: string) {
    this.removeExtension(unid);
    console.log(`adding extension ${config.name}`);
    const ext = new Extension(config, unid);
    this.extensions[unid] = ext;
  }

  public removeExtension(unid: string) {
    if (this.extensions[unid]) {
      console.log(`removing extension ${this.extensions[unid].config.name}`);
      delete this.extensions[unid];
    }
  }

  public findExtension(name: string): Extension {
    for (let unid in this.extensions) {
      const extension = this.extensions[unid];
      if (extension.config.name === name)
        return extension;
    }
    return null;
  }

  public fileActivated(path: string) {
    const handlers: Extension[] = [];
    for (let unid in this.extensions) {
      const extension = this.extensions[unid];
      if (extension.canActivateFile(path)) {
        handlers.push(extension);
      }
    }
  }

  public registerCommands() {
    CommandRegistry.registerCommand('shell:extension-connect', (config: IExtensionConfig, unid: string) => {
      ExtensionManager.addExtension(config, unid);
    });

    CommandRegistry.registerCommand('shell:extension-disconnect', (unid: string) => {
      ExtensionManager.removeExtension(unid);
    });
  }
}
