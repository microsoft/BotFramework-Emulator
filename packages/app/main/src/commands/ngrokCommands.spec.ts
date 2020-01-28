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
import { CommandRegistry, CommandServiceImpl, CommandServiceInstance } from '@bfemulator/sdk-shared';
import { combineReducers, createStore } from 'redux';

import { open as OpenInEditor, OpenEditorAction } from '../state/actions/editorActions';

import { NgrokCommands } from './ngrokCommands';

let mockStore;

jest.mock('../state/store', () => ({
  get store() {
    return mockStore;
  },
}));

const mockEmulator = {
  server: {
    state: {
      endpoints: {
        clear: jest.fn(),
        set: jest.fn(),
      },
    },
  },
};
jest.mock('../emulator', () => ({
  Emulator: {
    getInstance: () => mockEmulator,
  },
}));

jest.mock('electron', () => ({
  ipcMain: new Proxy(
    {},
    {
      get(): any {
        return () => ({});
      },
      has() {
        return true;
      },
    }
  ),
  ipcRenderer: new Proxy(
    {},
    {
      get(): any {
        return () => ({});
      },
      has() {
        return true;
      },
    }
  ),
}));

describe('The Ngrok commands', () => {
  const {
    Commands: { Ngrok },
  } = SharedConstants;
  let registry: CommandRegistry;
  let commandService: CommandServiceImpl;

  beforeAll(() => {
    mockStore = createStore(combineReducers({}));
    new NgrokCommands();
    const decorator = CommandServiceInstance();
    const descriptor = decorator({ descriptor: {} }, 'none') as any;
    commandService = descriptor.descriptor.get();
    registry = commandService.registry;
  });

  it('should fire editor with the correct makeActiveByDefalt default value', done => {
    const makeActiveByDefalt = true;
    jest.spyOn(mockStore, 'dispatch').mockImplementationOnce((args: OpenEditorAction) => {
      expect(args.payload.meta.makeActiveByDefault).toBe(makeActiveByDefalt);
      done();
    });
    const handler = registry.getCommand(Ngrok.OpenStatusViewer);
    handler();
  });

  it('should fire editor action with the correct makeActiveByDefalt set as false', done => {
    const makeActiveByDefalt = false;
    jest.spyOn(mockStore, 'dispatch').mockImplementationOnce((args: OpenEditorAction) => {
      expect(args.payload.meta.makeActiveByDefault).toBe(makeActiveByDefalt);
      done();
    });
    const handler = registry.getCommand(Ngrok.OpenStatusViewer);
    handler(makeActiveByDefalt);
  });
});
