import * as log from './v1/log';

export default function interceptError() {
    (process as NodeJS.EventEmitter).on('uncaughtException', error => {
        log.error('[err-client]', error.message, error.stack);
    });

    window.onerror = (message: string, filename?: string, lineno?: number, colno?: number, error?: Error) => {
        log.error('[err-client]', message, filename, lineno, colno, error);

        return true; // prevent default handler
    }
}
