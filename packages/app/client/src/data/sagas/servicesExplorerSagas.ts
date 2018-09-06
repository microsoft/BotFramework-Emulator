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
  IBotService,
  IConnectedService,
  ILuisService,
  IQnAService,
  ServiceTypes
} from 'botframework-config/lib/schema';
import { BotConfigurationBase } from 'botframework-config/lib/botConfigurationBase';
import { ForkEffect, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import { CommandServiceImpl } from '../../platform/commands/commandServiceImpl';
import { DialogService } from '../../ui/dialogs/service';
import {
  ConnectedServiceAction,
  ConnectedServicePayload,
  ConnectedServicePickerPayload,
  LAUNCH_CONNECTED_SERVICE_EDITOR,
  LAUNCH_CONNECTED_SERVICE_PICKER,
  OPEN_ADD_CONNECTED_SERVICE_CONTEXT_MENU,
  OPEN_CONNECTED_SERVICE_SORT_CONTEXT_MENU,
  OPEN_CONTEXT_MENU_FOR_CONNECTED_SERVICE,
  OPEN_SERVICE_DEEP_LINK
} from '../action/connectedServiceActions';
import { ServiceCodes, SharedConstants } from '@bfemulator/app-shared';
import { RootState } from '../store';
import { ArmTokenData, beginAzureAuthWorkflow } from '../action/azureAuthActions';
import { getArmToken } from './azureAuthSaga';
import { BotConfigWithPath } from '@bfemulator/sdk-shared';
import { SortCriteria } from '../reducer/explorer';
import { sortExplorerContents } from '../action/explorerActions';
import { serviceTypeLabels } from '../../utils/serviceTypeLables';

declare type ServicesPayload = { services: IConnectedService[], code: ServiceCodes };

const getArmTokenFromState = (state: RootState): ArmTokenData => state.azureAuth;
const geBotConfigFromState = (state: RootState): BotConfigWithPath => state.bot.activeBot;
const getSortSelection = (state: RootState): { [paneldId: string]: SortCriteria } =>
  state.explorer.sortSelectionByPanelId;

function* launchConnectedServicePicker(action: ConnectedServiceAction<ConnectedServicePickerPayload>)
  : IterableIterator<any> {
  // To retrieve the luis models, we must have the authoring key.
  // To get the authoring key, we need the arm token
  let armTokenData: ArmTokenData = yield select(getArmTokenFromState);
  if (!armTokenData || !armTokenData.access_token) {
    const { promptDialog, loginSuccessDialog, loginFailedDialog } = action.payload.azureAuthWorkflowComponents;
    armTokenData = yield* getArmToken(beginAzureAuthWorkflow(promptDialog, loginSuccessDialog, loginFailedDialog));
  }
  if (!armTokenData) {
    return null; // canceled or failed somewhere
  }
  // Add the authenticated user to the action since we now have the token
  action.payload.authenticatedUser = JSON.parse(atob(armTokenData.access_token.split('.')[1])).upn;
  const { serviceType, progressIndicatorComponent } = action.payload;
  if (progressIndicatorComponent) {
    DialogService.showDialog(progressIndicatorComponent).catch();
  }
  let payload: ServicesPayload = yield* retrieveServicesByServiceType(serviceType);

  if (progressIndicatorComponent) {
    DialogService.hideDialog();
  }

  if (payload.code !== ServiceCodes.OK || !payload.services.length) {
    const { getStartedDialog, authenticatedUser } = action.payload;
    const result = yield DialogService.showDialog(getStartedDialog, {
      serviceType,
      authenticatedUser,
      showNoModelsFoundContent: !payload.services.length
    });
    // Sign up with XXXX
    if (result === 1) {
      // TODO - launch an external link
    }
    // Add services manually
    if (result === 2) {
      yield* launchConnectedServiceEditor(action);
    }
  } else {
    const servicesToAdd = yield* launchConnectedServicePickList(action, payload.services, serviceType);
    if (servicesToAdd) {
      const botFile: BotConfigWithPath = yield select(geBotConfigFromState);
      botFile.services.push(...servicesToAdd);
      const { Bot } = SharedConstants.Commands;
      yield CommandServiceImpl.remoteCall(Bot.Save, botFile);
    }
  }
}

function* launchConnectedServicePickList(action: ConnectedServiceAction<ConnectedServicePickerPayload>,
                                         availableServices: IConnectedService[],
                                         serviceType: ServiceTypes): IterableIterator<any> {

  const { pickerComponent, authenticatedUser, serviceType: type } = action.payload;
  let result = yield DialogService.showDialog(pickerComponent, {
    availableServices,
    authenticatedUser,
    serviceType
  });

  if (result === 1) {
    action.payload.connectedService = BotConfigurationBase.serviceFromJSON({
      type,
      hostname: '' /* defect workaround */
    } as any);
    result = yield* launchConnectedServiceEditor(action);
  }

  return result;
}

function* retrieveServicesByServiceType(serviceType: ServiceTypes): IterableIterator<any> {
  let armTokenData: ArmTokenData = yield select(getArmTokenFromState);
  if (!armTokenData || !armTokenData.access_token) {
    throw new Error('Auth credentials do not exist.');
  }
  const { GetConnectedServicesByType } = SharedConstants.Commands.ConnectedService;
  let payload: ServicesPayload;
  try {
    payload = yield CommandServiceImpl.remoteCall(GetConnectedServicesByType, armTokenData.access_token, serviceType);
  } catch {
    payload = { services: [], code: ServiceCodes.Error };
  }
  return payload;
}

function* openConnectedServiceDeepLink(action: ConnectedServiceAction<ConnectedServicePayload>): IterableIterator<any> {
  const { connectedService } = action.payload;
  switch (connectedService.type) {
    case ServiceTypes.Luis:
      return openLuisDeepLink(connectedService as ILuisService);

    case ServiceTypes.Bot:
      return openAzureBotServiceDeepLink(connectedService as IBotService);

    case ServiceTypes.Dispatch:
      return Promise.resolve(false); // TODO - Hook up proper link when available

    case ServiceTypes.QnA:
      return openQnaMakerDeepLink(connectedService as IQnAService);

    default:
      return Promise.reject('unknown service type');
  }
}

function* openContextMenuForService(action: ConnectedServiceAction<ConnectedServicePayload>)
  : IterableIterator<any> {
  const menuItems = [
    { label: 'Manage service', id: 'open' },
    { label: 'Edit configuration', id: 'edit' },
    { label: 'Forget this service', id: 'forget' }
  ];
  const response = yield CommandServiceImpl.remoteCall(SharedConstants.Commands.Electron.DisplayContextMenu, menuItems);
  const { connectedService } = action.payload;
  switch (response.id) {
    case 'open':
      yield* openConnectedServiceDeepLink(action);
      break;

    case 'edit':
      yield* launchConnectedServiceEditor(action);
      break;

    case 'forget':
      yield* removeServiceFromActiveBot(connectedService);
      break;

    default: // canceled context menu
      return;
  }
}

function* openAddConnectedServiceContextMenu(action: ConnectedServiceAction<ConnectedServicePickerPayload>)
  : IterableIterator<any> {
  const menuItems = [
    { label: 'Language Understanding (LUIS)', id: ServiceTypes.Luis },
    { label: 'QnA Maker', id: ServiceTypes.QnA },
    { label: 'Dispatch', id: ServiceTypes.Dispatch }
  ];

  const response = yield CommandServiceImpl.remoteCall(SharedConstants.Commands.Electron.DisplayContextMenu, menuItems);
  const { id: serviceType } = response;
  action.payload.serviceType = serviceType;
  yield* launchConnectedServicePicker(action);
}

function* openSortContextMenu(action: ConnectedServiceAction<ConnectedServicePayload>): IterableIterator<any> {
  const sortSelectionByPanelId = yield select(getSortSelection);
  const currentSort = sortSelectionByPanelId[action.payload.panelId];
  const menuItems = [
    { label: 'Sort by name', id: 'name', type: 'checkbox', checked: currentSort === 'name' },
    { label: 'Sort by type', id: 'type', type: 'checkbox', checked: currentSort === 'type' },
  ];
  const response = yield CommandServiceImpl.remoteCall(SharedConstants.Commands.Electron.DisplayContextMenu, menuItems);
  yield response.id ? put(sortExplorerContents(action.payload.panelId, response.id)) : null;
}

function* removeServiceFromActiveBot(connectedService: IConnectedService): IterableIterator<any> {
  // TODO - localization
  const result = yield CommandServiceImpl.remoteCall(SharedConstants.Commands.Electron.ShowMessageBox, true, {
    type: 'question',
    buttons: ['Cancel', 'OK'],
    defaultId: 1,
    message: `Remove ${serviceTypeLabels[connectedService.type]} service: ${connectedService.name}. Are you sure?`,
    cancelId: 0,
  });
  if (result) {
    const { RemoveService } = SharedConstants.Commands.Bot;
    yield CommandServiceImpl.remoteCall(RemoveService, connectedService.type, connectedService.id);
  }
}

function* launchConnectedServiceEditor(action: ConnectedServiceAction<ConnectedServicePayload>)
  : IterableIterator<any> {
  const { editorComponent, authenticatedUser, connectedService, serviceType } = action.payload;
  const result = yield DialogService.showDialog(editorComponent, { connectedService, authenticatedUser, serviceType });

  if (result) {
    yield CommandServiceImpl.remoteCall(SharedConstants.Commands.Bot.AddOrUpdateService, ServiceTypes.Luis, result[0]);
  }
}

function openLuisDeepLink(luisService: ILuisService): Promise<any> {
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
  const link = `https://www.${regionPrefix}luis.ai/applications/${appId}/versions/${version}/build`;
  return CommandServiceImpl.remoteCall(SharedConstants.Commands.Electron.OpenExternal, link);
}

function openQnaMakerDeepLink(service: IQnAService): Promise<any> {
  const { kbId } = service;
  const link = `https://qnamaker.ai/Edit/KnowledgeBase?kbid=${kbId}`;
  return CommandServiceImpl.remoteCall(SharedConstants.Commands.Electron.OpenExternal, link);
}

function openAzureBotServiceDeepLink(service: IBotService): Promise<any> {
  const { tenantId, subscriptionId, resourceGroup, id } = service;
  const thankYouTsLint = `https://ms.portal.azure.com/#@${tenantId}/resource/subscriptions/${subscriptionId}`;
  const link = `${thankYouTsLint}/resourceGroups/${resourceGroup}/providers/Microsoft.BotService/botServices/${id}`;
  return CommandServiceImpl.remoteCall(SharedConstants.Commands.Electron.OpenExternal, link + '/channels');
}

export function* servicesExplorerSagas(): IterableIterator<ForkEffect> {
  yield takeLatest(LAUNCH_CONNECTED_SERVICE_PICKER, launchConnectedServicePicker);
  yield takeLatest(LAUNCH_CONNECTED_SERVICE_EDITOR, launchConnectedServiceEditor);
  yield takeEvery(OPEN_SERVICE_DEEP_LINK, openConnectedServiceDeepLink);
  yield takeEvery(OPEN_CONTEXT_MENU_FOR_CONNECTED_SERVICE, openContextMenuForService);
  yield takeEvery(OPEN_ADD_CONNECTED_SERVICE_CONTEXT_MENU, openAddConnectedServiceContextMenu);
  yield takeEvery(OPEN_CONNECTED_SERVICE_SORT_CONTEXT_MENU, openSortContextMenu);
}
