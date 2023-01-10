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
import sagaMiddlewareFactory from 'redux-saga';
import { Component } from 'react';
import {
  bot,
  launchEndpointEditor,
  load,
  openEndpointExplorerContextMenu,
  setActive,
  EndpointServicePayload,
  EndpointServiceAction,
  SharedConstants,
  LAUNCH_ENDPOINT_EDITOR,
  OPEN_ENDPOINT_CONTEXT_MENU,
  OPEN_ENDPOINT_IN_EMULATOR,
} from '@bfemulator/app-shared';
import { takeEvery, takeLatest } from 'redux-saga/effects';
import { CommandServiceImpl, CommandServiceInstance } from '@bfemulator/sdk-shared';
import { IEndpointService } from 'botframework-config';

import { DialogService } from '../../ui/dialogs/service';

import { EndpointSagas, endpointSagas } from './endpointSagas';

jest.mock('../../ui/dialogs', () => ({
  DialogService: { showDialog: () => Promise.resolve(true) },
}));

const mockBot = JSON.parse(`{
  "name": "TestBot",
  "description": "",
  "padlock": "",
  "services": [{
      "type": "endpoint",
      "appId": "51fc2648-1190-44aa-9559-87b11b1d0014",
      "appPassword": "MOCK_TEST_SECRET",
      "endpoint": "https://testbot.botframework.com/api/messagesv3",
      "id": "https://testbot.botframework.com/api/messagesv3",
      "name": "https://testbot.botframework.com/api/messagesv3"
  },
  {
      "type": "abs",
      "appId": "51fc2648-1190-44fa-9559-87b11b1d0014",
      "id": "142",
      "resourceGroup": "555",
      "serviceName": "111",
      "subscriptionId": "444",
      "tenantId": "22"
  }]
}`);

