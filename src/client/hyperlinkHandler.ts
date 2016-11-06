import { shell } from 'electron';
import * as URL from 'url';
import * as QueryString from 'querystring';
import { InspectorActions } from './reducers';
import { deselectActivity } from './mainView';


export function navigate(url: string) {
    try {
        const parsed = URL.parse(url);
        if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
            shell.openExternal(url, { activate: true });
        } else if (parsed.protocol === "emulator:") {
            if (parsed.host === 'inspect') {
                deselectActivity();
                const args = QueryString.parse(parsed.query);
                const base64 = args['obj'];
                const json = new Buffer(base64, 'base64').toString('utf8');
                const obj = JSON.parse(json);
                InspectorActions.setSelectedObject(obj);
            }
        } else {
            // Ignore
        }
    } catch (e) {
        console.warn(e);
    }
}
