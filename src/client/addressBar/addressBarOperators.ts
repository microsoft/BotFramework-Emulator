import { getStore, getSettings, ISettings } from '../settings';
import { Settings as ServerSettings } from '../../types/serverSettingsTypes';
import { AddressBarActions, ConversationActions, ServerSettingsActions } from '../reducers';
import { IBot, newBot } from '../../types/botTypes';
import * as log from '../log';


export class AddressBarOperators {
    static getMatchingBots(text: string, bots: IBot[]): IBot[] {
        const settings = getSettings();
        text = text || settings.addressBar.text;
        bots = bots || settings.serverSettings.bots;
        if (text.length === 0)
            return bots;
        const lower = text.toLowerCase();
        return bots.filter(bot => bot.botUrl.toLowerCase().includes(lower));
    }

    static findMatchingBotForUrl(text: string, bots: IBot[]): IBot {
        const settings = getSettings();
        text = text || settings.addressBar.text;
        bots = bots || settings.serverSettings.bots;
        let bot: IBot = null;
        if (bots && text && text.length) {
            const lower = text.toLowerCase();
            bot = bots.find(bot => lower === bot.botUrl.toLowerCase());
        }
        return bot;
    }

    static selectBotForUrl(text: string, bots: IBot[]): IBot {
        const bot = AddressBarOperators.findMatchingBotForUrl(text, bots);
        AddressBarActions.selectBot(bot);
        return bot;
    }

    static selectBot(bot: IBot) {
        AddressBarActions.selectBot(bot);
    }

    static clearMatchingBots() {
        AddressBarActions.setMatchingBots([]);
    }

    static addOrUpdateBot(bot: IBot) {
        const settings = getSettings();
        if (settings.addressBar.selectedBot && settings.addressBar.selectedBot.botId === bot.botId) {
            AddressBarActions.selectBot(bot);
        }
        ServerSettingsActions.remote_addOrUpdateBot(bot);
    }

    static setMatchingBots(bots: IBot[]) {
        AddressBarActions.setMatchingBots(bots);
    }

    static updateMatchingBots(text: string, bots: IBot[]): IBot[] {
        const settings = getSettings();
        text = text || settings.addressBar.text;
        bots = bots || settings.serverSettings.bots;
        const matchingBots = AddressBarOperators.getMatchingBots(text, bots);
        AddressBarActions.setMatchingBots(matchingBots);
        return matchingBots;
    }

    static setText(text: string) {
        AddressBarActions.setText(text);
    }

    static deleteBot(botId: string) {
        const settings = getSettings();
        if (botId === settings.serverSettings.activeBot) {
            ServerSettingsActions.remote_setActiveBot('');
        }
        ServerSettingsActions.remote_deleteBot(botId);
    }

    static activateBot(bot: IBot) {
        ServerSettingsActions.remote_setActiveBot(bot.botId);
    }
}
