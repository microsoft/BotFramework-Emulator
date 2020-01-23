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
  beginAzureAuthWorkflow,
  sortExplorerContents,
  ArmTokenData,
  ConnectedServiceAction,
  ConnectedServicePayload,
  ConnectedServicePickerPayload,
  ServiceCodes,
  SharedConstants,
  SortCriteria,
  LAUNCH_CONNECTED_SERVICE_EDITOR,
  LAUNCH_CONNECTED_SERVICE_PICKER,
  LAUNCH_EXTERNAL_LINK,
  OPEN_ADD_CONNECTED_SERVICE_CONTEXT_MENU,
  OPEN_CONNECTED_SERVICE_SORT_CONTEXT_MENU,
  OPEN_CONTEXT_MENU_FOR_CONNECTED_SERVICE,
  OPEN_SERVICE_DEEP_LINK,
  OpenAddServiceContextMenuPayload,
  OpenSortContextMenuPayload,
} from '@bfemulator/app-shared';
import { BotConfigWithPath, CommandServiceImpl, CommandServiceInstance } from '@bfemulator/sdk-shared';
import { BotConfigurationBase } from 'botframework-config/lib/botConfigurationBase';
import {
  IAzureService,
  IConnectedService,
  IGenericService,
  ILuisService,
  IQnAService,
  ServiceTypes,
} from 'botframework-config/lib/schema';
import { call, ForkEffect, put, select, takeEvery, takeLatest } from 'redux-saga/effects';

import { DialogService } from '../../ui/dialogs/service';
import { serviceTypeLabels } from '../../utils/serviceTypeLables';
import { RootState } from '../store';
import { QnAMakerSampleHostname } from '../../constants';

import { AzureAuthSaga } from './azureAuthSaga';

declare interface ServicesPayload {
  services: IConnectedService[];
  code: ServiceCodes;
}

const getArmTokenFromState = (state: RootState): ArmTokenData => state.azureAuth;
const geBotConfigFromState = (state: RootState): BotConfigWithPath => state.bot.activeBot;
const getSortSelection = (state: RootState): { [paneldId: string]: SortCriteria } =>
  state.explorer.sortSelectionByPanelId;

export class ServicesExplorerSagas {
  @CommandServiceInstance()
  protected static commandService: CommandServiceImpl;

  public static *launchConnectedServicePicker(
    action: ConnectedServiceAction<ConnectedServicePickerPayload>
  ): IterableIterator<any> {
    // To retrieve azure services, luis models and KBs,
    // we must have the authoring key.
    // To get the authoring key, we need the arm token.
    let armTokenData: ArmTokenData & number = yield select(getArmTokenFromState);
    if (!armTokenData || !armTokenData.access_token) {
      const { promptDialog, loginSuccessDialog, loginFailedDialog } = action.payload.azureAuthWorkflowComponents;
      armTokenData = yield* AzureAuthSaga.getArmToken(
        beginAzureAuthWorkflow(
          promptDialog,
          { serviceType: action.payload.serviceType },
          loginSuccessDialog,
          loginFailedDialog
        )
      );
    }

    // 2 means the user has chosen to manually enter the connected service
    if (armTokenData === 2) {
      yield* ServicesExplorerSagas.launchConnectedServiceEditor(action);
      return;
    }
    if (!armTokenData || 'error' in armTokenData) {
      return null; // canceled or failed somewhere
    }
    // Add the authenticated user to the action since we now have the token
    const pJson = JSON.parse(atob(armTokenData.access_token.split('.')[1]));
    action.payload.authenticatedUser = pJson.upn || pJson.unique_name || pJson.name || pJson.email;
    const { serviceType, progressIndicatorComponent } = action.payload;
    if (progressIndicatorComponent) {
      DialogService.showDialog(progressIndicatorComponent).catch();
    }
    const payload: ServicesPayload = yield* ServicesExplorerSagas.retrieveServicesByServiceType(serviceType);

    if (progressIndicatorComponent) {
      DialogService.hideDialog();
    }

    if (payload.code !== ServiceCodes.OK || !payload.services.length) {
      const { getStartedDialog, authenticatedUser } = action.payload;
      const result = yield DialogService.showDialog(getStartedDialog, {
        serviceType,
        authenticatedUser,
        showNoModelsFoundContent: !payload.services.length,
      });
      // Sign up with XXXX
      if (result === 1) {
        yield* ServicesExplorerSagas.launchExternalLink(action);
      }
      // Add services manually
      if (result === 2) {
        yield* ServicesExplorerSagas.launchConnectedServiceEditor(action);
      }
    } else {
      const servicesToAdd = yield* ServicesExplorerSagas.launchConnectedServicePickList(
        action,
        payload.services,
        serviceType
      );
      if (servicesToAdd) {
        const botFile: BotConfigWithPath = yield select(geBotConfigFromState);
        botFile.services.push(...servicesToAdd);
        const { Bot } = SharedConstants.Commands;
        yield ServicesExplorerSagas.commandService.remoteCall(Bot.Save, botFile);
      }
    }
  }

