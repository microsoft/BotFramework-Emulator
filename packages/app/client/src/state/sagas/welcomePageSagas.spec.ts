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
import { bot, notification, openContextMenuForBot, SharedConstants } from '@bfemulator/app-shared';
import sagaMiddlewareFactory from 'redux-saga';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { CommandServiceImpl, CommandServiceInstance } from '@bfemulator/sdk-shared';

import { notificationSagas } from './notificationSagas';
import { welcomePageSagas } from './welcomePageSagas';

const mockBot = {
  path: '/some/path.bot',
  displayName: 'AuthBot',
  secret: 'secret',
};

const sagaMiddleWare = sagaMiddlewareFactory();
const mockStore = createStore(
  combineReducers({ bot, notification }),
  {
    bot: { botFiles: [mockBot] },
  },
  applyMiddleware(sagaMiddleWare)
);

jest.mock('../store', () => ({
  get store() {
    return mockStore;
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

sagaMiddleWare.run(welcomePageSagas);
sagaMiddleWare.run(notificationSagas);

describe('The WelcomePageSagas', () => {
  let commandService: CommandServiceImpl;
  beforeAll(() => {
    const decorator = CommandServiceInstance();
    const descriptor = decorator({ descriptor: {} }, 'none') as any;
    commandService = descriptor.descriptor.get();
  });

  describe(', when invoking a context menu over a bot in the list', () => {
    it('should call the series of commands that move the bot file to a new location.', async () => {
      const remoteCalls = [];
      commandService.remoteCall = async function(...args: any[]) {
        remoteCalls.push(args);
        switch (args[0]) {
          case SharedConstants.Commands.Electron.DisplayContextMenu:
            return { id: 0 };

          case SharedConstants.Commands.Electron.ShowSaveDialog:
            return 'this/is/a/new/location.bot';

          default:
            return null as any;
        }
      };
      await mockStore.dispatch(openContextMenuForBot(mockBot));
      await Promise.resolve(true);
      await Promise.resolve(true);
      expect(remoteCalls[0]).toEqual([
        'electron:display-context-menu',
        [
          {
            label: 'Move...',
            id: 0,
          },
          {
            label: 'Open file location',
            id: 1,
          },
          {
            label: 'Forget this bot',
            id: 2,
          },
        ],
      ]);
      expect(remoteCalls[1]).toEqual([
        'shell:showExplorer-save-dialog',
        {
          defaultPath: '/some/path.bot',
          buttonLabel: 'Move',
          nameFieldLabel: 'Name',
          filters: [
            {
              extensions: ['.bot'],
            },
          ],
        },
      ]);

      expect(remoteCalls[2]).toEqual([
        'shell:rename-file',
        {
          path: '/some/path.bot',
          newPath: 'this/is/a/new/location.bot',
        },
      ]);

      expect(remoteCalls[3]).toEqual([
        'bot:list:patch',
        '/some/path.bot',
        {
          path: 'this/is/a/new/location.bot',
          displayName: 'AuthBot',
          secret: 'secret',
        },
      ]);
    });

    it('should add a notification if a remote command fails when moving a bot file', async () => {
      commandService.remoteCall = async function(...args: any[]) {
        switch (args[0]) {
          case SharedConstants.Commands.Electron.DisplayContextMenu:
            return { id: 0 };

          case SharedConstants.Commands.Electron.ShowSaveDialog:
            return 'this/is/a/new/location.bot';

          case SharedConstants.Commands.Electron.RenameFile:
            throw new Error('oh noes!');

          default:
            return null as any;
        }
      };
      await mockStore.dispatch(openContextMenuForBot(mockBot));
      await Promise.resolve(true);
      await Promise.resolve(true);
      const state: any = mockStore.getState();
      expect(state.notification.allIds.length).toBe(1);
    });

    it('should call the appropriate command when opening the bot file location', async () => {
      let openFileLocationArgs;
      commandService.remoteCall = async function(...args: any[]) {
        switch (args[0]) {
          case SharedConstants.Commands.Electron.DisplayContextMenu:
            return { id: 1 };

          case SharedConstants.Commands.Electron.OpenFileLocation:
            return (openFileLocationArgs = args);

          default:
            return null as any;
        }
      };

      await mockStore.dispatch(openContextMenuForBot(mockBot));
      await Promise.resolve(true);
      expect(openFileLocationArgs).toEqual(['shell:open-file-location', 'this/is/a/new/location.bot']);
    });

    it('should call the appropriate command when removing a bot from the list', async () => {
      let removeBotFromListArgs = null;
      commandService.remoteCall = async function(...args: any[]) {
        switch (args[0]) {
          case SharedConstants.Commands.Electron.DisplayContextMenu:
            return { id: 2 };

          case SharedConstants.Commands.Bot.RemoveFromBotList:
            return (removeBotFromListArgs = args);

          default:
            return null as any;
        }
      };
      await mockStore.dispatch(openContextMenuForBot(mockBot));
      await Promise.resolve(true);
      expect(removeBotFromListArgs).toEqual(['bot:list:remove', 'this/is/a/new/location.bot']);
    });
  });
});
