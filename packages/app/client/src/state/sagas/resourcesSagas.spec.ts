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

import { applyMiddleware, combineReducers, createStore } from 'redux';
import { BotConfigWithPathImpl, CommandServiceImpl, CommandServiceInstance } from '@bfemulator/sdk-shared';
import { ServiceTypes } from 'botframework-config/lib/schema';
import sagaMiddlewareFactory from 'redux-saga';
import { put, takeEvery } from 'redux-saga/effects';
import {
  openContextMenuForResource,
  openResourcesSettings,
  openTranscript,
  renameResource,
  resources,
  SharedConstants,
  OPEN_CONTEXT_MENU_FOR_RESOURCE,
  OPEN_RESOURCE,
  OPEN_RESOURCE_SETTINGS,
  RENAME_RESOURCE,
} from '@bfemulator/app-shared';
import { Component } from 'react';

import { resourceSagas, ResourcesSagas } from './resourcesSagas';

const sagaMiddleWare = sagaMiddlewareFactory();
const mockStore = createStore(combineReducers({ resources }), {}, applyMiddleware(sagaMiddleWare));
sagaMiddleWare.run(resourceSagas);

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

jest.mock('../../ui/dialogs/service', () => ({
  DialogService: {
    showDialog: () => Promise.resolve(true),
    hideDialog: () => Promise.resolve({ path: 'somePath' }),
  },
}));

const mockRemoteCommandsCalled = [];
const mockLocalCommandsCalled = [];
const mockSharedConstants = SharedConstants; // thanks Jest!
let mockContextMenuResponse;

