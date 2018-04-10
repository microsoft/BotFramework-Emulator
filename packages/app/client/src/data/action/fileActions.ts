import { FileInfo } from '@BFEmulator/app-shared';

export enum FileActions {
    setRoot = 'file/setRoot',
    add = 'file/add',
    remove = 'file/remove'
}

export function addFile(payload: FileInfo) {
    return {
        type: FileActions.add,
        payload
    };
}

export function removeFile(path: string) {
    return {
        type: FileActions.remove,
        payload: { path }
    }
}

export function setRoot(path: string) {
    return {
        type: FileActions.setRoot,
        payload: { path }
    }
}