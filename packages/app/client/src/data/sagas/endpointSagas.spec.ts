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
import { SharedConstants } from '@bfemulator/app-shared';

import { bot } from '../reducer/bot';
import { load, setActive } from '../action/botActions';
import {
  launchEndpointEditor,
  openEndpointExplorerContextMenu,
} from '../action/endpointServiceActions';
import { CommandServiceImpl } from '../../platform/commands/commandServiceImpl';
import { DialogService } from '../../ui/dialogs/service';

import { endpointSagas } from './endpointSagas';

const sagaMiddleWare = sagaMiddlewareFactory();
const mockStore = createStore(
  combineReducers({ bot }),
  {},
  applyMiddleware(sagaMiddleWare)
);
sagaMiddleWare.run(endpointSagas);
const mockComponentClass = class extends Component<{}, {}> {};
jest.mock('../store', () => ({
  get store() {
    return mockStore;
  },
}));
const mockBot = JSON.parse(`{
  "name": "TestBot",
  "description": "",
  "padlock": "",
  "services": [{
      "type": "endpoint",
      "appId": "51fc2648-1190-44aa-9559-87b11b1d0014",
      "appPassword": "vcxzvcxzvvxczvcxzv",
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

jest.mock('../../ui/dialogs', () => ({
  AzureLoginPromptDialogContainer: function mock() {
    return undefined;
  },
  AzureLoginSuccessDialogContainer: function mock() {
    return undefined;
  },
  BotCreationDialog: function mock() {
    return undefined;
  },
  DialogService: {
    showDialog: () => Promise.resolve(mockBot.services),
  },
  SecretPromptDialog: function mock() {
    return undefined;
  },
}));

describe('The endpoint sagas', () => {
  beforeEach(() => {
    mockStore.dispatch(load([mockBot]));
    mockStore.dispatch(setActive(mockBot));
  });

  it('should launch the endpoint editor and execute a command to save the edited services', async () => {
    const remoteCallSpy = jest.spyOn(CommandServiceImpl, 'remoteCall');
    const dialogServiceSpy = jest
      .spyOn(DialogService, 'showDialog')
      .mockResolvedValue(mockBot.services);
    await mockStore.dispatch(
      launchEndpointEditor(mockComponentClass, mockBot.services[0])
    );
    const { AddOrUpdateService } = SharedConstants.Commands.Bot;
    expect(dialogServiceSpy).toHaveBeenCalledWith(mockComponentClass, {
      endpointService: mockBot.services[0],
    });
    expect(remoteCallSpy).toHaveBeenCalledWith(
      AddOrUpdateService,
      'abs',
      mockBot.services[1]
    );
  });

  describe(' openEndpointContextMenu', () => {
    const menuItems = [
      { label: 'Open in Emulator', id: 'open' },
      { label: 'Open in portal', id: 'absLink', enabled: jasmine.any(Boolean) },
      { label: 'Edit configuration', id: 'edit' },
      { label: 'Remove', id: 'forget' },
    ];

    const {
      DisplayContextMenu,
      ShowMessageBox,
    } = SharedConstants.Commands.Electron;
    const { NewLiveChat } = SharedConstants.Commands.Emulator;
    it('should launch the endpoint editor when that menu option is chosen', () => {
      const commandServiceSpy = jest
        .spyOn(CommandServiceImpl, 'remoteCall')
        .mockResolvedValue({ id: 'edit' });
      const dialogServiceSpy = jest
        .spyOn(DialogService, 'showDialog')
        .mockResolvedValue(mockBot.services);
      mockStore.dispatch(
        openEndpointExplorerContextMenu(mockComponentClass, mockBot.services[0])
      );

      expect(commandServiceSpy).toHaveBeenCalledWith(
        DisplayContextMenu,
        menuItems
      );
      expect(dialogServiceSpy).toHaveBeenCalledWith(mockComponentClass, {
        endpointService: mockBot.services[0],
      });
    });

    it('should open a deep link when that menu option is chosen', async () => {
      const commandServiceRemoteCallSpy = jest
        .spyOn(CommandServiceImpl, 'remoteCall')
        .mockResolvedValue({ id: 'open' });
      const commandServiceCallSpy = jest
        .spyOn(CommandServiceImpl, 'call')
        .mockResolvedValue(true);

      await mockStore.dispatch(
        openEndpointExplorerContextMenu(mockComponentClass, mockBot.services[0])
      );
      expect(commandServiceRemoteCallSpy).toHaveBeenCalledWith(
        DisplayContextMenu,
        menuItems
      );
      expect(commandServiceCallSpy).toHaveBeenCalledWith(
        NewLiveChat,
        mockBot.services[0],
        false
      );
    });

    it('should forget the service when that menu item is chosen', async () => {
      const remoteCallArgs = [];
      CommandServiceImpl.remoteCall = async (commandName, ...args) => {
        remoteCallArgs.push({ commandName, args: args });
        if (commandName === DisplayContextMenu) {
          return { id: 'forget' };
        }
        return true;
      };
      const { RemoveService } = SharedConstants.Commands.Bot;
      await mockStore.dispatch(
        openEndpointExplorerContextMenu(mockComponentClass, mockBot.services[0])
      );
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
            message:
              'Remove endpoint https://testbot.botframework.com/api/messagesv3. Are you sure?',
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
