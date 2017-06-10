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

import { shell } from 'electron';
import * as URL from 'url';
import * as QueryString from 'querystring';
import { InspectorActions, AddressBarActions } from './reducers';
import { getSettings, selectedActivity$ } from './settings';
import { Settings as ServerSettings } from '../types/serverSettingsTypes';
import { Emulator } from './emulator';
import { PaymentEncoder } from '../shared/paymentEncoder';
import * as log from './log';
import * as Electron from 'electron';


export function navigate(url: string) {
    try {
        const parsed = URL.parse(url);
        if (parsed.protocol === "emulator:") {
            const params = QueryString.parse(parsed.query);
            if (parsed.host === 'inspect') {
                navigateInspectUrl(params);
            } else if (parsed.host === 'appsettings') {
                navigateAppSettingsUrl(params);
            } else if (parsed.host === 'botcreds') {
                navigateBotCredsUrl(params);
            } else if (parsed.host === 'command') {
                navigateCommandUrl(params);
            }
        } else if (parsed.protocol.startsWith(PaymentEncoder.PaymentEmulatorUrlProtocol)) {
            navigatePaymentUrl(parsed.path);
        } else if (parsed.protocol.startsWith('file:')) {
            // ignore
        } else if (parsed.protocol.startsWith('javascript:')) {
            // ignore
        } else {
            shell.openExternal(url, { activate: true });
        }
    } catch (e) {
        log.error(e.message);
    }
}

function navigateInspectUrl(params: string[]) {
    try {
        const encoded = params['obj'];
        let json;
        let obj;
        try {
            json = decodeURIComponent(encoded);
        } catch (e) {
            json = encoded;
        }
        try {
            obj = JSON.parse(json);
        } catch (e) {
            obj = json;
        }
        if (obj) {
            if (obj.id) {
                selectedActivity$().next({ id: obj.id });
            } else if (obj.replyToId) {
                selectedActivity$().next({ id: obj.replyToId });
            } else {
                selectedActivity$().next({});
            }
            InspectorActions.setSelectedObject({ activity: obj });
        } else {
            selectedActivity$().next({});
        }
    } catch (e) {
        selectedActivity$().next({});
        throw e;
    }
}

function navigateAppSettingsUrl(args: string[]) {
    AddressBarActions.showAppSettings();
}

function navigateBotCredsUrl(args: string[]) {
    args = args || [];
    if (!args.length) {
        const settings = getSettings();
        const activeBotId = settings.serverSettings.activeBot;
        if (activeBotId) {
            const activeBot = new ServerSettings(settings.serverSettings).botById(activeBotId);
            AddressBarActions.selectBot(activeBot);
        }
    } else {
        // todo
    }
    AddressBarActions.showBotCreds();
}

function navigateCommandUrl(params: string[]) {
    if (!params || !params['args'])
        return;
    const json = decodeURIComponent(params['args']);
    const args = JSON.parse(json);
    if (typeof args ==='string' && args.includes('autoUpdater.quitAndInstall')) {
        Emulator.quitAndInstall();
    }
}

function navigatePaymentUrl(payload: string) {
    const settings = getSettings();
    Electron.ipcRenderer.send("createCheckoutWindow", {
        payload: payload,
        settings: settings,
        serviceUrl: Emulator.serviceUrl
    });
}
