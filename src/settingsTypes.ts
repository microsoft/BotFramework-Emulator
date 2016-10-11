import { IPersistentDirectLineSettings, IDirectLineState, directLineDefault } from './directLine/directLineTypes';
import { IPersistentFrameworkSettings, IFrameworkState, frameworkDefault } from './framework/frameworkTypes';


export interface IPersistentSettings {
    directline: IPersistentDirectLineSettings,
    framework: IPersistentFrameworkSettings,
    bots
}

export interface ISettings {
    // Persistent values
    directLineSettings: IDirectLineState,
    frameworkSettings: IFrameworkState
    // Transient values
    //locale: string,
    //username: string,
    //conversations: string[],
    //memberCount: number
}

export const settingsDefault: ISettings = {
    directLineSettings: directLineDefault,
    frameworkSettings: frameworkDefault
}

