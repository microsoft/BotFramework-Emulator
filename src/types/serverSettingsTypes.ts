import { IBot } from '../types/botTypes';
import { IUser } from '../types/userTypes';


export interface IFrameworkSettings {
    // port for emulator to listen on
    port?: number,

    // path to use for ngrok
    ngrokPath?: string,
    ngrokServiceUrl?: string,
    ngrokRunning?: boolean,

    serviceUrl?: string
}

export interface IWindowStateSettings {
    top?: number,
    left?: number,
    width?: number,
    height?: number,
}

export interface IUserSettings {
    currentUserId?: string,
    usersById?: { [id: string]: IUser }
}

export interface IPersistentSettings {
    framework?: IFrameworkSettings,
    bots?: IBot[],
    windowState?: IWindowStateSettings,
    users: IUserSettings
}

export interface ISettings extends IPersistentSettings {
    activeBot?: string
}

export class Settings implements ISettings {
    public framework: IFrameworkSettings;
    public bots: IBot[];
    public windowState: IWindowStateSettings;
    public users: IUserSettings;
    public activeBot: string;

    constructor(settings?: ISettings) {
        Object.assign(this, settings);
    }

    public getActiveBot(): IBot {
        return this.botById(this.activeBot);
    }

    public botById(botId: string): IBot {
        return this.bots.find(value => value.botId === botId);
    }
}

export const frameworkDefault: IFrameworkSettings = {
    port: 9002,
    ngrokPath: '',
    serviceUrl: ''
}

export const windowStateDefault: IWindowStateSettings = {
    width: 800,
    height: 600,
    left: 100,
    top: 50
}

export const usersDefault: IUserSettings = {
    currentUserId: '12345',
    usersById: {
        '12345': {
            id: '12345',
            name: 'User 1'
        }
    }
}

export const settingsDefault: ISettings = {
    framework: frameworkDefault,
    bots: [],
    activeBot: '',
    windowState: windowStateDefault,
    users: usersDefault
}
