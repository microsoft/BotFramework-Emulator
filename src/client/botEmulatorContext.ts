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

import { IBot, newBot } from '../types/botTypes';

// BotEmulatorContext
// Handles parsing of the botemulator:// protocol handler
// To add more properties to the protocol, add properties to this class and to the setter object 
export class BotEmulatorContext {
    public endpoint: string;
    public appId: string;
    public appPassword: string;
    public locale: string;
    public enumatorHostname: string;
    public emulatorPort: string;
    public serviceUrl: string;

    private static _propertySetters: any = 
    {
        'endpoint': (context: BotEmulatorContext, x: string) => { context.endpoint = x; },
        'appid': (context: BotEmulatorContext, x: string) => { context.appId = x; },
        'apppassword': (context: BotEmulatorContext, x: string) => { context.appPassword = x; },
        'locale': (context: BotEmulatorContext, x: string) => { context.locale = x; },
        'enumatorhostname': (context: BotEmulatorContext, x: string) => { context.enumatorHostname = x; },
        'emulatorport': (context: BotEmulatorContext, x: string) => { context.emulatorPort = x; },
        'serviceurl': (context: BotEmulatorContext, x: string) => { context.serviceUrl = x; }
    };

    public constructor(encodedContext: string) {
        let decodedUri = decodeURIComponent(encodedContext);

        if (decodedUri.startsWith('?')) {
            decodedUri = decodedUri.substr(1);
        }

        if (decodedUri.startsWith('botemulator://')) {
            decodedUri = decodedUri.substr(14);

            decodedUri.split('&').forEach(p => {
                let pair = p.split('=', 2);
                if (pair && pair.length === 2) {
                    this.setProperty(pair[0], pair[1]);
                }
            });
        }
    }

    // checks if all required properties are set
    public isValid(): boolean {
        return this.endpoint && this.endpoint.length > 0;
    }

    public toBot(): IBot {
        return newBot({ botUrl: this.endpoint, msaAppId: this.appId, msaPassword: this.appPassword });
    }

    public updateBot(bot: IBot): IBot {
        return Object.assign({}, bot, {
            botUrl: this.endpoint, 
            locale: this.locale,
            msaAppId: this.appId,
            msaPassword: this.appPassword });
    }

    public matchesBot(bot: IBot): boolean {
        return BotEmulatorContext.areEqual(this.endpoint, bot.botUrl) &&
               BotEmulatorContext.areEqual(this.appId, bot.msaAppId) &&
               BotEmulatorContext.areEqual(this.appPassword, bot.msaPassword) &&
               BotEmulatorContext.areEqual(this.locale, bot.locale);
    }

    private static areEqual(a: string, b: string): boolean {
        return (!a && !b) || (a && !b && !a.length) || (b && !a && !b.length) || (a && b && a.toLowerCase() === b.toLowerCase());
    }

    private setProperty(property: string, value: string): void {
        let setter = BotEmulatorContext._propertySetters[property.toLowerCase()];
        if (setter) {
            setter(this, value);
        }
    }
}