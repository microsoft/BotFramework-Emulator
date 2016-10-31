import { shell } from 'electron';

export function navigate(url: string) {
    if (url.startsWith("emulator://")) {
        // TODO: dispatch internally.
    } else {
        shell.openExternal(url, { activate: true });
    }
}
