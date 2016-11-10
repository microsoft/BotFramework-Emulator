import { mainWindow } from './main';
import * as HttpStatus from "http-status-codes";
import * as Restify from 'restify';


// TEMPORARY, for A/B testing logview layout
// If you change this, also change it in client/logView.tsx
export const useTables = false;


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

export const api = (operation: string, req: Restify.Request, res: Restify.Response, request?: Object, response?: Object, text?: string) => {
    if (res.statusCode >= 400) {
        if (useTables) {
            error(
                '<-',
                makeInspectorLink(`${req.method}`, request, "Click to view request json"),
                makeInspectorLink(`${res.statusCode}`, response, `(${res.statusMessage}) Click to view response json`),
                operation,
                text);
        } else {
            error(
                '<-',
                makeInspectorLink(`${req.method}`, request, "Click to view request json"),
                makeInspectorLink(`${res.statusCode}`, response, `(${res.statusMessage}) Click to view response json`),
                operation,
                text);
        }
    } else {
        if (useTables) {
            trace(
                '<-',
                makeInspectorLink(`${req.method}`, request, "Click to view request json"),
                makeInspectorLink(`${res.statusCode}`, response, `(${res.statusMessage}) Click to view response json`),
                operation,
                text);
        } else {
            trace(
                '<-',
                makeInspectorLink(`${req.method}`, request, "Click to view request json"),
                makeInspectorLink(`${res.statusCode}`, response, `(${res.statusMessage}) Click to view response json`),
                operation,
                text);
        }
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
