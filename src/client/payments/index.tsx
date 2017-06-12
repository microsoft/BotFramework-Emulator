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

export = 0;     // this is required to work around a typescript bug in 2.2.1+

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { CheckoutView } from './checkoutView';
import { navigate } from '../hyperlinkHandler';

(process as NodeJS.EventEmitter).on('uncaughtException', (error) => {
    // log.error('[err-client]', error.message, error.stack);
});

window.onerror = (message: string, filename?: string, lineno?: number, colno?: number, error?:Error) => {
    // log.error('[err-client]', message, filename, lineno, colno, error);
    return true; // prevent default handler
}

const interceptClickEvent = (e: Event) => {
    let target: any = e.target;
    while (target) {
        if (target.href) {
            e.preventDefault();
            navigate(target.href);
            return;
        }
        target = target.parentNode;
    }
}

document.addEventListener('click', interceptClickEvent);

// Monkey patch window.open
window.open = (url: string): any => {
    navigate(url);
}

// Right-click context menu for edit boxes
const remote = require('electron').remote;
const Menu = remote.Menu;

const ContextMenuRW = Menu.buildFromTemplate([{
        label: 'Undo',
        role: 'undo',
    }, {
        label: 'Redo',
        role: 'redo',
    }, {
        type: 'separator',
    }, {
        label: 'Cut',
        role: 'cut',
    }, {
        label: 'Copy',
        role: 'copy',
    }, {
        label: 'Paste',
        role: 'paste',
    }
]);

const ContextMenuRO = Menu.buildFromTemplate([{
        label: 'Undo',
        role: 'undo',
        enabled: false
    }, {
        label: 'Redo',
        role: 'redo',
        enabled: false
    }, {
        type: 'separator',
    }, {
        label: 'Cut',
        role: 'cut',
        enabled: false
    }, {
        label: 'Copy',
        role: 'copy',
        enabled: false
    }, {
        label: 'Paste',
        role: 'paste',
        enabled: false
    }
]);

document.body.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    e.stopPropagation();

    let node: any = e.target;

    while (node) {
        if (node.nodeName.match(/^(input|textarea)$/i) || node.isContentEditable) {
            if (node.readOnly) {
                ContextMenuRO.popup(remote.getCurrentWindow());
            } else {
                ContextMenuRW.popup(remote.getCurrentWindow());
            }
            break;
        }
        node = node.parentNode;
    }
});

// Load main control
ReactDOM.render(<CheckoutView />, document.getElementById('checkoutView'));
