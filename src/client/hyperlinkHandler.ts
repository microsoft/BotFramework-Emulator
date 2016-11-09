import { shell } from 'electron';
import * as URL from 'url';
import * as QueryString from 'querystring';
import { InspectorActions } from './reducers';
import { deselectActivity } from './mainView';
import * as log from './log';


export function navigate(url: string) {
    try {
        const parsed = URL.parse(url);
        if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
            shell.openExternal(url, { activate: true });
        } else if (parsed.protocol === "emulator:") {
            if (parsed.host === 'inspect') {
                try {
                    deselectActivity();
                    const args = QueryString.parse(parsed.query);
                    const encoded = args['obj'];
                    const json = decodeURIComponent(encoded);
                    const obj = JSON.parse(json);
                    InspectorActions.setSelectedObject(obj);
                } catch (e) {
                    log.error(e.message);
                    throw e;
                }
            }
        } else {
            // Ignore
        }
    } catch (e) {
        console.error(e);
    }
}
