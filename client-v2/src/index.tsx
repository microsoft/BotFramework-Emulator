import { Provider } from 'react-redux';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import Main from './ui/shell/main';
import store from './data/store';
import registerServiceWorker from './registerServiceWorker';

import * as Settings from './v1/settings';
import interceptError from './interceptError';
import interceptHyperlink from './interceptHyperlink';
import setupContextMenu from './setupContextMenu';

interceptError();
interceptHyperlink();
setupContextMenu();
Settings.startup();

const { webFrame } = window['require']('electron');

webFrame.setZoomLevel(1);
webFrame.setZoomFactor(1);
webFrame.registerURLSchemeAsPrivileged('emulator');

ReactDOM.render(
    <Provider store={ store }>
        { React.createElement(Main as any) }
    </Provider>,
    document.getElementById('root')
);

registerServiceWorker();
