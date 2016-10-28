import { LogView, Severity } from './logView';


export function clear() {
    LogView.clear();
}
export function log(message: any, ...args: any[]) {
    LogView.add(Severity.log, message, ...args);
}
export function info(message: any, ...args: any[]) {
    LogView.add(Severity.info, message, ...args);
}
export function trace(message: any, ...args: any[]) {
    LogView.add(Severity.trace, message, ...args);
}
export function debug(message: any, ...args: any[]) {
    LogView.add(Severity.debug, message, ...args);
}
export function warn(message: any, ...args: any[]) {
    LogView.add(Severity.warn, message, ...args);
}
export function error(message: any, ...args: any[]) {
    LogView.add(Severity.error, message, ...args);
}
