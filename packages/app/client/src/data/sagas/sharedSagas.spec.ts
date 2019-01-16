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

import { SharedConstants } from '@bfemulator/app-shared';

import { RootState } from '../store';

import { editorSelector, refreshConversationMenu } from './sharedSagas';

import { select } from 'redux-saga/effects';

let mockRemoteCommandsCalled = [];
jest.mock('../../platform/commands/commandServiceImpl', () => ({
  CommandServiceImpl: {
    remoteCall: async (commandName: string, ...args: any[]) => {
      mockRemoteCommandsCalled.push({ commandName, args: args });
    },
  },
}));

describe('The sharedSagas', () => {
  const editorState = { activeEditor: 'primary' };

  beforeEach(() => {
    mockRemoteCommandsCalled = [];
  });

  it('should select the editor state from the store', () => {
    const state: RootState = { editor: editorState };

    expect(editorSelector(state)).toEqual(editorState);
  });

  it('should refresh the conversation menu', () => {
    const gen = refreshConversationMenu();

    const editorSelection = gen.next().value;
    expect(editorSelection).toEqual(select(editorSelector));

    gen.next(editorState);
    expect(mockRemoteCommandsCalled).toHaveLength(1);
    const refreshConversationCall = mockRemoteCommandsCalled[0];
    expect(refreshConversationCall.commandName).toBe(
      SharedConstants.Commands.Electron.UpdateConversationMenu
    );
    expect(refreshConversationCall.args).toHaveLength(1);
    expect(refreshConversationCall.args[0]).toEqual(editorState);

    expect(gen.next().done).toBe(true);
  });
});