jest.mock('electron', () => ({
  remote: {
    app: {
      isPackaged: false,
    },
  },
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
let mockRemoteCommandsCalled = [];

const endpointService: IEndpointService = {
  appId: 'appId',
  name: 'service',
  appPassword: 'MOCK_TEST_SECRET',
  endpoint: 'http://localendpoint',
  channelService: 'channel service',
};
const resolver = jest.fn(() => undefined);

const endpointPayload: EndpointServicePayload = {
  endpointService,
  resolver,
};
const endpointServiceAction: EndpointServiceAction<EndpointServicePayload> = {
  type: OPEN_ENDPOINT_CONTEXT_MENU,
  payload: endpointPayload,
};

describe('The endpointSagas', () => {
  let commandService: CommandServiceImpl;
  let sagaMiddleware;
  let mockStore;
  let mockComponentClass;
  beforeAll(() => {
    const decorator = CommandServiceInstance();
    const descriptor = decorator({ descriptor: {} }, 'none') as any;
    commandService = descriptor.descriptor.get();

    commandService.remoteCall = async (commandName: string, ...args: any[]) => {
      mockRemoteCommandsCalled.push({ commandName, args: args });

      return Promise.resolve(true) as any;
    };
  });

  beforeEach(() => {
    sagaMiddleware = sagaMiddlewareFactory();
    mockStore = createStore(combineReducers({ bot }), {}, applyMiddleware(sagaMiddleware));
    sagaMiddleware.run(endpointSagas);
    mockComponentClass = class extends Component<Record<string, unknown>, Record<string, unknown>> {};
    jest.mock('../store', () => ({
      get store() {
        return mockStore;
      },
    }));
    mockRemoteCommandsCalled = [];
    mockStore.dispatch(load([mockBot]));
    mockStore.dispatch(setActive(mockBot));
  });

  it('should initialize the root saga', () => {
    const gen = endpointSagas();

    expect(gen.next().value).toEqual(takeLatest(LAUNCH_ENDPOINT_EDITOR, EndpointSagas.launchEndpointEditor));
    expect(gen.next().value).toEqual(takeEvery(OPEN_ENDPOINT_CONTEXT_MENU, EndpointSagas.openEndpointContextMenu));
    expect(gen.next().value).toEqual(takeEvery(OPEN_ENDPOINT_IN_EMULATOR, EndpointSagas.openEndpointInEmulator));

    expect(gen.next().done).toBe(true);
  });

  it('should launch an endpoint editor', () => {
    const gen = EndpointSagas.launchEndpointEditor(endpointServiceAction);
    gen.next();
    gen.next([endpointService]);
    expect(gen.next().done).toBe(true);
    expect(resolver).toHaveBeenCalledTimes(1);
    expect(mockRemoteCommandsCalled.length).toEqual(1);
  });

  it('should launch the endpoint editor and execute a command to save the edited services', async () => {
    const remoteCallSpy = jest.spyOn(commandService, 'remoteCall');
    const dialogServiceSpy = jest.spyOn(DialogService, 'showDialog').mockResolvedValue(mockBot.services);
    await mockStore.dispatch(launchEndpointEditor(mockComponentClass, mockBot.services[0]));
    const { AddOrUpdateService } = SharedConstants.Commands.Bot;
    expect(dialogServiceSpy).toHaveBeenCalledWith(mockComponentClass, {
      endpointService: mockBot.services[0],
    });
    expect(remoteCallSpy).toHaveBeenCalledWith(AddOrUpdateService, 'abs', mockBot.services[1]);
  });

  describe(' openEndpointContextMenu', () => {
    const menuItems = [
      { label: 'Open in Emulator', id: 'open' },
      { label: 'Open in portal', id: 'absLink', enabled: expect.any(Boolean) },
      { label: 'Edit configuration', id: 'edit' },
      { label: 'Remove', id: 'forget' },
    ];

    const { DisplayContextMenu, ShowMessageBox } = SharedConstants.Commands.Electron;
    const { NewLiveChat } = SharedConstants.Commands.Emulator;
    it('should launch the endpoint editor when that menu option is chosen', async () => {
      const commandServiceSpy = jest.spyOn(commandService, 'remoteCall').mockResolvedValue({ id: 'edit' });
      const dialogServiceSpy = jest.spyOn(DialogService, 'showDialog').mockResolvedValue(mockBot.services);
      await mockStore.dispatch(openEndpointExplorerContextMenu(mockComponentClass, mockBot.services[0]));

      expect(commandServiceSpy).toHaveBeenCalledWith(DisplayContextMenu, menuItems);
      expect(dialogServiceSpy).toHaveBeenCalledWith(mockComponentClass, {
        endpointService: mockBot.services[0],
      });
      commandServiceSpy.mockClear();
      dialogServiceSpy.mockClear();
    });

    it('should open a deep link when that menu option is chosen', async () => {
      const commandServiceRemoteCallSpy = jest.spyOn(commandService, 'remoteCall').mockResolvedValue({ id: 'open' });
      const commandServiceCallSpy = jest.spyOn(commandService, 'call').mockResolvedValue(true);

      await mockStore.dispatch(openEndpointExplorerContextMenu(mockComponentClass, mockBot.services[0]));
      expect(commandServiceRemoteCallSpy).toHaveBeenCalledWith(DisplayContextMenu, menuItems);
      expect(commandServiceCallSpy).toHaveBeenCalledWith(NewLiveChat, mockBot.services[0]);
      commandServiceRemoteCallSpy.mockClear();
      commandServiceCallSpy.mockClear();
    });

    it('should forget the service when that menu item is chosen', async () => {
      const remoteCallArgs = [];
      commandService.remoteCall = async (commandName, ...args) => {
        remoteCallArgs.push({ commandName, args: args });
        if (commandName === DisplayContextMenu) {
          return { id: 'forget' };
        }
        return true as any;
      };
      const { RemoveService } = SharedConstants.Commands.Bot;
      await mockStore.dispatch(openEndpointExplorerContextMenu(mockComponentClass, mockBot.services[0]));
      await Promise.resolve();
      expect(remoteCallArgs[0]).toEqual({
        commandName: DisplayContextMenu,
        args: [menuItems],
      });
      expect(remoteCallArgs[1]).toEqual({
        commandName: ShowMessageBox,
        args: [
          true,
          {
            buttons: ['Cancel', 'OK'],
            cancelId: 0,
            defaultId: 1,
            message: 'Remove endpoint https://testbot.botframework.com/api/messagesv3. Are you sure?',
            type: 'question',
          },
        ],
      });

      expect(remoteCallArgs[2]).toEqual({
        commandName: RemoveService,
        args: [mockBot.services[0].type, mockBot.services[0].id],
      });
    });
  });
});
