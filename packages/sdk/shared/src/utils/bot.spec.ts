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

import { applyBotConfigOverrides } from './bot';
import { BotConfigWithPath, BotConfigOverrides } from '../types';

describe('Bot utility function tests', () => {
  it('should apply bot config overrides', () => {
    const bot: BotConfigWithPath = {
      name: 'someBot',
      description: 'someDescription',
      secretKey: null,
      services: [],
      overrides: null
    };
    const overrides: BotConfigOverrides = {
      endpoint: {
        endpoint: 'someEndpoint',
        appId: 'someAppId',
        appPassword: 'someAppPw',
        id: 'someEndpoint'
      }
    };
    const overriddenBot = applyBotConfigOverrides(bot, overrides);
    
    expect(overriddenBot.overrides).not.toBe(null);
    expect(overriddenBot.overrides.endpoint.endpoint).toBe('someEndpoint');
    expect(overriddenBot.overrides.endpoint.appId).toBe('someAppId');
    expect(overriddenBot.overrides.endpoint.appPassword).toBe('someAppPw');
    expect(overriddenBot.overrides.endpoint.id).toBe('someEndpoint');
  });
});
