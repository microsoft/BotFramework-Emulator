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

import * as Attachments from '../types/attachmentTypes';
import { uniqueId } from '../shared/utils';
import * as request from 'request';
import * as http from 'http';
import { IGenericActivity } from '../types/activityTypes';
// var CryptoJS = require("crypto-js"); 
const utf8 = require('utf8');
const btoa = require('btoa');
var shajs = require('sha.js');

export class OAuthLinkEncoder {
    public static OAuthUrlProtocol: string = "oauthlink:";
    public static CodeVerifier: string; 
    public static EmulateOAuthCards: boolean = false;

    private emulatorUrl: string;
    private authorizationHeader: string;
    private activity: IGenericActivity; 
    private conversationId: string;
    private displayNoTunnelingError: () => void;

    constructor(emulatorUrl: string, authorizationHeader: string, activity: IGenericActivity, conversationId: string, displayNoTunnelingError: () => void) {
        this.emulatorUrl = emulatorUrl;
        this.authorizationHeader = authorizationHeader;
        this.activity = activity;
        this.conversationId = conversationId;
        this.displayNoTunnelingError = displayNoTunnelingError;
    }

    public resolveOAuthCards(activity: IGenericActivity): Promise<any> {
        return new Promise<any>((resolve: (value?: any) => void, reject: (reason?: any) => void) =>
        {
            let waiting = false;
            if (activity && activity.attachments && activity.attachments.length == 1 && activity.attachments[0].contentType === Attachments.AttachmentContentTypes.oAuthCard) {
                let oauthCard: Attachments.IOAuthCard = activity.attachments[0].content as Attachments.IOAuthCard;
                if(oauthCard.buttons && oauthCard.buttons.length == 1) {
                    let cardAction = oauthCard.buttons[0];
                    if(cardAction.type === 'signin' && !cardAction.value && !OAuthLinkEncoder.EmulateOAuthCards)
                    {
                        waiting = true;
                        let codeChallenge = OAuthLinkEncoder.generateCodeVerifier();
                        this.getSignInLink(oauthCard.connectionName, codeChallenge, (link: string) => {
                            if (link) {
                                cardAction.value =  OAuthLinkEncoder.OAuthUrlProtocol + '//' + link;
                            }
                            resolve(true);
                        });
                        cardAction.type = 'openUrl';
                    }
                }
            }
            
            if (!waiting) {
                resolve(true);
            }
        });
    }

    // from https://tools.ietf.org/html/rfc7636#page-17
    /*
    private static base64url(source: string): string {
        // Encode in classical base64
        let encodedSource = CryptoJS.enc.Base64.stringify(source);

        // Remove padding equal characters
        encodedSource = encodedSource.replace(/=+$/, '');

        // Replace characters according to base64url specifications
        encodedSource = encodedSource.replace(/\+/g, '-');
        encodedSource = encodedSource.replace(/\//g, '_');

        return encodedSource;
    }
    */

    // Generates a new codeVerifier and returns the codeChallenge hash 
    // This is for the PKCE validation flow with OAuth
    public static generateCodeVerifier(): string {
        this.CodeVerifier = uniqueId(32);

        let codeChallenge = shajs('sha256').update(this.CodeVerifier).digest('hex');

        return codeChallenge;
    }

    private getSignInLink(connectionName: string, codeChallenge:string, cb: (link: string) => void) {
        if (!this.emulatorUrl) {
            this.displayNoTunnelingError();
        }

        let tokenExchangeState =
        {
            ConnectionName: connectionName,
            Conversation:
            {
                ActivityId: this.activity.id,
                Bot: this.activity.from,       // Activity is from the bot to the user
                ChannelId: this.activity.channelId ? this.activity.channelId : 'emulator',
                Conversation: this.activity.conversation ? this.activity.conversation : { id: this.conversationId }, 
                ServiceUrl: this.activity.serviceUrl,
                User: this.activity.recipient
            }
        };

        let serializedState = JSON.stringify(tokenExchangeState);
        let utfStr = utf8.encode(serializedState);
        var state = btoa(utfStr);
        
        let options: request.OptionsWithUrl = {
            url: `https://api.botframework.com/api/botsignin/GetSignInUrl?state=${state}&emulatorUrl=${this.emulatorUrl}&code_challenge=${codeChallenge}`,
            method: "GET",
            headers: {
                'Authorization': this.authorizationHeader
            }
        };

        let responseCallback = (err, resp: http.IncomingMessage, body) => {
            cb(body as string);
        };

        request(options, responseCallback);
    }
}

