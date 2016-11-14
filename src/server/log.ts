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

import { mainWindow } from './main';
import * as HttpStatus from "http-status-codes";
import * as Restify from 'restify';


export const logReady = (isReady: boolean) => _logReady = isReady;
let _logReady = false;

interface IQueuedMessage {
    method: string,
    message: any,
    args: any[]
}

let queuedMessages: IQueuedMessage[] = [];
let queueTimerSet = false;

const canLogMessages = () => _logReady;

const setQueueTimer = () => {
    if (!queueTimerSet) {
        queueTimerSet = true;
        setTimeout(() => {
            queueTimerSet = false;
            trySendQueuedMessages();
        }, 100);
    }
}

const sendMessage = (method: string, message: any, ...args) => {
    mainWindow.webContents.send(method, message, ...args);
}

const trySendQueuedMessages = () => {
    if (canLogMessages()) {
        queuedMessages.forEach((entry) => sendMessage(entry.method, entry.message, ...entry.args));
    } else {
        setQueueTimer();
    }
}

const queueMessage = (entry) => {
    queuedMessages.push(entry);
    setQueueTimer();
}

export const log = (message: any, ...args: any[]) => {
    if (canLogMessages()) {
        sendMessage('log-log', message, ...args);
    } else {
        queueMessage({
            method: 'log-log',
            message,
            args
        });
    }
}
export const info = (message: any, ...args: any[]) => {
    if (canLogMessages()) {
        sendMessage('log-info', message, ...args);
    } else {
        queueMessage({
            method: 'log-info',
            message,
            args
        });
    }
}
export const trace = (message: any, ...args: any[]) => {
    if (canLogMessages()) {
        sendMessage('log-trace', message, ...args);
    } else {
        queueMessage({
            method: 'log-trace',
            message,
            args
        });
    }
}
export const debug = (message: any, ...args: any[]) => {
    if (canLogMessages()) {
        sendMessage('log-debug', message, ...args);
    } else {
        queueMessage({
            method: 'log-debug',
            message,
            args
        });
    }
}
export const warn = (message: any, ...args: any[]) => {
    if (canLogMessages()) {
        sendMessage('log-warn', message, ...args);
    } else {
        queueMessage({
            method: 'log-warn',
            message,
            args
        });
    }
}
export const error = (message: any, ...args: any[]) => {
    if (canLogMessages()) {
        sendMessage('log-error', message, ...args);
    } else {
        queueMessage({
            method: 'log-error',
            message,
            args
        });
    }
}

export const makeLinkMessage = (text: string, link: string, title?: string): any => {
    return {
        messageType: 'link',
        text,
        link,
        title
    }
}

export const ngrokConfigurationLink = (text: string) => {
    return makeLinkMessage(text, 'emulator://appsettings?tab=NgrokConfig');
}

export const api = (operation: string, req: Restify.Request, res: Restify.Response, request?: Object, response?: Object, text?: string) => {
    if (res.statusCode >= 400) {
        error(
            '<-',
            makeInspectorLink(`${req.method}`, request),
            makeInspectorLink(`${res.statusCode}`, response, `(${res.statusMessage})`),
            operation,
            text);
    } else {
        info(
            '<-',
            makeInspectorLink(`${req.method}`, request),
            makeInspectorLink(`${res.statusCode}`, response, `(${res.statusMessage})`),
            operation,
            text);
    }
}

export const makeInspectorLink = (text: string, obj: any, title?: string): any => {
    if (typeof (obj) === 'object' || Array.isArray(obj)) {
        const json = JSON.stringify(obj);
        return makeLinkMessage(text, `emulator://inspect?obj=${encodeURIComponent(json)}`, title);
    } else {
        return text;
    }
}
