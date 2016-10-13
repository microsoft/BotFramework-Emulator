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

var configuring = false;

export const startup = () => {
    SettingsStore.startup();

    SettingsStore.store.subscribe(() => {
        const state = SettingsStore.store.getState();
        console.log('settings changed', JSON.stringify(state));

        // TEST ONLY: activate a bot
        if (state.activeBot.length == 0 && state.bots.length > 0) {
            setTimeout(() => {
                change('ActiveBot_Set', { botId: state.bots[0].botId });
            }, 100);
        }
    });

    Electron.ipcRenderer.on('configure', (event, args) => {
        configuring = true;
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
            state: { bots: settings.bots }
        });
        SettingsStore.store.dispatch({
            type: 'ActiveBot_SetState',
            state: { botId: settings.activeBot }
        });
        configuring = false;
    });

    Electron.ipcRenderer.send('started');

    // TEST ONLY: Add a bot
    change('Bots_AddBot', {
        botUrl: 'http://localhost:3978/api/messages'
    });
}

export const change = (action: string, args) => {
    if (configuring === true) {
        console.error('Error: config changes cannot be issued to server while handling config changes from server! This would introduce an infinite change loop.');
    } else {
    }
    Electron.ipcRenderer.send('change', action, args);
}
