//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

import { CommandService, IExtensionConfig, IExtensionInspector } from '@bfemulator/sdk-shared';
import { ElectronIPC } from './ipc';
import { CommandRegistry } from './commands';
import * as jsonpath from 'jsonpath';

// =============================================================================
export class Extension {
  private _ext: CommandService;

  get unid(): string {
    return this._unid;
  }

  get config(): IExtensionConfig {
    return this._config;
  }

  constructor(private _config: IExtensionConfig, private _unid: string) {
    this._ext = new CommandService(ElectronIPC, `ext-${this._unid}`);
    /*
    this._ext.remoteCall('ext-ping')
      .then(reply => console.log(reply))
      .catch(err => console.log('ping failed', err));
    */
  }

  public inspectorForObject(obj: any): GetInspectorResult | null {
    const inspectors = this.config.client.inspectors || [];
    const inspector = inspectors.find(inspectorArg => InspectorAPI.canInspect(inspectorArg, obj));
    return inspector ? {
      extension: this,
      inspector
    } : null;
  }

  public call(commandName: string, ...args: any[]): Promise<any> {
    return this._ext.remoteCall(commandName, ...args);
  }
}

// =============================================================================
export class InspectorAPI {
  public static canInspect(inspector: IExtensionInspector, obj: any): boolean {
    if (!obj) {
      return false;
    }
    if (typeof obj !== 'object') {
      return false;
    }
    // Check the activity against the inspector's set of criteria
    let criterias = inspector.criteria || [];
    if (!Array.isArray(criterias)) {
      criterias = [criterias];
    }
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

  public static summaryText(inspector: IExtensionInspector, obj: any): string {
    let summaryTexts = inspector.summaryText || [];
    if (!Array.isArray(summaryTexts)) {
      summaryTexts = [summaryTexts];
    }
    let ret: any;
    for (let i = 0; i < summaryTexts.length; ++i) {
      const results = jsonpath.query(obj, summaryTexts[i]);
      if (results && results.length) {
        if (typeof results[0] === 'string') {
          const value = results[0];
          if (value.length > 0) {
            ret = value;
          }
        }
      }
    }

    let text;
    if (typeof ret === 'string') {
      text = ret;
    } else if (ret) {
      text = JSON.stringify(ret);
    } else {
      text = '';
    }

    if (text.length > 50) {
      text = text.substring(0, 50) + '...';
    }
    return text;
  }
}

// =============================================================================
export interface GetInspectorResult {
  extension: Extension;
  inspector: IExtensionInspector;
}

// =============================================================================
export interface ExtensionManager {
  registerCommands();

  addExtension(config: IExtensionConfig, unid: string);

  removeExtension(unid: string);

  getExtensions(): Extension[];

  inspectorForObject(obj: any, defaultToJson: boolean): GetInspectorResult | null;
}

// =============================================================================
export const ExtensionManager = new class implements ExtensionManager {
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

  public inspectorForObject(obj: any, defaultToJson: boolean): GetInspectorResult | null {
    let result = this.getExtensions()
      .map(extension => extension.inspectorForObject(obj))
      .filter(resultArg => !!resultArg).shift();
    if (!result && defaultToJson) {
      // Default to the JSON inspector
      const jsonExtension = ExtensionManager.findExtension('JSON');
      if (jsonExtension) {
        result = {
          extension: jsonExtension,
          inspector: jsonExtension.config.client.inspectors ? jsonExtension.config.client.inspectors[0] : null
        };
      }
    }
    return result;
  }

  public registerCommands() {
    CommandRegistry.registerCommand('shell:extension-connect', (config: IExtensionConfig, unid: string) => {
      ExtensionManager.addExtension(config, unid);
    });

    CommandRegistry.registerCommand('shell:extension-disconnect', (unid: string) => {
      ExtensionManager.removeExtension(unid);
    });
  }
};