describe('The ResourceSagas', () => {
  let commandService: CommandServiceImpl;
  beforeAll(() => {
    const decorator = CommandServiceInstance();
    const descriptor = decorator({ descriptor: {} }, 'none') as any;
    commandService = descriptor.descriptor.get();
    commandService.remoteCall = async (commandName: string, ...args: any[]) => {
      mockRemoteCommandsCalled.push({ commandName, args: args });
      switch (commandName) {
        case mockSharedConstants.Commands.Electron.DisplayContextMenu:
          return mockContextMenuResponse;

        case mockSharedConstants.Commands.Electron.ShowMessageBox:
          return 1;

        default:
          return true;
      }
    };

    commandService.call = async (commandName: string, ...args: any[]) => {
      mockLocalCommandsCalled.push({ commandName, args: args });
      return true as any;
    };
  });

  beforeEach(() => {
    mockRemoteCommandsCalled.length = 0;
    mockLocalCommandsCalled.length = 0;
  });

  it('should call the correct saga corresponding to the redux action', () => {
    const gen = resourceSagas();

    expect(gen.next().value).toEqual(
      takeEvery(OPEN_CONTEXT_MENU_FOR_RESOURCE, ResourcesSagas.openContextMenuForResource)
    );
    expect(gen.next().value).toEqual(takeEvery(RENAME_RESOURCE, ResourcesSagas.doRename));
    expect(gen.next().value).toEqual(takeEvery(OPEN_RESOURCE, ResourcesSagas.doOpenResource));
    expect(gen.next().value).toEqual(takeEvery(OPEN_RESOURCE_SETTINGS, ResourcesSagas.launchResourcesSettingsModal));
    expect(gen.next().done).toBe(true);
  });

  describe('should open the context menu for the specified resource', () => {
    let mockResource;
    beforeEach(() => {
      mockResource = BotConfigWithPathImpl.serviceFromJSON({
        type: ServiceTypes.File,
        path: 'the/file/path',
        name: 'testChat',
      } as any);
    });

    it('and open the file location when chosen from the options', async () => {
      mockContextMenuResponse = { id: 0 };
      await mockStore.dispatch(openContextMenuForResource(mockResource as any));
      expect(mockRemoteCommandsCalled.length).toBe(2);
      [
        {
          commandName: 'electron:display-context-menu',
          args: [
            [
              {
                label: 'Open file location',
                id: 0,
              },
              {
                label: 'Rename',
                id: 1,
              },
              {
                label: 'Delete',
                id: 2,
              },
            ],
          ],
        },
        {
          commandName: 'shell:open-file-location',
          args: ['the/file/path'],
        },
      ].forEach((command, index) => expect(mockRemoteCommandsCalled[index]).toEqual(command));
    });

    it('and put the resource in the store as the "resourceToRename" property when "edit" is chosen', async () => {
      mockContextMenuResponse = { id: 1 };
      await mockStore.dispatch(openContextMenuForResource(mockResource as any));
      const { resourceToRename } = (mockStore.getState() as any).resources;
      expect(resourceToRename).toEqual(mockResource);
    });

    it('should orchestrate the removal of the file when "delete" is chosen', async () => {
      mockContextMenuResponse = { id: 2 };
      await mockStore.dispatch(openContextMenuForResource(mockResource as any));
      await Promise.resolve();
      expect(mockRemoteCommandsCalled.length).toBe(3);
      [
        {
          commandName: 'electron:display-context-menu',
          args: [
            [
              { label: 'Open file location', id: 0 },
              { label: 'Rename', id: 1 },
              {
                label: 'Delete',
                id: 2,
              },
            ],
          ],
        },
        {
          commandName: 'shell:showExplorer-message-box',
          args: [
            true,
            {
              type: 'info',
              title: 'Delete this file',
              buttons: ['Cancel', 'Delete'],
              defaultId: 1,
              message: 'This action cannot be undone. Are you sure you want to delete testChat?',
              cancelId: 0,
            },
          ],
        },
        {
          commandName: 'shell:unlink-file',
          args: ['the/file/path'],
        },
      ].forEach((command, index) => expect(mockRemoteCommandsCalled[index]).toEqual(command));
    });
  });

  describe('should orchestrate the renaming of a resource', () => {
    let mockResource;
    beforeEach(() => {
      mockResource = BotConfigWithPathImpl.serviceFromJSON({
        type: ServiceTypes.File,
        path: 'the/file/path',
        name: 'testChat',
      } as any);
    });

    it('and display an error dialog when the new name is invalid', async () => {
      mockResource.name = '';
      await mockStore.dispatch(renameResource(mockResource));
      expect(mockRemoteCommandsCalled.length).toBe(1);
      expect(mockRemoteCommandsCalled[0]).toEqual({
        commandName: 'shell:showExplorer-message-box',
        args: [
          true,
          {
            type: 'error',
            title: 'Invalid file name',
            buttons: ['Ok'],
            defaultId: 1,
            message: 'A valid file name must be used',
            cancelId: 0,
          },
        ],
      });
    });

    it('and set the "resourceToRename" to null in the store after a successful rename', async () => {
      await mockStore.dispatch(renameResource(mockResource));
      expect(mockRemoteCommandsCalled.length).toBe(1);
      expect(mockRemoteCommandsCalled[0]).toEqual({
        args: [
          {
            name: 'testChat',
            path: 'the/file/path',
            type: 'file',
          },
        ],
        commandName: 'shell:rename-file',
      });
      const { resourceToRename } = (mockStore.getState() as any).resources;
      expect(resourceToRename).toBeNull();
    });
  });

  describe('when opening the resource in the Emulator', () => {
    let mockResource;
    beforeEach(() => {
      mockResource = BotConfigWithPathImpl.serviceFromJSON({
        type: ServiceTypes.File,
        path: 'the/file/path/chat.chat',
        name: 'testChat',
      } as any);
    });

    it('should open a chat file', async () => {
      const path = 'the/file/path/chat.chat';
      const mockAction: any = {
        payload: {
          path,
        },
      };
      const gen = ResourcesSagas.doOpenResource(mockAction);
      const putValue = gen.next().value;

      expect(putValue).toEqual(put(openTranscript(path)));
      expect(gen.next().done).toBe(true);
    });

    it('should open a transcript file', async () => {
      const path = 'the/file/path/chat.transcript';
      const mockAction: any = {
        payload: {
          path,
        },
      };
      const gen = ResourcesSagas.doOpenResource(mockAction);
      const putValue = gen.next().value;

      expect(putValue).toEqual(put(openTranscript(path)));
      expect(gen.next().done).toBe(true);
    });
  });

  it('should open the resource settings dialog and process the results as expected', async () => {
    const mockClass = class extends Component {};
    await mockStore.dispatch(openResourcesSettings({ dialog: mockClass }));
    await Promise.resolve();

    expect(mockRemoteCommandsCalled).toEqual([{ commandName: 'bot:list:patch', args: [undefined, true] }]);
  });
});
