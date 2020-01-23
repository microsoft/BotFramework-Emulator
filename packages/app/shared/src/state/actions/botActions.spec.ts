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

import {
  BotActionType,
  load,
  setActive,
  setDirectory,
  mockAndSetActive,
  botHashGenerated,
  browse,
  closeBot,
  openBotViaFilePathAction,
  openBotViaUrlAction,
} from './botActions';

describe('bot actions', () => {
  it('should create a load action', () => {
    const bots = [{}, null, undefined, {}];
    const action = load(bots);

    expect(action.type).toBe(BotActionType.load);
    expect(action.payload).toEqual({ bots: [{}, {}] });
  });

  it('should create a setActive action', () => {
    const bot: any = {};
    const action = setActive(bot);

    expect(action.type).toBe(BotActionType.setActive);
    expect(action.payload).toEqual({ bot: {} });
  });

  it('should create a setDirectory action', () => {
    const directory = '/some/directory';
    const action = setDirectory(directory);

    expect(action.type).toBe(BotActionType.setDirectory);
    expect(action.payload).toEqual({ directory });
  });

  it('should create a close action', () => {
    const action = closeBot();

    expect(action.type).toBe(BotActionType.close);
    expect(action.payload).toEqual({});
  });

  it('should create a mockAndSetActive action', () => {
    const mock: any = { name: 'mockBot', someMockProperty: true };
    const action = mockAndSetActive(mock);

    expect(action.type).toBe(BotActionType.setActive);
    expect(action.payload).toEqual({
      bot: {
        version: '',
        name: 'mockBot',
        description: '',
        services: [],
        padlock: '',
        someMockProperty: true,
      },
    });
  });

  it('should create a botHashGenerated action', () => {
    const hash = 'someHash';
    const action = botHashGenerated(hash);

    expect(action.type).toBe(BotActionType.hashGenerated);
    expect(action.payload).toEqual({ hash });
  });

  it('should create a browse action', () => {
    const action = browse();

    expect(action.type).toBe(BotActionType.browse);
    expect(action.payload).toEqual({});
  });

  it('should create a closeBot action', () => {
    const action = closeBot();

    expect(action.type).toBe(BotActionType.close);
    expect(action.payload).toEqual({});
  });

  it('should create an openBotViaFilePathAction', () => {
    const action = openBotViaFilePathAction('some/path');

    expect(action.type).toBe(BotActionType.openViaFilePath);
    expect(action.payload).toBe('some/path');
  });

  it('should create an openBotViaUrlAction action', () => {
    const action = openBotViaUrlAction({});

    expect(action.type).toBe(BotActionType.openViaUrl);
    expect(action.payload).toEqual({});
  });
});
