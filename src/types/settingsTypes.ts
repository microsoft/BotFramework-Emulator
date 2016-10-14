import { IBot } from './botTypes';


export interface IDirectLineState {
    port: number;
}

export interface IFrameworkState {
    port: number;
}

export const directLineDefault: IDirectLineState = {
    port: 9001
}

export const frameworkDefault: IFrameworkState = {
    port: 9002
}

export const directLineEmpty: IDirectLineState = {
    port: 0
}

export const frameworkEmpty: IFrameworkState = {
    port: 0
}



export interface ISettings {
    directLine?: IDirectLineState,
    framework?: IFrameworkState,
    bots?: IBot[],
    activeBot?: string
}

export class Settings {
    directLine: IDirectLineState;
    framework: IFrameworkState;
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
        return this.bots.find(value => value.botId == botId);
    }
}

export const settingsDefault: ISettings = {
    directLine: directLineDefault,
    framework: frameworkDefault,
    bots: [],
    activeBot: ''
};

export const settingsEmpty: ISettings = {
    directLine: directLineEmpty,
    framework: frameworkEmpty,
    bots: [],
    activeBot: ''
};

