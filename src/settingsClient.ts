import * as SettingsStore from './settingsStore';
import * as Electron from 'electron';

/*
const BATCH ='BATCHING_REDUCER.BATCH';

const batchActions = (actions) => {
	return { type: BATCH, payload: actions };
}

const enableBatching = (reduce) => {
	const batchingReducer = (state, action) => {
		switch (action.type) {
			case BATCH:
				return action.payload.reduce(batchingReducer, state);
			default:
				return reduce(state, action);
		}
	};
    return batchingReducer;
}
*/

export const startup = () => {
    SettingsStore.startup();

    SettingsStore.store.subscribe(() => {
        console.log('settings changed', SettingsStore.store.getState());
    });

    Electron.ipcRenderer.on('configure', (event, args) => {
        console.log("configure: ", event, args);
        const settings = args[0] as SettingsStore.ISettings;
        // TODO: use a batching reducer here.
        SettingsStore.store.dispatch({
            type: 'DirectLine_SetState',
            state: settings.directLine
        });
        SettingsStore.store.dispatch({
            type: 'Framework_SetState',
            state: settings.framework
        });
        SettingsStore.store.dispatch({
            type: 'Bots_SetState',
            bots: settings.bots
        });
        SettingsStore.store.dispatch({
            type: 'ActiveBot_SetState',
            botId: settings.activeBot
        });
    });

    Electron.ipcRenderer.send('started');

    change('Bots_AddBot', {
        botUrl: 'http://localhost:3978/api/messages'
    });
}

export const change = (action: string, args) => {
    Electron.ipcRenderer.send('change', action, args);
}
