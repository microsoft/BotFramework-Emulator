import { IExtensionConfig, Channel, IDisposable, CommandService, IExtensionInspector } from '@bfemulator/sdk-shared';
import { ElectronIPC } from './ipc';
import { CommandRegistry } from './commands';
import { IActivity } from '@bfemulator/app-shared';

//=============================================================================
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

  public getInspectors(): IExtensionInspector[] {
    return this.config.client.inspectors || [];
  }

  public call<T = any>(commandName: string, ...args: any[]): Promise<T> {
    return this._ext.remoteCall<T>(commandName, ...args);
  }
}

//=============================================================================
export interface IExtensionManager {
  registerCommands();
  addExtension(config: Extension, unid: string);
  removeExtension(unid: string);
  getExtensions(): Extension[];
  getInspectors(): IExtensionInspector[];
}

//=============================================================================
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

  public getExtensions(): Extension[] {
    return Object.keys(this.extensions).map(key => this.extensions[key]);
  }

  public getInspectors(): IExtensionInspector[] {
    let arr = this.getExtensions().map(extension => extension.getInspectors());
    if (arr.length) {
      arr = arr.reduce((a, b) => a.concat(b));
    }
    return arr;
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
