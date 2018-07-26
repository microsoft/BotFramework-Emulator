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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { fileExtensionToIcon, iconDefinitionToStyle } from '@fuselab/ui-fabric/lib/themes';
/**
 * File tree data provider
 */
export class FileTreeDataProvider {
    constructor(_tree) {
        this._tree = _tree;
    }
    loadContainer(_container) {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.reject(new Error('nyi'));
        });
    }
    insertAt(_container, _node) {
        return null;
    }
    remove(_node) {
        return Promise.reject(new Error('file tree node removal NYI'));
    }
    selectNode(node) {
        this.tree.selected = node;
    }
    get root() {
        return this.tree.root;
    }
    get tree() {
        return this._tree;
    }
    get selected() {
        return this._selected;
    }
    getStyle(node) {
        if (node.node.type === 'leaf') {
            const name = node.node.name;
            const iconDefinition = fileExtensionToIcon(name, node.theme);
            const iconStyle = iconDefinitionToStyle(iconDefinition, node.theme);
            return { icon: iconStyle };
        }
        return null;
    }
}
//# sourceMappingURL=fileTreeProvider.js.map