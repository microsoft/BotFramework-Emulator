import * as events from 'events';
import * as Electron from 'electron';
import { Settings } from '../types/settingsTypes';


export const settingsChange = new events.EventEmitter();

export var settings: Settings;

export const startup = () => {
    // TEST ONLY: activate a bot
    settingsChange.addListener('configure', () => {
        if (settings.activeBot.length === 0 && settings.bots.length > 0) {
            setTimeout(() => {
                change('ActiveBot_Set', { botId: settings.bots[0].botId });
            }, 100);
        }
    });

    // Listen for new settings from the server.
    Electron.ipcRenderer.on('configure', (event, ...args) => {
        settings = new Settings(args[0][0]);
        // Let client-side listeners know settings changed.
        settingsChange.emit('configure');
    });

    // Let the server know we're done starting up.
    Electron.ipcRenderer.send('started');

    // TEST ONLY: Add a bot
    change('Bots_AddBot', {
        bot: {
            botUrl: 'http://localhost:8023/api/MessagesV3'
        }
    });
}

/**
 * Sends settings change requests to the server.
 */
export const change = (action: string, state) => {
    Electron.ipcRenderer.send('change', action, state);
}
