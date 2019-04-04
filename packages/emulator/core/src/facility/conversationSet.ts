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

import { EventEmitter } from 'events';

import { User } from '@bfemulator/sdk-shared';

import { BotEmulator } from '../botEmulator';
import uniqueId from '../utils/uniqueId';

import BotEndpoint from './botEndpoint';
import Conversation from './conversation';

/**
 * A set of conversations with a bot.
 */
export default class ConversationSet extends EventEmitter {
  public conversations: { [conversationId: string]: Conversation } = {};

  // TODO: May be we want to move "bot" back to the constructor
  public newConversation(
    botEmulator: BotEmulator,
    botEndpoint: BotEndpoint,
    user: User,
    conversationId = uniqueId()
  ): Conversation {
    const conversation = new Conversation(botEmulator, botEndpoint, conversationId, user);
    // This should always result in a livechat being opened
    // unless there is already a livechat or transcript queued
    // we add the "|livechat" string to the end of the conversationId
    // so the emulator knows to open a new tab in the UI
    if (!/(\|livechat|\|transcript)/.test(conversation.conversationId)) {
      conversation.conversationId += '|livechat';
    }
    this.conversations[conversation.conversationId] = conversation;
    this.emit('new', conversation);

    return conversation;
  }

  public conversationById(conversationId: string): Conversation {
    return this.conversations[conversationId];
  }

  public getConversationIds(): string[] {
    return Object.keys(this.conversations);
  }

  public deleteConversation(conversationId: string): boolean {
    return delete this.conversations[conversationId];
  }

  public getConversations(): Conversation[] {
    return Object.keys(this.conversations).map(id => this.conversations[id]);
  }
}
