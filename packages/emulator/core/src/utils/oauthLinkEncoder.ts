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
import Attachment from '../types/attachment';
import BotEmulator from '../botEmulator';
import { StringProvider } from './stringProvider';

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

  public async resolveOAuthCards(activity: GenericActivity): Promise<boolean> {
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
          const link = await this.getSignInLink(oauthCard.connectionName, codeChallenge);
          cardAction.value = link;
          cardAction.type = 'openUrl';
        }
      }
    }
    return true;
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

  private async getSignInLink(connectionName: string, codeChallenge: string): Promise<string> {
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
    let state = Buffer.from(serializedState).toString('base64');
    const headers = {
      'Authorization': this.authorizationHeader
    };

    const url = 'https://api.botframework.com/api/botsignin/GetSignInUrl?state=' +
      state + '&emulatorUrl=' + this.emulatorUrl + '&code_challenge=' + codeChallenge;

    const response = await fetch(url, {
      headers,
      method: 'GET'
    });
    const link = await response.text();
    return OAuthLinkEncoder.OAuthUrlProtocol + '//' + link + '&&&' + this.conversationId;
  }
}
