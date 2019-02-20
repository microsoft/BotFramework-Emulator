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

import { ErrorCodes } from '@bfemulator/sdk-shared';
import * as HttpStatus from 'http-status-codes';

import createAPIException from '../utils/createResponse/apiException';

import BotState from './botState';
import botDataKey from './botDataKey';

let mockApproximatedObjectSize;
jest.mock('../utils/approximateObjectSize', () => jest.fn(() => mockApproximatedObjectSize));

describe('botState', () => {
  beforeEach(() => {
    mockApproximatedObjectSize = 64;
  });

  it('should get bot data when the record exists', () => {
    const channelId = 'channel1';
    const convoId = 'convo1';
    const userId = 'user1';
    const dataKey = botDataKey(channelId, convoId, userId);
    const botData = { data: 'I am bot data!' };
    const mockLogDeprecationWarning = jest.fn(() => null);
    const botState = new BotState(null, null);
    (botState as any).botDataStore = { [dataKey]: botData };
    (botState as any).logBotStateApiDeprecationWarning = mockLogDeprecationWarning;

    const data = botState.getBotData(channelId, convoId, userId);

    expect(data).toBe(botData);
    expect(mockLogDeprecationWarning).toHaveBeenCalledWith(convoId);
  });

  it('should get null bot data when the record does not exist', () => {
    const mockLogDeprecationWarning = jest.fn(() => null);
    const botState = new BotState(null, null);
    (botState as any).logBotStateApiDeprecationWarning = mockLogDeprecationWarning;

    const data = botState.getBotData('channel1', 'convo1', 'user1');

    expect(data).toEqual({ data: null, eTag: '*' });
  });

  it('should set bot data', () => {
    const channelId = 'channel1';
    const convoId = 'convo1';
    const userId = 'user1';
    const dataKey = botDataKey(channelId, convoId, userId);
    const mockLogDeprecationWarning = jest.fn(() => null);
    const botState = new BotState(null, null);
    (botState as any).logBotStateApiDeprecationWarning = mockLogDeprecationWarning;
    const botData: any = { data: 'I am bot data!' };

    const data = botState.setBotData(channelId, convoId, userId, botData);

    expect(mockLogDeprecationWarning).toHaveBeenCalledWith(convoId);
    expect(data.eTag).toEqual(jasmine.any(String));
    expect(data.data).toBe(botData.data);
    expect((botState as any).botDataStore[dataKey]).toBe(data);
  });

  it('should delete the record when trying to set bot data with invalid data', () => {
    const channelId = 'channel1';
    const convoId = 'convo1';
    const userId = 'user1';
    const dataKey = botDataKey(channelId, convoId, userId);
    const mockLogDeprecationWarning = jest.fn(() => null);
    const botData: any = { data: null };
    const botState = new BotState(null, null);
    (botState as any).logBotStateApiDeprecationWarning = mockLogDeprecationWarning;
    (botState as any).botDataStore[dataKey] = botData;

    expect((botState as any).botDataStore[dataKey]).toBe(botData);

    const data = botState.setBotData(channelId, convoId, userId, botData);

    expect(mockLogDeprecationWarning).toHaveBeenCalledWith(convoId);
    expect(data.eTag).toBe('*');
    expect(data.data).toBe(null);
    expect((botState as any).botDataStore[dataKey]).toBe(undefined);
  });

  it('should throw when the bot data etags are mismatched', () => {
    const channelId = 'channel1';
    const convoId = 'convo1';
    const userId = 'user1';
    const dataKey = botDataKey(channelId, convoId, userId);
    const mockLogDeprecationWarning = jest.fn(() => null);
    const oldBotData: any = { data: 'I am bot data!', eTag: 'Modified on Thursday' };
    const newBotData: any = { data: 'I am bot data!', eTag: 'Modified on Friday' };
    const botState = new BotState(null, null);
    (botState as any).logBotStateApiDeprecationWarning = mockLogDeprecationWarning;
    (botState as any).botDataStore[dataKey] = oldBotData;

    try {
      botState.setBotData(channelId, convoId, userId, newBotData);
    } catch (e) {
      expect(e).toEqual(
        createAPIException(HttpStatus.PRECONDITION_FAILED, ErrorCodes.BadArgument, 'The data is changed')
      );
    }
  });

  it('should throw when the bot data is larger than the size limit', () => {
    const mockLogDeprecationWarning = jest.fn(() => null);
    const botState = new BotState(null, null);
    mockApproximatedObjectSize = 9999; // ensure that the size exceeds the limit
    botState.stateSizeLimitKB = 1;
    (botState as any).logBotStateApiDeprecationWarning = mockLogDeprecationWarning;
    const botData: any = { data: 'I am bot data!' };

    try {
      botState.setBotData('', '', '', botData);
    } catch (e) {
      expect(e).toEqual(
        createAPIException(
          HttpStatus.BAD_REQUEST,
          ErrorCodes.MessageSizeTooBig,
          'State size exceeded configured limit.'
        )
      );
    }
  });

  it('should delete bot data', () => {
    const userId = '1234';
    const dataKey1 = botDataKey('channel1', 'convo1', userId);
    const dataKey2 = botDataKey('channel1', 'convo2', userId);
    const botData1 = { data: 'I am some bot data!' };
    const botData2 = { data: 'I am some other bot data!' };
    const botState = new BotState(null, null);
    (botState as any).botDataStore = {
      [dataKey1]: botData1,
      [dataKey2]: botData2,
    };

    expect(Object.keys((botState as any).botDataStore)).toHaveLength(2);

    botState.deleteBotData(userId);

    expect(Object.keys((botState as any).botDataStore)).toHaveLength(0);
  });
});
