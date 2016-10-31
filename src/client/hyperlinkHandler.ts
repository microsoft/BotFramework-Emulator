import { shell } from 'electron';

export function navigate(url: string) {
    const lowcase = url.toLowerCase();
    if (lowcase.startsWith('http://') || lowcase.startsWith('https://')) {
        shell.openExternal(url, { activate: true });
    } else if (lowcase.startsWith("emulator://")) {
        // TODO: dispatch internally
    } else {
        // Ignore
    }
}