  public static *launchConnectedServicePickList(
    action: ConnectedServiceAction<ConnectedServicePickerPayload>,
    availableServices: IConnectedService[],
    serviceType: ServiceTypes
  ): IterableIterator<any> {
    const { pickerComponent, authenticatedUser, serviceType: type } = action.payload;
    let result = yield DialogService.showDialog(pickerComponent, {
      availableServices,
      authenticatedUser,
      serviceType,
    });

    if (result === 1) {
      action.payload.connectedService = BotConfigurationBase.serviceFromJSON({
        type,
        hostname: QnAMakerSampleHostname,
      } as any);
      result = yield* ServicesExplorerSagas.launchConnectedServiceEditor(action);
    }

    return result;
  }

  public static *retrieveServicesByServiceType(serviceType: ServiceTypes): IterableIterator<any> {
    const armTokenData: ArmTokenData = yield select(getArmTokenFromState);
    if (!armTokenData || !armTokenData.access_token) {
      throw new Error('Auth credentials do not exist.');
    }
    const { GetConnectedServicesByType } = SharedConstants.Commands.ConnectedService;
    let payload: ServicesPayload;
    try {
      payload = yield ServicesExplorerSagas.commandService.remoteCall(
        GetConnectedServicesByType,
        armTokenData.access_token,
        serviceType
      );
    } catch (e) {
      payload = { services: [], code: ServiceCodes.Error };
    }
    return payload;
  }

  // eslint-disable-next-line require-yield
  public static *openConnectedServiceDeepLink(
    action: ConnectedServiceAction<ConnectedServicePayload>
  ): IterableIterator<any> {
    const { connectedService } = action.payload;
    switch (connectedService.type) {
      case ServiceTypes.AppInsights:
        return ServicesExplorerSagas.openAzureProviderDeepLink(
          'microsoft.insights/components',
          connectedService as IAzureService
        );

      case ServiceTypes.BlobStorage:
        return ServicesExplorerSagas.openAzureProviderDeepLink(
          'Microsoft.Storage/storageAccounts',
          connectedService as IAzureService
        );

      case ServiceTypes.Bot:
        return ServicesExplorerSagas.openAzureProviderDeepLink(
          'Microsoft.BotService/botServices',
          connectedService as IAzureService
        );

      case ServiceTypes.CosmosDB:
        return ServicesExplorerSagas.openAzureProviderDeepLink(
          'Microsoft.DocumentDb/databaseAccounts',
          connectedService as IAzureService
        );

      case ServiceTypes.Generic:
        return window.open((connectedService as IGenericService).url);

      case ServiceTypes.Luis:
        return ServicesExplorerSagas.openLuisDeepLink(connectedService as ILuisService);

      case ServiceTypes.QnA:
        return ServicesExplorerSagas.openQnaMakerDeepLink(connectedService as IQnAService);

      default:
        return window.open('https://portal.azure.com');
    }
  }

