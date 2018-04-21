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
import * as URL from 'url';
import { IGenericActivity } from '../types/activityTypes';
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

    constructor(emulatorUrl: string, authorizationHeader: string, activity: IGenericActivity) {
        this.emulatorUrl = emulatorUrl;
        this.authorizationHeader = authorizationHeader;
        this.activity = activity;
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
                            
                                // Add a (with code) button that does not have the code_challenge
                                var codeLink = link;
                                var parsed = URL.parse(link);
                                var params = this.getQueryParams(parsed.search);
                                var redirectParam = params['redirectUri'];
                                if(redirectParam) {
                                    var decoded = decodeURIComponent(redirectParam);
                                    var redirect = URL.parse(decoded);
                                    var redirectParams = this.getQueryParams(redirect.search);
                                    delete redirectParams['code_challenge'];
                                    var newRedirectLink = this.setSearchParams(redirect, redirectParams);
                                    var encoded = encodeURIComponent(newRedirectLink);
                                    params['redirectUri'] = encoded;
                                    codeLink = this.setSearchParams(parsed, params);
                                }

                                activity.attachments.push({
                                    contentType: Attachments.AttachmentContentTypes.oAuthCard,
                                    content: {
                                        text: '',
                                        connectionName: oauthCard.connectionName,
                                        buttons: [
                                            {
                                                type: 'openUrl',
                                                value: OAuthLinkEncoder.OAuthUrlProtocol + '//' + codeLink,
                                                title: cardAction.title + ' (with code)'
                                            }
                                        ]    
                                    }
                                });
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

    // Generates a new codeVerifier and returns the codeChallenge hash 
    // This is for the PKCE validation flow with OAuth
    public static generateCodeVerifier(): string {
        this.CodeVerifier = uniqueId(32);

        let codeChallenge = shajs('sha256').update(this.CodeVerifier).digest('hex');

        return codeChallenge;
    }

    private getSignInLink(connectionName: string, codeChallenge:string, cb: (link: string) => void) {
        let tokenExchangeState =
        {
            ConnectionName: connectionName,
            Conversation:
            {
                ActivityId: this.activity.id,
                Bot: this.activity.from,       // Activity is from the bot to the user
                ChannelId: this.activity.channelId,
                Conversation: this.activity.conversation,
                ServiceUrl: this.activity.serviceUrl,
                User: this.activity.recipient
            }
        };

        let serializedState = JSON.stringify(tokenExchangeState);
        let utfStr = utf8.encode(serializedState);
        var state = btoa(utfStr);
        
        let options: request.OptionsWithUrl = {
            //url: `https://api.botframework.com/api/botsignin/GetSignInUrl?state=${state}&emulatorUrl=${this.emulatorUrl}&code_challenge=${codeChallenge}`,
            url: `http://localhost:8000/api/botsignin/GetSignInUrl?state=${state}&emulatorUrl=${this.emulatorUrl}&code_challenge=${codeChallenge}`,
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

    private getQueryParams(query: string): any {
        var result = {};
        if(query.startsWith('?')) {
            query = query.substr(1);
        }
        query.split("&").forEach(function(part) {
            var eq = part.indexOf("=");
            var item = part.substr(eq+1);
            result[part.substr(0, eq)] = item;
        });
        return result;
    }

    private setSearchParams(url: URL.Url, newParams: any): string {
        var newSearch = '';
        var first = true;
        for(var p in newParams) {
            newSearch += (first ? '?' : '&') + p + '=' + newParams[p];
            first = false;
        }
        url.search =  newSearch;
        return URL.format(url);
    }
}

