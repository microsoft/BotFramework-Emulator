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
import { User } from '@bfemulator/sdk-shared';
import * as HttpStatus from 'http-status-codes';

import { BotEmulator } from '../../botEmulator';
import BotEndpoint from '../../facility/botEndpoint';
import BotState from '../../facility/botState';
import Conversation from '../../facility/conversation';
import ConversationSet from '../../facility/conversationSet';

import deleteStateForUser from './deleteStateForUser';
import fetchBotData from './fetchBotData';
import getConversationData from './getConversationData';
import getPrivateConversationData from './getPrivateConversationData';
import getUserData from './getUserData';
import setConversationData from './setConversationData';
import setPrivateConversationData from './setPrivateConversationData';

describe('The botStateMiddleware', () => {
  let botState: BotState;
  let emulator: BotEmulator;
  let conversation: Conversation;
  let user: User;
  let res;
  const channelId = '3c';
  beforeEach(() => {
    res = {
      send: () => null,
      end: () => null,
      contentType: '',
    };

    emulator = { facilities: { logger: { logMessage: () => true } } } as any;
    emulator.facilities.conversations = new ConversationSet();
    user = { id: '321', name: 'a user' };
    const endpoint = new BotEndpoint('12', '123', 'http://localhost:12345', '', '', false, '', {});
    conversation = emulator.facilities.conversations.newConversation(emulator, endpoint, user);
    botState = new BotState(emulator, 256);
    jest.spyOn(Date, 'now').mockReturnValue({ toString: () => '123456' });
    botState.setBotData(channelId, conversation.conversationId, user.id, {
      eTag: '',
      data: { state: 'none' },
    });
    emulator.facilities.botState = botState;
  });

  it('should delete the state for the user', () => {
    const deleteStateMiddleware = deleteStateForUser(emulator);

    const req = {
      params: { userId: user.id },
      accepts: 'application/json',
      acceptsEncoding: 'utf8',
    };

    const sendSpy = jest.spyOn(res, 'send');
    deleteStateMiddleware(req as any, res as any, (() => null) as any);
    expect(sendSpy).toHaveBeenCalledWith(HttpStatus.OK);
    expect(emulator.facilities.botState.getBotData(channelId, conversation.conversationId, user.id)).toEqual({
      data: null,
      eTag: '*',
    });
  });

  it('should fetch the specified bot data', () => {
    const fetchBotDataMiddleware = fetchBotData(emulator);
    const req = {
      params: {
        userId: user.id,
        conversationId: conversation.conversationId,
        channelId,
      },
      botData: null,
    };
    fetchBotDataMiddleware(req as any, res, (() => null) as any);
    expect(req.botData).toEqual({ data: { state: 'none' }, eTag: '123456' });
  });

  it('should get the conversation data', () => {
    const getConversationDataMiddleware = getConversationData(emulator);
    const req = {
      botData: { testBotData: true },
    };
    const sendSpy = jest.spyOn(res, 'send');
    getConversationDataMiddleware(req as any, res, (() => null) as any);
    expect(sendSpy).toHaveBeenCalledWith(HttpStatus.OK, req.botData);
  });

  it('should get private conversation data', () => {
    const privateConversationMiddleware = getPrivateConversationData(emulator);
    const req = {
      botData: { testBotData: true },
    };
    const sendSpy = jest.spyOn(res, 'send');
    privateConversationMiddleware(req as any, res, (() => null) as any);
    expect(sendSpy).toHaveBeenCalledWith(HttpStatus.OK, req.botData);
  });

  it('should get the user data', () => {
    const getUserDataMiddleware = getUserData(emulator);
    const req = {
      botData: { testBotData: true },
    };
    const sendSpy = jest.spyOn(res, 'send');
    getUserDataMiddleware(req as any, res, (() => null) as any);
    expect(sendSpy).toHaveBeenCalledWith(HttpStatus.OK, req.botData);
  });

  it('should set conversation data', () => {
    const setConversationMiddleware = setConversationData(emulator);
    const req = {
      params: {
        channelId,
        conversationId: conversation.conversationId,
        userId: '321',
      },
      body: { data: { newBotData: true }, eTag: '123456' },
    };
    const sendSpy = jest.spyOn(res, 'send');
    setConversationMiddleware(req as any, res, (() => null) as any);
    expect(sendSpy).toHaveBeenCalledWith(HttpStatus.OK, {
      data: req.body.data,
      eTag: '123456',
    });
    expect(emulator.facilities.botState.getBotData(channelId, conversation.conversationId, user.id)).toEqual({
      data: { newBotData: true },
      eTag: '123456',
    });
  });

  it('should set private conversation data', () => {
    const setPrivateConversationDataMiddleware = setPrivateConversationData(emulator);
    const req = {
      params: {
        channelId,
        conversationId: conversation.conversationId,
        userId: '321',
      },
      body: { data: { newBotData: true }, eTag: '123456' },
    };
    const sendSpy = jest.spyOn(res, 'send');
    setPrivateConversationDataMiddleware(req as any, res, (() => null) as any);
    expect(sendSpy).toHaveBeenCalledWith(HttpStatus.OK, {
      data: req.body.data,
      eTag: '123456',
    });
    expect(emulator.facilities.botState.getBotData(channelId, conversation.conversationId, user.id)).toEqual({
      data: { newBotData: true },
      eTag: '123456',
    });
  });

  it('should set the user data', () => {
    const setUserDataMiddleware = setPrivateConversationData(emulator);
    const req = {
      params: {
        channelId,
        conversationId: conversation.conversationId,
        userId: '321',
      },
      body: { data: { newBotData: true }, eTag: '123456' },
    };
    const sendSpy = jest.spyOn(res, 'send');
    setUserDataMiddleware(req as any, res, (() => null) as any);
    expect(sendSpy).toHaveBeenCalledWith(HttpStatus.OK, {
      data: req.body.data,
      eTag: '123456',
    });
    expect(emulator.facilities.botState.getBotData(channelId, conversation.conversationId, user.id)).toEqual({
      data: { newBotData: true },
      eTag: '123456',
    });
  });
});
