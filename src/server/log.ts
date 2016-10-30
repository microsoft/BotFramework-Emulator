import { mainWindow } from './main';

interface IQueuedMessage {
    method: string,
    message: any,
    args: any[]
}

let queuedMessages:IQueuedMessage[] = [];
let queueTimerSet = false;

const canLogMessages = () => mainWindow && mainWindow.webContents;

const setQueueTimer = () => {
    if (!queueTimerSet) {
        queueTimerSet = true;
        setTimeout(() => {
            queueTimerSet = false;
            trySendQueuedMessages();
        }, 100);
    }
}

const trySendQueuedMessages = () => {
    if (canLogMessages()) {
        queuedMessages.forEach((entry) => {mainWindow.webContents.send(entry.method, entry.message, ...entry.args)});
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
        mainWindow.webContents.send('log-log', message, ...args);
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
        mainWindow.webContents.send('log-info', message, ...args);
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
        mainWindow.webContents.send('log-trace', message, ...args);
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
        mainWindow.webContents.send('log-debug', message, ...args);
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
        mainWindow.webContents.send('log-warn', message, ...args);
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
        mainWindow.webContents.send('log-error', message, ...args);
    } else {
        queueMessage({
            method: 'log-error',
            message,
            args
        });
    }
}
