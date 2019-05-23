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

import { SharedConstants } from '@bfemulator/app-shared';
import { Command, ExtensionConfig, ExtensionInspector } from '@bfemulator/sdk-shared';

// =============================================================================
export class Extension {
  public get unid(): string {
    return this._unid;
  }

  public get config(): ExtensionConfig {
    return this._config;
  }

  public constructor(private _config: ExtensionConfig, private _unid: string) {}

  public inspectorForObject(obj: any): GetInspectorResult | null {
    const inspectors = this.config.client.inspectors || [];
    const inspector = inspectors.find(inspectorArg => InspectorAPI.canInspect(inspectorArg, obj));
    return inspector
      ? {
          extension: this,
          inspector,
        }
      : null;
  }
}

// =============================================================================
export class InspectorAPI {
  public static canInspect(inspector: ExtensionInspector, obj: any): boolean {
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
    return criterias.some(criteria => {
      // Path is a json-path
      const value = getValueFromPath(obj, criteria.path);
      if (typeof value === 'undefined') {
        return false;
      } else {
        // Value can be a regex or a string literal
        if ((criteria.value || '').startsWith('/')) {
          const regex = new RegExp(criteria.value);
          return regex.test(value);
        } else {
          return criteria.value === value;
        }
      }
    });
  }

  public static summaryText(inspector: ExtensionInspector, obj: any): string {
    let summaryTexts = inspector.summaryText || [];
    if (!Array.isArray(summaryTexts)) {
      summaryTexts = [summaryTexts];
    }
    let text = '';
    for (let i = 0; i < summaryTexts.length; ++i) {
      const value = getValueFromPath(obj, summaryTexts[i]);
      if (value) {
        text += value;
      }
    }

    if (text.length > 50) {
      text = text.substring(0, 50) + '...';
    }
    return text;
  }
}

export function getValueFromPath(source: { [prop: string]: any }, path: string): any {
  const parts = path.split('.');
  let val = source;
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!(part in val)) {
      return undefined;
    }
    val = val[parts[i]];
  }
  return val;
}

// =============================================================================
export interface GetInspectorResult {
  extension: Extension;
  inspector: ExtensionInspector;
}

const { Connect, Disconnect } = SharedConstants.Commands.Extension;

// =============================================================================
class EmulatorExtensionManager {
  private extensions: { [unid: string]: Extension } = {};

  public addExtension(config: ExtensionConfig, unid: string) {
    this.removeExtension(unid);
    this.extensions[unid] = new Extension(config, unid);
  }

  public removeExtension(unid: string) {
    if (this.extensions[unid]) {
      // eslint-disable-next-line no-console
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
      .filter(resultArg => !!resultArg)
      .shift();
    if (!result && defaultToJson) {
      // Default to the JSON inspector
      // eslint-disable-next-line typescript/no-use-before-define
      const jsonExtension = this.findExtension('JSON');
      if (jsonExtension) {
        result = {
          extension: jsonExtension,
          inspector: jsonExtension.config.client.inspectors ? jsonExtension.config.client.inspectors[0] : null,
        };
      }
    }
    return result;
  }

  @Command(Connect)
  protected connectExtension(config: ExtensionConfig) {
    // eslint-disable-next-line typescript/no-use-before-define
    this.addExtension(config, config.location);
  }

  @Command(Disconnect)
  protected disconnectExtension(location: string) {
    // eslint-disable-next-line typescript/no-use-before-define
    this.removeExtension(location);
  }
}

export const ExtensionManager = new EmulatorExtensionManager();
