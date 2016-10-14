import * as events from 'events';
import * as Electron from 'electron';
import { Settings } from '../types/settingsTypes';


export const settingsChange = new events.EventEmitter();

export var settings;

export const startup = () => {
    settingsChange.addListener('configure', () => {
        // TEST ONLY: activate a bot
        if (settings.activeBot.length == 0 && settings.bots.length > 0) {
            setTimeout(() => {
                change('ActiveBot_Set', { botId: settings.bots[0].botId });
            }, 100);
        }
    });

    Electron.ipcRenderer.on('configure', (event, ...args) => {
        settings = new Settings(args[0][0]);
        console.log("configure: ", settings);
        settingsChange.emit('configure');
    });

    Electron.ipcRenderer.send('started');

    // TEST ONLY: Add a bot
    change('Bots_AddBot', {
        bot: {
            botUrl: 'http://localhost:3978/api/messages'
        }
    });
}

export const change = (action: string, args) => {
    Electron.ipcRenderer.send('change', action, args);
}
