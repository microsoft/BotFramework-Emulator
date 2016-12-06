//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

import { IBot } from '../types/botTypes';
import { IUser } from '../types/userTypes';


export interface IFrameworkSettings {
    // path to use for ngrok
    ngrokPath?: string
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
        return this.bots ? this.bots.find(value => value.botId === botId) : undefined;
    }
}

export const frameworkDefault: IFrameworkSettings = {
    ngrokPath: ''
}

export const windowStateDefault: IWindowStateSettings = {
    width: 800,
    height: 600,
    left: 100,
    top: 50
}

export const usersDefault: IUserSettings = {
    currentUserId: 'default-user',
    usersById: {
        'default-user': {
            id: 'default-user',
            name: 'User'
        }
    }
}

export const settingsDefault: ISettings = {
    framework: frameworkDefault,
    bots: [
        {
            "botId": "default-bot",
            "botUrl": "http://localhost:3978/api/messages",
            "msaAppId": "",
            "msaPassword": ""
        }
    ],
    activeBot: '',
    windowState: windowStateDefault,
    users: usersDefault
}