  public static *launchExternalLink(action: ConnectedServiceAction<ConnectedServicePayload>): IterableIterator<any> {
    const serviceType = action.payload.serviceType;
    switch (serviceType) {
      case ServiceTypes.QnA:
        yield call(
          [ServicesExplorerSagas.commandService, ServicesExplorerSagas.commandService.remoteCall],
          SharedConstants.Commands.Electron.OpenExternal,
          'https://www.qnamaker.ai/'
        );
        break;

      case ServiceTypes.Dispatch:
        yield call(
          [ServicesExplorerSagas.commandService, ServicesExplorerSagas.commandService.remoteCall],
          SharedConstants.Commands.Electron.OpenExternal,
          'https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-tutorial-dispatch?view=azure-bot-service-4.0&tabs=csharp'
        );
        break;

      case ServiceTypes.Luis:
        yield call(
          [ServicesExplorerSagas.commandService, ServicesExplorerSagas.commandService.remoteCall],
          SharedConstants.Commands.Electron.OpenExternal,
          'https://luis.ai'
        );
        break;

      default:
        return;
    }
  }

  public static *openContextMenuForService(
    action: ConnectedServiceAction<ConnectedServicePayload>
  ): IterableIterator<any> {
    const menuItems = [
      { label: 'Manage service', id: 'open' },
      { label: 'Edit configuration', id: 'edit' },
      { label: 'Disconnect this service', id: 'forget' },
    ];
    const response = yield ServicesExplorerSagas.commandService.remoteCall(
      SharedConstants.Commands.Electron.DisplayContextMenu,
      menuItems
    );
    const { connectedService } = action.payload;
    action.payload.serviceType = connectedService.type;
    switch (response.id) {
      case 'open':
        yield* ServicesExplorerSagas.openConnectedServiceDeepLink(action);
        break;

      case 'edit':
        yield* ServicesExplorerSagas.launchConnectedServiceEditor(action);
        break;

      case 'forget':
        yield* ServicesExplorerSagas.removeServiceFromActiveBot(connectedService);
        break;

      default:
        // canceled context menu
        return;
    }
  }

  public static *openAddConnectedServiceContextMenu(
    action: ConnectedServiceAction<OpenAddServiceContextMenuPayload>
  ): IterableIterator<any> {
    const { menuCoords, resolver } = action.payload;
    const menuItems = [
      { label: 'Add Language Understanding (LUIS)', id: ServiceTypes.Luis },
      { label: 'Add QnA Maker', id: ServiceTypes.QnA },
      { label: 'Add Dispatch', id: ServiceTypes.Dispatch },
      { type: 'separator' },
      { label: 'Add Azure Cosmos DB account', id: ServiceTypes.CosmosDB },
      { label: 'Add Azure Storage account', id: ServiceTypes.BlobStorage },
      { label: 'Add Azure Application Insights', id: ServiceTypes.AppInsights },
      { type: 'separator' },
      { label: 'Add other service …', id: ServiceTypes.Generic },
    ];

    const response = yield ServicesExplorerSagas.commandService.remoteCall(
      SharedConstants.Commands.Electron.DisplayContextMenu,
      menuItems,
      menuCoords
    );

    const { id: serviceType } = response;
    action.payload.serviceType = serviceType;
    if (serviceType === ServiceTypes.Generic || serviceType === ServiceTypes.AppInsights) {
      yield* ServicesExplorerSagas.launchConnectedServiceEditor(action);
    } else {
      yield* ServicesExplorerSagas.launchConnectedServicePicker(action);
    }

    resolver && resolver();
  }

  public static *openSortContextMenu(
    action: ConnectedServiceAction<OpenSortContextMenuPayload>
  ): IterableIterator<any> {
    const { menuCoords } = action.payload;
    const sortSelectionByPanelId = yield select(getSortSelection);
    const currentSort = sortSelectionByPanelId[action.payload.panelId];
    const menuItems = [
      {
        label: 'Sort by name',
        id: 'name',
        type: 'checkbox',
        checked: currentSort === 'name',
      },
      {
        label: 'Sort by type',
        id: 'type',
        type: 'checkbox',
        checked: currentSort === 'type',
      },
    ];
    const response = yield call(
      [ServicesExplorerSagas.commandService, ServicesExplorerSagas.commandService.remoteCall],
      SharedConstants.Commands.Electron.DisplayContextMenu,
      menuItems,
      menuCoords
    );
    yield response.id ? put(sortExplorerContents(action.payload.panelId, response.id)) : null;
  }

