import { applyMiddleware, combineReducers, createStore } from 'redux';
import promiseMiddleware from 'redux-promise-middleware';
// import SockJS from 'sockjs-client';

// import IPCRendererWebSocket from 'electron-ipcrenderer-websocket';
// import WebSocketActionBridge from 'redux-websocket-action-bridge';

import editor from './Reducer/editor';
import server from './Reducer/server';

const electron = window.process && window.process.versions.electron;

const createStoreWithMiddleware = applyMiddleware(
    promiseMiddleware(),
    // WebSocketActionBridge(
    //     () => {
    //         return electron ?
    //             new IPCRendererWebSocket('@@electron')
    //         :
    //             new SockJS('/ws');
    //     },
    //     {
    //         autoUnfold: true
    //     }
    // ),
    // store => next => action => {
    //     if (action.type === '@@websocket/OPEN') {
    //         store.dispatch({
    //             type: '@@websocket/SEND',
    //             payload: {
    //                 type: 'SERVER/PING'
    //             }
    //         });
    //     }

    //     return next(action);
    // }
)(createStore);

const DEFAULT_STATE = {};

export default createStoreWithMiddleware(combineReducers({
    editor,
    server
}));
