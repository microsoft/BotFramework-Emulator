import { IActivity } from './activityTypes';


export interface IPersistentBotSettings {
    botUrl: string;
    msaAppId: string;
    msaPassword: string;
}

export interface IPersistentBotStoreSettings {
    bots: IPersistentBotSettings[];
}

export interface IBotConversation {
    conversationId: string;
    token: string;
    expires_in: number;
    streamUrl?: string;
    activities: IActivity[];
}

export interface IBot extends IPersistentBotSettings {
    conversation: IBotConversation;
}

export class BotStore {
    bots: {[botKey: string]: IBot} = {};

    makeBotKey(botSettings: IPersistentBotSettings) {
        return `${botSettings.botUrl || ''}-${botSettings.msaAppId || ''}-${botSettings.msaPassword || ''}`;
    }

    addBot(botSettings: IPersistentBotSettings) {
        let bot: IBot = Object.assign({}, botSettings);
        let botKey = this.makeBotKey(botSettings);
        this.bots[botKey] = bot;
    }

    getBot(botSettings: IPersistentBotSettings): IBot {
        let botKey = this.makeBotKey(botSettings);
        return this.bots[botKey];
    }

    updateBot(oldBotSettings: IPersistentBotSettings, newBotSettings: IPersistentBotSettings) {
        let oldBotKey = this.makeBotKey(oldBotSettings);
        let newBotKey = this.makeBotKey(newBotSettings);
        if (oldBotKey !== newBotKey) {
            this.bots[newBotKey] = this.bots[oldBotKey];
            this.bots[oldBotKey] = undefined;
        }
    }

    deleteBot(botSettings: IPersistentBotSettings) {
        let botKey = this.makeBotKey(botSettings);
        this.bots[botKey] = undefined;
    }
}
