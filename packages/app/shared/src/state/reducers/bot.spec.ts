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

import { BotInfo } from '@bfemulator/app-shared';
import { BotConfigWithPath } from '@bfemulator/sdk-shared';

import { BotAction, load, setActive, setDirectory, closeBot, mockAndSetActive } from '../actions/botActions';

import { BotState, bot } from './bot';

describe('Bot reducer tests', () => {
  let defaultState: BotState;

  beforeEach(() => {
    defaultState = {
      activeBot: null,
      botFiles: [],
      currentBotDirectory: null,
    };
  });

  it('should return unaltered state for non-matching action type', () => {
    const emptyAction: BotAction = { type: null, payload: null };
    const startingState = { ...defaultState };
    const endingState = bot(defaultState, emptyAction);

    expect(endingState).toEqual(startingState);
  });

  it('should load bot files', () => {
    const bots: BotInfo[] = [
      {
        displayName: 'bot1',
        path: 'path1',
        secret: null,
      },
      {
        displayName: 'bot2',
        path: 'path2',
        secret: 'test-secret',
      },
      {
        displayName: 'bot3',
        path: 'path3',
        secret: null,
      },
      null,
    ];
    const action = load(bots);
    const state = bot(defaultState, action);

    expect(state.botFiles).not.toEqual(bots);
    expect(state.botFiles.length).toBe(3);
    expect(state.botFiles).toEqual([
      {
        displayName: 'bot1',
        path: 'path1',
        secret: null,
      },
      {
        displayName: 'bot2',
        path: 'path2',
        secret: 'test-secret',
      },
      {
        displayName: 'bot3',
        path: 'path3',
        secret: null,
      },
    ]);
  });

  it('should close the current active bot', () => {
    const activeBot: BotConfigWithPath = {
      name: 'someActiveBot',
      description: 'testing',
      padlock: null,
      services: [],
      path: 'somePath',
    };
    const startingState: BotState = {
      ...defaultState,
      activeBot,
    };

    const action = closeBot();
    const state = bot(startingState, action);

    expect(state.activeBot).toBe(null);
  });

  it('should set the bot directory', () => {
    const action = setDirectory('some/path/to/bot/dir');
    const state = bot(defaultState, action);

    expect(state.currentBotDirectory).toBe('some/path/to/bot/dir');
  });

  it('should set a bot as active', () => {
    const activeBot: BotConfigWithPath = {
      name: 'someBot',
      description: 'some description',
      padlock: null,
      services: [],
      path: 'somePath',
    };
    expect(defaultState.activeBot).toBe(null);

    const action = setActive(activeBot);
    const state = bot(defaultState, action);

    expect(state.activeBot).toEqual(activeBot);
    expect(state.activeBot.path).toBe('somePath');
  });

  it('should preserve overrides from the previous bot if they have the same path', () => {
    const activeBot: BotConfigWithPath = {
      name: 'someActiveBot',
      description: 'testing',
      padlock: null,
      services: [],
      path: 'somePath',
      overrides: {
        endpoint: {
          endpoint: 'someEndpointOverride',
          id: 'someEndpointOverride',
          appId: 'someAppIdOverride',
          appPassword: 'someAppPwOverride',
        },
      },
    };
    const startingState: BotState = {
      ...defaultState,
      activeBot,
    };
    const newActiveBot: BotConfigWithPath = {
      name: 'someBot',
      description: 'some description',
      padlock: null,
      services: [],
      path: 'somePath',
    };

    const action = setActive(newActiveBot);
    const endingState = bot(startingState, action);

    expect(endingState.activeBot.name).toBe('someBot');

    expect(endingState.activeBot.overrides).toBeTruthy();
    const endpointOverrides = endingState.activeBot.overrides.endpoint;
    expect(endpointOverrides.endpoint).toBe('someEndpointOverride');
    expect(endpointOverrides.id).toBe('someEndpointOverride');
    expect(endpointOverrides.appId).toBe('someAppIdOverride');
    expect(endpointOverrides.appPassword).toBe('someAppPwOverride');
  });

  it("should throw away overrides from the previous bot if they don't have the same path", () => {
    const activeBot: BotConfigWithPath = {
      name: 'someActiveBot',
      description: 'testing',
      padlock: null,
      services: [],
      path: 'somePath',
      overrides: {
        endpoint: {
          endpoint: 'someEndpointOverride',
          id: 'someEndpointOverride',
          appId: 'someAppIdOverride',
          appPassword: 'someAppPwOverride',
        },
      },
    };
    const startingState: BotState = {
      ...defaultState,
      activeBot,
    };
    const newActiveBot: BotConfigWithPath = {
      name: 'someBot',
      description: 'some description',
      padlock: null,
      services: [],
      path: 'someOtherPath',
    };

    const action = setActive(newActiveBot);
    const endingState = bot(startingState, action);

    expect(endingState.activeBot.name).toBe('someBot');
    expect(endingState.activeBot.overrides).toBeFalsy();
  });

  it('should mock a bot and set as active', () => {
    const botMock: BotConfigWithPath = {
      name: 'mockedBot',
      description: '',
      padlock: null,
      path: 'mockedPath',
      services: [],
    };
    const action = mockAndSetActive(botMock);
    const state = bot(defaultState, action);

    expect(state.activeBot).not.toBe(null);
    expect(state.activeBot.name).toBe('mockedBot');
    expect(state.activeBot.description).toBe('');
    expect(state.activeBot.path).toBe('mockedPath');
  });
});
