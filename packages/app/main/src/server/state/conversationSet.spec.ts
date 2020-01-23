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

import { ConversationSet } from './conversationSet';

describe('The conversationSet', () => {
  let conversationSet: ConversationSet;

  beforeEach(() => {
    conversationSet = new ConversationSet();
  });

  it('should create a new conversation and append "{mode}" to the conversationId', () => {
    const conversation = conversationSet.newConversation(
      {} as any,
      { botId: 'someBot' } as any,
      { id: 'user', name: 'User1' },
      'conversationId',
      'debug'
    );
    expect(conversation.conversationId).toBe('conversationId|debug');
  });

  it('should not append "|livechat" to the conversationId when the conversationId contains "|transcript"', () => {
    const conversation = conversationSet.newConversation(
      {} as any,
      { botId: 'someBot' } as any,
      { id: 'user', name: 'User1' },
      'conversationId|transcript'
    );
    expect(conversation.conversationId).toBe('conversationId|transcript');
  });

  it('should retrieve the conversation by id', () => {
    const conversation = conversationSet.newConversation(
      {} as any,
      { botId: 'someBot' } as any,
      { id: 'user', name: 'User1' },
      'conversationId|transcript'
    );

    expect(conversationSet.conversationById('conversationId|transcript')).toBe(conversation);
  });

  it('should get all conversationsIds', () => {
    conversationSet.newConversation(
      {} as any,
      { botId: 'someBot' } as any,
      { id: 'user', name: 'User1' },
      'conversationId|transcript'
    );
    conversationSet.newConversation(
      {} as any,
      { botId: 'someBot' } as any,
      { id: 'user', name: 'User1' },
      'conversationId1|transcript'
    );

    const conversations = conversationSet.getConversationIds();
    expect(conversations).toEqual(['conversationId|transcript', 'conversationId1|transcript']);
  });
});