  public static *removeServiceFromActiveBot(connectedService: IConnectedService): IterableIterator<any> {
    // TODO - localization
    const result = yield ServicesExplorerSagas.commandService.remoteCall(
      SharedConstants.Commands.Electron.ShowMessageBox,
      true,
      {
        type: 'question',
        buttons: ['Cancel', 'OK'],
        defaultId: 1,
        message: `Remove ${serviceTypeLabels[connectedService.type]} service: ${connectedService.name}. Are you sure?`,
        cancelId: 0,
      }
    );
    if (result) {
      const { RemoveService } = SharedConstants.Commands.Bot;
      yield ServicesExplorerSagas.commandService.remoteCall(RemoveService, connectedService.type, connectedService.id);
    }
  }

  public static *launchConnectedServiceEditor(
    action: ConnectedServiceAction<ConnectedServicePayload>
  ): IterableIterator<any> {
    const { editorComponent, authenticatedUser, connectedService, serviceType } = action.payload;
    const servicesToUpdate: IConnectedService[] = yield DialogService.showDialog(editorComponent, {
      connectedService,
      authenticatedUser,
      serviceType,
    });

    if (servicesToUpdate) {
      let i = servicesToUpdate.length;
      while (i--) {
        const service = servicesToUpdate[i];
        yield ServicesExplorerSagas.commandService.remoteCall(
          SharedConstants.Commands.Bot.AddOrUpdateService,
          service.type,
          service
        );
      }
    }
    return null;
  }

  public static openAzureProviderDeepLink(provider: string, azureService: IAzureService): void {
    const { tenantId, subscriptionId, resourceGroup, serviceName } = azureService;
    const bits = [
      `https://ms.portal.azure.com/#@${tenantId}/resource/`,
      `subscriptions/${subscriptionId}/`,
      `resourceGroups/${encodeURI(resourceGroup)}/`,
      `providers/${provider}/${encodeURI(serviceName)}/overview`,
    ];

    window.open(bits.join(''));
  }

  public static openLuisDeepLink(luisService: ILuisService) {
    const { appId, version, region } = luisService;
    let regionPrefix: string;
    switch (region) {
      case 'westeurope':
        regionPrefix = 'eu.';
        break;

      case 'australiaeast':
        regionPrefix = 'au.';
        break;

      default:
        regionPrefix = '';
        break;
    }
    const linkArray = ['https://', `${encodeURI(regionPrefix)}`, 'luis.ai/applications/'];
    linkArray.push(`${encodeURI(appId)}`, '/versions/', `${encodeURI(version)}`, '/build');
    const link = linkArray.join('');
    window.open(link);
  }

  public static openQnaMakerDeepLink(service: IQnAService) {
    const { kbId } = service;
    const link = `https://www.qnamaker.ai/Edit/KnowledgeBase?kbId=${encodeURIComponent(kbId)}`;
    window.open(link);
  }
}

export function* servicesExplorerSagas(): IterableIterator<ForkEffect> {
  yield takeLatest(LAUNCH_CONNECTED_SERVICE_PICKER, ServicesExplorerSagas.launchConnectedServicePicker);
  yield takeLatest(LAUNCH_CONNECTED_SERVICE_EDITOR, ServicesExplorerSagas.launchConnectedServiceEditor);
  yield takeEvery(LAUNCH_EXTERNAL_LINK, ServicesExplorerSagas.launchExternalLink);
  yield takeEvery(OPEN_SERVICE_DEEP_LINK, ServicesExplorerSagas.openConnectedServiceDeepLink);
  yield takeEvery(OPEN_CONTEXT_MENU_FOR_CONNECTED_SERVICE, ServicesExplorerSagas.openContextMenuForService);
  yield takeEvery(OPEN_ADD_CONNECTED_SERVICE_CONTEXT_MENU, ServicesExplorerSagas.openAddConnectedServiceContextMenu);
  yield takeEvery(OPEN_CONNECTED_SERVICE_SORT_CONTEXT_MENU, ServicesExplorerSagas.openSortContextMenu);
}
