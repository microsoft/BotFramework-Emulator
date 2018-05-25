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

import GenericActivity from '../types/activity/generic';

import AttachmentContentTypes from '../types/attachment/contentTypes';
import OAuthCard from '../types/card/oAuth';
import uniqueId from '../utils/uniqueId';
import * as request from 'request';
import * as http from 'http';
import Attachment from '../types/attachment';
import BotEmulator from '../botEmulator';
import { StringProvider } from './stringProvider';

const utf8 = require('utf8');
const btoa = require('btoa');
const shajs = require('sha.js');

export default class OAuthLinkEncoder {
  public static OAuthUrlProtocol: string = 'oauthlink:';
  public static EmulateOAuthCards: boolean = false;

  private emulatorUrl: string;
  private authorizationHeader: string;
  private activity: GenericActivity;
  private conversationId: string;
  private botEmulator: BotEmulator;

  constructor(botEmulator: BotEmulator, emulatorUrl: string | StringProvider, authorizationHeader: string,
              activity: GenericActivity, conversationId: string) {
    this.emulatorUrl = emulatorUrl ? (typeof emulatorUrl === 'string') ? emulatorUrl : emulatorUrl() : null;
    this.authorizationHeader = authorizationHeader;
    this.activity = activity;
    this.conversationId = conversationId;
    this.botEmulator = botEmulator;
  }

  public resolveOAuthCards(activity: GenericActivity): Promise<any> {
    return new Promise<any>((resolve: (value?: any) => void, reject: (reason?: any) => void) => {
      let waiting = false;
      if (this.conversationId &&
        activity &&
        activity.attachments &&
        activity.attachments.length === 1
        && activity.attachments[0].contentType === AttachmentContentTypes.oAuthCard) {
        let codeChallenge = this.generateCodeVerifier(this.conversationId);
        let attachment: Attachment = activity.attachments[0] as Attachment;
        let oauthCard: OAuthCard = attachment.content as OAuthCard;
        if (oauthCard.buttons && oauthCard.buttons.length === 1) {
          let cardAction = oauthCard.buttons[0];
          if (cardAction.type === 'signin' && !cardAction.value && !OAuthLinkEncoder.EmulateOAuthCards) {
            waiting = true;
            this.getSignInLink(oauthCard.connectionName, codeChallenge, (link: string) => {
              if (link) {
                cardAction.value = OAuthLinkEncoder.OAuthUrlProtocol + '//' + link + '&&&' +
                  this.conversationId;
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
  public generateCodeVerifier(conversationId: string): string {
    let codeVerifier = uniqueId();

    const conversation = this.botEmulator.facilities.conversations.conversationById(conversationId);
    conversation.codeVerifier = codeVerifier;

    let codeChallenge: string = shajs('sha256').update(codeVerifier).digest('hex');

    return codeChallenge;
  }

  private getSignInLink(connectionName: string, codeChallenge: string, cb: (link: string) => void) {
    let tokenExchangeState = {
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
    let state = btoa(utfStr);

    let options: request.OptionsWithUrl = {
      url: 'https://api.botframework.com/api/botsignin/GetSignInUrl?state=' +
      state + '&emulatorUrl=' + this.emulatorUrl + '&code_challenge=' + codeChallenge,
      method: 'GET',
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
