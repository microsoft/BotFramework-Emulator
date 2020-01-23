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
  azureAuth,
  azureArmTokenDataChanged,
  bot,
  launchConnectedServicePicker,
  launchExternalLink,
  load,
  openAddServiceContextMenu,
  openContextMenuForConnectedService,
  openServiceDeepLink,
  setActive,
  sortExplorerContents,
  ConnectedServiceAction,
  ConnectedServicePayload,
  ConnectedServicePickerPayload,
  OpenAddServiceContextMenuPayload,
  ServiceCodes,
  SharedConstants,
} from '@bfemulator/app-shared';
import { ServiceTypes } from 'botframework-config/lib/schema';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import sagaMiddlewareFactory from 'redux-saga';
import { call, put } from 'redux-saga/effects';
import { CommandServiceInstance } from '@bfemulator/sdk-shared';
import { CommandServiceImpl } from '@bfemulator/sdk-shared';

import {
  AzureLoginFailedDialogContainer,
  AzureLoginSuccessDialogContainer,
  ConnectServicePromptDialogContainer,
  GetStartedWithCSDialogContainer,
} from '../../ui/dialogs';
import { DialogService } from '../../ui/dialogs/service'; // ☣☣ careful! ☣☣
import { ConnectedServicePickerContainer } from '../../ui/shell/explorer/servicesExplorer';
import { ConnectedServiceEditorContainer } from '../../ui/shell/explorer/servicesExplorer/connectedServiceEditor';

import { ServicesExplorerSagas, servicesExplorerSagas } from './servicesExplorerSagas';

const sagaMiddleWare = sagaMiddlewareFactory();
const mockStore = createStore(combineReducers({ azureAuth, bot }), {}, applyMiddleware(sagaMiddleWare));
sagaMiddleWare.run(servicesExplorerSagas);

const mockArmToken = 'bm90aGluZw==.eyJ1cG4iOiJnbGFzZ293QHNjb3RsYW5kLmNvbSJ9.7gjdshgfdsk98458205jfds9843fjds';

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

jest.mock('./azureAuthSaga', () => ({
  AzureAuthSaga: {
    getArmToken: function*() {
      // eslint-disable-next-line typescript/camelcase
      yield { access_token: mockArmToken };
    },
  },
}));

