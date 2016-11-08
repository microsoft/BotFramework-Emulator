import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { webFrame } from 'electron';
import { MainView } from './mainView';
import * as Settings from './settings';
import { uniqueId } from '../utils';
import { navigate } from './hyperlinkHandler';
import * as log from './log';


process.on('uncaughtException', (error) => {
    log.error('[err-client]', error.message, error.stack);
});

window.onerror = (message: string, filename?: string, lineno?: number, colno?: number, error?:Error) => {
    log.error('[err-client]', message, filename, lineno, colno, error);
    return true; // prevent default handler
}

webFrame.setZoomLevel(1);
webFrame.setZoomLevelLimits(1, 1);
webFrame.setZoomFactor(1);
webFrame.registerURLSchemeAsPrivileged('emulator');

const interceptClickEvent = (e: Event) => {
    e.preventDefault();
    let target: any = e.target;
    while (target) {
        if (target.href) {
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


Settings.startup();

ReactDOM.render(<MainView />, document.getElementById('mainview'));
