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

import { IEndpointService, ServiceTypes } from 'botframework-config/lib/schema';

import { BotConfigOverrides, BotConfigWithPath } from '../types';

import { applyBotConfigOverrides, botsAreTheSame, mergeEndpoints } from './bot';

describe('Bot utility function tests', () => {
  const bot: BotConfigWithPath = {
    name: 'someBot',
    description: 'someDescription',
    path: 'somePath',
    padlock: null,
    services: [],
    overrides: null,
    version: '0.1',
  };

  it('should apply bot config overrides', () => {
    const overrides: BotConfigOverrides = {
      endpoint: {
        endpoint: 'someEndpoint',
        appId: 'someAppId',
        appPassword: 'someAppPw',
        id: 'someEndpoint',
      },
    };
    const overriddenBot = applyBotConfigOverrides(bot, overrides);

    expect(overriddenBot.overrides).not.toBe(null);
    expect(overriddenBot.overrides.endpoint.endpoint).toBe('someEndpoint');
    expect(overriddenBot.overrides.endpoint.appId).toBe('someAppId');
    expect(overriddenBot.overrides.endpoint.appPassword).toBe('someAppPw');
    expect(overriddenBot.overrides.endpoint.id).toBe('someEndpoint');
  });

  describe('Comparing two bots', () => {
    it('should return false when one of the bots is falsy', () => {
      const falsyBot: BotConfigWithPath = null;
      const result1 = botsAreTheSame(bot, falsyBot);
      const result2 = botsAreTheSame(falsyBot, bot);

      expect(result1).toBe(false);
      expect(result2).toBe(false);
    });

    it("should return false when the bots don't have matching paths", () => {
      const nonMatchingBot: BotConfigWithPath = {
        name: 'someName',
        description: '',
        padlock: null,
        services: [],
        version: '0.1',
      };
      const result = botsAreTheSame(bot, nonMatchingBot);

      expect(result).toBe(false);
    });

    it('should return true when the bots do have matching paths', () => {
      const matchingBot: BotConfigWithPath = {
        name: 'someOtherName',
        description: '',
        padlock: null,
        services: [],
        path: 'somePath',
        version: '0.1',
      };
      const result = botsAreTheSame(bot, matchingBot);
      expect(result).toBe(true);
    });
  });

  describe('Merging two endpoint services', () => {
    const endpoint1: IEndpointService = {
      type: ServiceTypes.Endpoint,
      name: 'endpoint1',
      id: 'http://www.endpoint1.com/api/messages',
      endpoint: 'http://www.endpoint1.com/api/messages',
      appId: 'someAppId1',
      appPassword: 'someAppPw1',
    };

    const endpoint2: Partial<IEndpointService> = {
      id: 'http://www.endpoint2.com/api/messages',
      endpoint: 'http://www.endpoint2.com/api/messages',
      appId: 'someAppId2',
      appPassword: null,
    };

    const result = mergeEndpoints(endpoint1, endpoint2);

    expect(result.name).toBe('endpoint1');
    expect(result.endpoint).toBe('http://www.endpoint2.com/api/messages');
    expect(result.id).toBe('http://www.endpoint2.com/api/messages');
    expect(result.appId).toBe('someAppId2');
    expect(result.appPassword).toBe(null);
  });
});
