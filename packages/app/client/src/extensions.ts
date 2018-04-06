import { IExtensionConfig, Channel, IDisposable, CommandService, IExtensionInspector, IActivity } from '@bfemulator/sdk-shared';
import { ElectronIPC } from './ipc';
import { CommandRegistry } from './commands';
import * as jsonpath from 'jsonpath';

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

  public inspectorForObject(obj: any): IExtensionInspector | null {
    const inspectors = this.config.client.inspectors || [];
    return inspectors.find(inspector => Extension.canInspect(inspector, obj));
  }

  public static canInspect(inspector: IExtensionInspector, obj: any): boolean {
    if (!obj) return false;
    if (typeof obj !== 'object') return false;
    // Check the activity against the inspector's set of criteria
    let criterias = inspector.criteria || [];
    if (!Array.isArray(criterias))
      criterias = [criterias];
    let canInspect = true;
    criterias.forEach(criteria => {
      // Path is a json-path
      const value = jsonpath.value(obj, criteria.path);
      if (typeof value === 'undefined') {
        canInspect = false;
      } else {
        // Value can be a regex or a string literal
        if (criteria.value.startsWith('/')) {
          const regex = new RegExp(criteria.value);
          canInspect = canInspect && regex.test(value);
        } else {
          canInspect = canInspect && criteria.value === value;
        }
      }
    });
    return canInspect;
  }

  public call(commandName: string, ...args: any[]): Promise<any> {
    return this._ext.remoteCall(commandName, ...args);
  }
}

//=============================================================================
export interface IExtensionManager {
  registerCommands();
  addExtension(config: IExtensionConfig, unid: string);
  removeExtension(unid: string);
  getExtensions(): Extension[];
  inspectorForObject(obj: any): IExtensionInspector | null;
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
    return this.getExtensions().find(extension => extension.config.name === name);
  }

  public getExtensions(): Extension[] {
    return Object.keys(this.extensions).map(key => this.extensions[key]) || [];
  }

  public inspectorForObject(obj: any): IExtensionInspector | null {
    return this.getExtensions().map(extension => extension.inspectorForObject(obj)).filter(inspector => !!inspector).shift();
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
