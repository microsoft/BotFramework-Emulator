import { IBot } from './botTypes';


export interface IDirectLineSettings {
    port: number,
}

export interface IFrameworkSettings {
    port: number,
}

export const directLineDefault: IDirectLineSettings = {
    port: 9001
}

export const frameworkDefault: IFrameworkSettings = {
    port: 9002
}


export interface ISettings {
    directLine?: IDirectLineSettings,
    framework?: IFrameworkSettings,
    bots?: IBot[],
    activeBot?: string,
}

export class Settings {
    directLine: IDirectLineSettings;
    framework: IFrameworkSettings;
    bots: IBot[];
    activeBot: string;

    constructor(settings?: ISettings) {
        if (settings) {
            Object.assign(this, settings);
        }
    }

    getActiveBot = () => {
        return this.botById(this.activeBot);
    }

    botById = (botId: string) => {
        return this.bots.find(value => value.botId === botId);
    }
}

export const settingsDefault: ISettings = {
    directLine: directLineDefault,
    framework: frameworkDefault,
    bots: [],
    activeBot: ''
};
