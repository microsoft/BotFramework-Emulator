import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { MainView } from './mainView';
import * as Settings from './settings';
import { uniqueId } from '../utils';
import { navigate } from './hyperlinkHandler';


window.onerror = (message: string, filename?: string, lineno?: number, colno?: number, error?:Error) => {
    console.error(message, filename, lineno, colno, error);
    return true; // prevent default handler
}

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

window.open = (url: string): any => {
    navigate(url);
}


Settings.startup();

ReactDOM.render(<MainView />, document.getElementById('mainview'));