describe('The ServiceExplorerSagas', () => {
  let commandService: CommandServiceImpl;
  beforeAll(() => {
    const decorator = CommandServiceInstance();
    const descriptor = decorator({ descriptor: {} }, 'none') as any;
    commandService = descriptor.descriptor.get();
    commandService.remoteCall = (type: string) => {
      switch (type) {
        case SharedConstants.Commands.ConnectedService.GetConnectedServicesByType:
          return { services: [{ id: 'a luis service' }], code: ServiceCodes.OK };

        default:
          return null as any;
      }
    };
  });
  describe(' launchConnectedServicePicker happy path', () => {
    let launchConnectedServicePickerGen;
    let payload: ConnectedServicePickerPayload;

    beforeEach(() => {
      payload = {
        azureAuthWorkflowComponents: {
          loginFailedDialog: AzureLoginFailedDialogContainer,
          loginSuccessDialog: AzureLoginSuccessDialogContainer,
          promptDialog: ConnectServicePromptDialogContainer,
        },
        getStartedDialog: GetStartedWithCSDialogContainer,
        editorComponent: ConnectedServiceEditorContainer,
        pickerComponent: ConnectedServicePickerContainer,
      };
      launchConnectedServicePickerGen = servicesExplorerSagas().next().value.FORK.args[1];
      mockStore.dispatch(azureArmTokenDataChanged(mockArmToken));
    });

    it('should retrieve the arm token from the store', () => {
      const token = launchConnectedServicePickerGen()
        .next()
        .value.SELECT.selector(mockStore.getState());
      expect(token.access_token).toBe(mockArmToken);
    });

    it('should prompt the user to login if the armToken does not exist in the store', () => {
      mockStore.dispatch(azureArmTokenDataChanged(''));
      const it = launchConnectedServicePickerGen(launchConnectedServicePicker(payload));
      let token = it.next().value.SELECT.selector(mockStore.getState());
      expect(token.access_token).toBe('');
      token = it.next().value;
      expect(token.access_token).toBe(mockArmToken);
    });

    it('should retrieve the luis models from the API when a valid armToken exists', async () => {
      const action = launchConnectedServicePicker(payload);
      const it = launchConnectedServicePickerGen(action);
      let token = it.next().value.SELECT.selector(mockStore.getState());

      token = it.next(token).value.SELECT.selector(mockStore.getState()); // Delegate to *retrieveLuisServices()
      const result = await it.next(token).value;
      expect(action.payload.authenticatedUser).toBe('glasgow@scotland.com');
      expect(result.services.length).toEqual(1);
      expect(result.services[0].id).toBe('a luis service');
    });

    it('should launch the luis models picklist after the luis models are retrieved', async () => {
      DialogService.showDialog = () => Promise.resolve([{ id: 'a new service to add' }]) as any;
      const action = launchConnectedServicePicker(payload);
      const it = launchConnectedServicePickerGen(action);
      let token = it.next().value.SELECT.selector(mockStore.getState());

      token = it.next(token).value.SELECT.selector(mockStore.getState()); // Delegate to *retrieveLuisServices()
      const luisModels = await it.next(token).value;

      const newModels = await it.next(luisModels).value;
      expect(newModels.length).toBe(1);
      expect(newModels[0].id).toBe('a new service to add');
    });

    it('should add the new models from the picklist to the active bot', async () => {
      const mockBot = JSON.parse(`{
        "name": "TestBot",
        "description": "",
        "padlock": "",
        "services": [{
            "type": "endpoint",
            "name": "https://testbot.botframework.com/api/messagesv3",
            "id": "https://testbot.botframework.com/api/messagesv3",
            "endpoint": "https://testbot.botframework.com/api/messagesv3"
        }]
      }`);

      mockStore.dispatch(load([mockBot]));
      mockStore.dispatch(setActive(mockBot));

      DialogService.showDialog = () => Promise.resolve([{ id: 'a new service to add' }]) as any;
      const action = launchConnectedServicePicker(payload);
      const it = launchConnectedServicePickerGen(action);
      let token = it.next().value.SELECT.selector(mockStore.getState());

      token = it.next(token).value.SELECT.selector(mockStore.getState()); // Delegate to *retrieveLuisServices()
      const luisModels = await it.next(token).value;

      const newModels = await it.next(luisModels).value;
      const botConfig = it.next(newModels).value.SELECT.selector(mockStore.getState());
      let _type;
      let _args;
      commandService.remoteCall = function(type: string, ...args: any[]) {
        _type = type;
        _args = args;
        return Promise.resolve(true);
      } as any;

      const result = await it.next(botConfig).value;
      expect(result).toBeTruthy();
      expect(_type).toBe(SharedConstants.Commands.Bot.Save);
      expect(_args[0].services[1].id).toBe('a new service to add');
    });
  });

  describe(' openContextMenuForService', () => {
    let contextMenuGen;
    let action: ConnectedServiceAction<ConnectedServicePayload>;
    const mockService = JSON.parse(`{
          "type": "luis",
          "id": "#1",
          "name": "The Bot, the bot, the bot",
          "version": "0.1",
          "appId": "woot!",
          "authoringKey": "keykeykey",
          "subscriptionKey": "secret"
      }`);

    beforeEach(() => {
      const sagaIt = servicesExplorerSagas();
      action = openContextMenuForConnectedService<ConnectedServiceAction<ConnectedServicePayload>>(
        ConnectedServiceEditorContainer,
        mockService
      );
      let i = 5;
      while (i--) {
        contextMenuGen = sagaIt.next().value.FORK.args[1];
      }
    });

    it('should open the service deep link when the "open" menu item is selected', async () => {
      commandService.remoteCall = async () => ({ id: 'open' } as any);

      const it = contextMenuGen(action);
      const result = await it.next().value;
      expect(result.id).toBe('open');

      window.open = jest.fn();

      await it.next(result).value;

      expect(window.open).toHaveBeenCalledWith(
        `https://luis.ai/applications/${mockService.appId}/versions/${mockService.version}/build`
      );
    });

    it('should open the luis editor when the "edit" item is selected', async () => {
      commandService.remoteCall = async () => ({ id: 'edit' } as any);

      const it = contextMenuGen(action);
      const result = await it.next().value;
      expect(result.id).toBe('edit');

      DialogService.showDialog = () => Promise.resolve(mockService);
      commandService.remoteCall = () => Promise.resolve(true) as any;

      const responseFromEditor = await it.next(result).value;
      expect(responseFromEditor).toEqual(mockService);

      const responseFromMain = await it.next(responseFromEditor);
      expect(responseFromMain).toBeTruthy();
    });

    it('should ask the main process to remove the selected luis service from the active bot', async () => {
      commandService.remoteCall = async () => ({ id: 'forget' } as any);
      const it = contextMenuGen(action);
      let result = await it.next().value;
      expect(result.id).toBe('forget');

      let _type;
      let _args;
      commandService.remoteCall = async (type: string, ...args: any[]) => {
        _type = type;
        _args = args;
        return true as any;
      };

      result = await it.next(result).value;
      expect(result).toBeTruthy();
      expect(_type).toBe(SharedConstants.Commands.Electron.ShowMessageBox);
      expect(_args[1]).toEqual({
        type: 'question',
        buttons: ['Cancel', 'OK'],
        defaultId: 1,
        message: `Remove LUIS service: The Bot, the bot, the bot. Are you sure?`,
        cancelId: 0,
      });

      result = await it.next(result).value;
      expect(_type).toBe(SharedConstants.Commands.Bot.RemoveService);
      expect(_args[0]).toBe(ServiceTypes.Luis);
      expect(_args[1]).toBe('#1');
    });

    it('should ask the main process to remove the selected QnA Maker service from the active bot', async () => {
      commandService.remoteCall = async () => ({ id: 'forget' } as any);

      action.payload.connectedService = JSON.parse(`{
          "type": "qna",
          "id": "#1",
          "name": "The Bot, the bot, the bot",
          "version": "0.1",
          "appId": "woot!",
          "authoringKey": "keykeykey",
          "subscriptionKey": "secret"
      }`);

      const it = contextMenuGen(action);
      let result = await it.next().value;
      expect(result.id).toBe('forget');

      let _type;
      let _args;
      commandService.remoteCall = async (type: string, ...args: any[]) => {
        _type = type;
        _args = args;
        return true as any;
      };

      result = await it.next(result).value;
      expect(result).toBeTruthy();
      expect(_type).toBe(SharedConstants.Commands.Electron.ShowMessageBox);
      expect(_args[1]).toEqual({
        type: 'question',
        buttons: ['Cancel', 'OK'],
        defaultId: 1,
        message: `Remove QnA Maker service: The Bot, the bot, the bot. Are you sure?`,
        cancelId: 0,
      });

      result = await it.next(result).value;
      expect(_type).toBe(SharedConstants.Commands.Bot.RemoveService);
      expect(_args[0]).toBe(ServiceTypes.QnA);
      expect(_args[1]).toBe('#1');
    });

    it('should ask the main process to remove the selected dispatch Maker service from the active bot', async () => {
      commandService.remoteCall = async () => ({ id: 'forget' } as any);

      action.payload.connectedService = JSON.parse(`{
          "type": "dispatch",
          "id": "#1",
          "name": "The Bot, the bot, the bot",
          "version": "0.1",
          "appId": "woot!",
          "authoringKey": "keykeykey",
          "subscriptionKey": "secret"
      }`);

      const it = contextMenuGen(action);
      let result = await it.next().value;
      expect(result.id).toBe('forget');

      let _type;
      let _args;
      commandService.remoteCall = async (type: string, ...args: any[]) => {
        _type = type;
        _args = args;
        return true as any;
      };

      result = await it.next(result).value;
      expect(result).toBeTruthy();
      expect(_type).toBe(SharedConstants.Commands.Electron.ShowMessageBox);
      expect(_args[1]).toEqual({
        type: 'question',
        buttons: ['Cancel', 'OK'],
        defaultId: 1,
        message: `Remove Dispatch service: The Bot, the bot, the bot. Are you sure?`,
        cancelId: 0,
      });

      result = await it.next(result).value;
      expect(_type).toBe(SharedConstants.Commands.Bot.RemoveService);
      expect(_args[0]).toBe(ServiceTypes.Dispatch);
      expect(_args[1]).toBe('#1');
    });
  });

  describe(' launchExternalLink', () => {
    let action: ConnectedServiceAction<ConnectedServicePayload>;
    let sagaIt;

    it(' should open a LIUS external link', async () => {
      const payload = {
        azureAuthWorkflowComponents: {
          loginFailedDialog: AzureLoginFailedDialogContainer,
          loginSuccessDialog: AzureLoginSuccessDialogContainer,
          promptDialog: ConnectServicePromptDialogContainer,
        },
        getStartedDialog: GetStartedWithCSDialogContainer,
        editorComponent: ConnectedServiceEditorContainer,
        pickerComponent: ConnectedServicePickerContainer,
        serviceType: ServiceTypes.Luis,
      };

      action = launchExternalLink(payload as any);
      sagaIt = ServicesExplorerSagas.launchExternalLink;

      const it = sagaIt(action);
      const result = it.next().value;

      expect(result).toEqual(
        call(
          [commandService, commandService.remoteCall],
          SharedConstants.Commands.Electron.OpenExternal,
          'https://luis.ai'
        )
      );
    });

    it(' should open a Dispatch external link', () => {
      const payload = {
        azureAuthWorkflowComponents: {
          loginFailedDialog: AzureLoginFailedDialogContainer,
          loginSuccessDialog: AzureLoginSuccessDialogContainer,
          promptDialog: ConnectServicePromptDialogContainer,
        },
        getStartedDialog: GetStartedWithCSDialogContainer,
        editorComponent: ConnectedServiceEditorContainer,
        pickerComponent: ConnectedServicePickerContainer,
        serviceType: ServiceTypes.Dispatch,
      };

      action = launchExternalLink(payload as any);
      sagaIt = ServicesExplorerSagas.launchExternalLink;

      const it = sagaIt(action);
      const result = it.next().value;

      expect(result).toEqual(
        call(
          [commandService, commandService.remoteCall],
          SharedConstants.Commands.Electron.OpenExternal,
          'https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-tutorial-dispatch?view=azure-bot-service-4.0&tabs=csharp'
        )
      );
    });

    it(' should open a QnA maker external link', () => {
      const payload = {
        azureAuthWorkflowComponents: {
          loginFailedDialog: AzureLoginFailedDialogContainer,
          loginSuccessDialog: AzureLoginSuccessDialogContainer,
          promptDialog: ConnectServicePromptDialogContainer,
        },
        getStartedDialog: GetStartedWithCSDialogContainer,
        editorComponent: ConnectedServiceEditorContainer,
        pickerComponent: ConnectedServicePickerContainer,
        serviceType: ServiceTypes.QnA,
      };

      action = launchExternalLink(payload as any);
      sagaIt = ServicesExplorerSagas.launchExternalLink;

      const it = sagaIt(action);
      const result = it.next().value;

      expect(result).toEqual(
        call(
          [commandService, commandService.remoteCall],
          SharedConstants.Commands.Electron.OpenExternal,
          'https://www.qnamaker.ai/'
        )
      );
    });
  });

  describe(' openAddConnectedServiceContextMenu', () => {
    let action: ConnectedServiceAction<OpenAddServiceContextMenuPayload>;
    let contextMenuGen;
    beforeEach(() => {
      const sagaIt = servicesExplorerSagas();

      const payload = {
        azureAuthWorkflowComponents: {
          loginFailedDialog: AzureLoginFailedDialogContainer,
          loginSuccessDialog: AzureLoginSuccessDialogContainer,
          promptDialog: ConnectServicePromptDialogContainer,
        },
        getStartedDialog: GetStartedWithCSDialogContainer,
        editorComponent: ConnectedServiceEditorContainer,
        pickerComponent: ConnectedServicePickerContainer,
      };

      action = openAddServiceContextMenu(payload, undefined);
      let i = 6;
      while (i--) {
        contextMenuGen = sagaIt.next().value.FORK.args[1];
      }
    });

    it('should launch the luis connected service picker workflow when the luis menu item is selected', async () => {
      commandService.remoteCall = async () => ({ id: ServiceTypes.Luis } as any);
      const it = contextMenuGen(action);
      let result = await it.next().value;

      expect(result.id).toBe(ServiceTypes.Luis);

      result = it.next(result).value.SELECT.selector(mockStore.getState()); // Indicates we've entered the workflow
      expect(result.access_token).toBe(mockArmToken);
    });
  });

  describe('openConnectedServiceDeepLink', () => {
    const mockModel = {
      type: ServiceTypes.Luis,
      appId: '1234',
      version: '0.1',
      region: 'westeurope',
    };
    let openConnectedServiceGen;
    beforeEach(() => {
      const sagaIt = servicesExplorerSagas();
      let i = 4;
      while (i--) {
        openConnectedServiceGen = sagaIt.next().value.FORK.args[1];
      }
    });

    it('should open the correct domain for luis models in the "westeurope" region', () => {
      window.open = jest.fn();
      const link = `https://eu.luis.ai/applications/1234/versions/0.1/build`;
      const action = openServiceDeepLink(mockModel as any);
      openConnectedServiceGen(action).next();
      expect(window.open).toHaveBeenCalledWith(link);
    });

    it('should open the correct domain for luis models in the "australiaeast" region', () => {
      window.open = jest.fn();
      mockModel.region = 'australiaeast';
      const link = `https://au.luis.ai/applications/1234/versions/0.1/build`;
      const action = openServiceDeepLink(mockModel as any);
      openConnectedServiceGen(action).next();
      expect(window.open).toHaveBeenCalledWith(link);
    });

    it('should open the correct domain for luis models in the "westus" region', () => {
      window.open = jest.fn();
      mockModel.region = 'westus';
      const link = `https://luis.ai/applications/1234/versions/0.1/build`;
      const action = openServiceDeepLink(mockModel as any);
      openConnectedServiceGen(action).next();
      expect(window.open).toHaveBeenCalledWith(link);
    });

    it('should open the correct service url for CosmosDB services', () => {
      window.open = jest.fn();
      const mock = {
        type: ServiceTypes.CosmosDB,
        collection: 'fdsa',
        database: 'fsa',
        endpoint: 'fsda',
        id: '206',
        name: 'Cosmos',
        resourceGroup: 'db-service',
        serviceName: 'cosmosdb',
        subscriptionId: '0389857f-aaaa-ssss-fff-gfsgfdsfgssdgfd',
        tenantId: 'microsoft.com',
      };

      const action = openServiceDeepLink(mock as any);
      openConnectedServiceGen(action).next();
      expect(window.open).toHaveBeenCalledWith(
        'https://ms.portal.azure.com/#@microsoft.com/resource/subscriptions/' +
          '0389857f-aaaa-ssss-fff-gfsgfdsfgssdgfd/resourceGroups/db-service/providers/Microsoft.DocumentDb/' +
          'databaseAccounts/cosmosdb/overview'
      );
    });

    it('should open the correct service url for BlobStorage services', () => {
      window.open = jest.fn();
      const mock = {
        type: ServiceTypes.BlobStorage,
        id: '206',
        name: 'Blob',
        resourceGroup: 'blob-service',
        serviceName: 'blob',
        subscriptionId: '0389857f-aaaa-ssss-fff-gfsgfdsfgssdgfd',
        tenantId: 'microsoft.com',
      };

      const action = openServiceDeepLink(mock as any);
      openConnectedServiceGen(action).next();
      expect(window.open).toHaveBeenCalledWith(
        'https://ms.portal.azure.com/#@microsoft.com/resource/subscriptions/' +
          '0389857f-aaaa-ssss-fff-gfsgfdsfgssdgfd/resourceGroups/blob-service/providers/Microsoft.Storage/' +
          'storageAccounts/blob/overview'
      );
    });

    it('should open the correct service url for AppInsights services', () => {
      window.open = jest.fn();
      const mock = {
        type: ServiceTypes.AppInsights,
        id: '206',
        name: 'appInsights',
        resourceGroup: 'appInsights-service',
        serviceName: 'appInsights',
        subscriptionId: '0389857f-aaaa-ssss-fff-gfsgfdsfgssdgfd',
        tenantId: 'microsoft.com',
      };

      const action = openServiceDeepLink(mock as any);
      openConnectedServiceGen(action).next();
      expect(window.open).toHaveBeenCalledWith(
        'https://ms.portal.azure.com/#@microsoft.com/resource/subscriptions/' +
          '0389857f-aaaa-ssss-fff-gfsgfdsfgssdgfd/resourceGroups/appInsights-service/providers/microsoft.insights/' +
          'components/appInsights/overview'
      );
    });

    it('should open the correct service URL for qnaMaker services', () => {
      window.open = jest.fn();
      mockModel.type = ServiceTypes.QnA;
      (mockModel as any).kbId = '45432';

      const action = openServiceDeepLink(mockModel as any);
      openConnectedServiceGen(action).next();
      expect(window.open).toHaveBeenCalledWith('https://www.qnamaker.ai/Edit/KnowledgeBase?kbId=45432');
    });
  });

  it('should open the sort context menu', () => {
    const action: any = {
      payload: {
        panelId: 'servicesPanel',
        menuCoords: {
          x: 150,
          y: 200,
        },
      },
    };
    const gen = ServicesExplorerSagas.openSortContextMenu(action);
    gen.next();
    // inject result of select() and check next yield
    expect(gen.next({ servicesPanel: 'name' }).value).toEqual(
      call(
        [commandService, commandService.remoteCall],
        SharedConstants.Commands.Electron.DisplayContextMenu,
        [
          {
            label: 'Sort by name',
            id: 'name',
            type: 'checkbox',
            checked: true,
          },
          {
            label: 'Sort by type',
            id: 'type',
            type: 'checkbox',
            checked: false,
          },
        ],
        { x: 150, y: 200 }
      )
    );
    // inject result of call() and check next yield
    expect(gen.next({ id: 'someId' }).value).toEqual(put(sortExplorerContents(action.payload.panelId, 'someId')));
    expect(gen.next().done).toBe(true);
  });
});
