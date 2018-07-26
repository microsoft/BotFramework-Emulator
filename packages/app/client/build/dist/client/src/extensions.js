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
import { CommandServiceImpl } from '@bfemulator/sdk-shared';
import { ElectronIPC } from './ipc';
import * as jsonpath from 'jsonpath';
import { SharedConstants } from '@bfemulator/app-shared';
// =============================================================================
export class Extension {
    constructor(_config, _unid) {
        this._config = _config;
        this._unid = _unid;
        this._ext = new CommandServiceImpl(ElectronIPC, `ext-${this._unid}`);
        /*
        this._ext.remoteCall('ext-ping')
          .then(reply => console.log(reply))
          .catch(err => console.log('ping failed', err));
        */
    }
    get unid() {
        return this._unid;
    }
    get config() {
        return this._config;
    }
    inspectorForObject(obj) {
        const inspectors = this.config.client.inspectors || [];
        const inspector = inspectors.find(inspectorArg => InspectorAPI.canInspect(inspectorArg, obj));
        return inspector ? {
            extension: this,
            inspector
        } : null;
    }
    call(commandName, ...args) {
        return this._ext.remoteCall(commandName, ...args);
    }
}
// =============================================================================
export class InspectorAPI {
    static canInspect(inspector, obj) {
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
            }
            else {
                // Value can be a regex or a string literal
                if (criteria.value.startsWith('/')) {
                    const regex = new RegExp(criteria.value);
                    canInspect = canInspect && regex.test(value);
                }
                else {
                    canInspect = canInspect && criteria.value === value;
                }
            }
        });
        return canInspect;
    }
    static summaryText(inspector, obj) {
        let summaryTexts = inspector.summaryText || [];
        if (!Array.isArray(summaryTexts)) {
            summaryTexts = [summaryTexts];
        }
        let ret;
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
        }
        else if (ret) {
            text = JSON.stringify(ret);
        }
        else {
            text = '';
        }
        if (text.length > 50) {
            text = text.substring(0, 50) + '...';
        }
        return text;
    }
}
// =============================================================================
export const ExtensionManager = new class {
    constructor() {
        this.extensions = {};
    }
    addExtension(config, unid) {
        this.removeExtension(unid);
        console.log(`adding extension ${config.name}`);
        const ext = new Extension(config, unid);
        this.extensions[unid] = ext;
    }
    removeExtension(unid) {
        if (this.extensions[unid]) {
            console.log(`removing extension ${this.extensions[unid].config.name}`);
            delete this.extensions[unid];
        }
    }
    findExtension(name) {
        return this.getExtensions().find(extension => extension.config.name === name);
    }
    getExtensions() {
        return Object.keys(this.extensions).map(key => this.extensions[key]) || [];
    }
    inspectorForObject(obj, defaultToJson) {
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
    registerCommands(commandRegistry) {
        commandRegistry.registerCommand(SharedConstants.Commands.Extension.Connect, (config, unid) => {
            ExtensionManager.addExtension(config, unid);
        });
        commandRegistry.registerCommand(SharedConstants.Commands.Extension.Disconnect, (unid) => {
            ExtensionManager.removeExtension(unid);
        });
    }
};
//# sourceMappingURL=extensions.js.map