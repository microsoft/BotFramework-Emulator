import { mainWindow } from './main';

export const log = (message: any, ...args: any[]) => {
    mainWindow.webContents.send('log-log', message, ...args);
}
export const info = (message: any, ...args: any[]) => {
    mainWindow.webContents.send('log-info', message, ...args);
}
export const trace = (message: any, ...args: any[]) => {
    mainWindow.webContents.send('log-trace', message, ...args);
}
export const debug = (message: any, ...args: any[]) => {
    mainWindow.webContents.send('log-debug', message, ...args);
}
export const warn = (message: any, ...args: any[]) => {
    mainWindow.webContents.send('log-warn', message, ...args);
}
export const error = (message: any, ...args: any[]) => {
    mainWindow.webContents.send('log-error', message, ...args);
}
