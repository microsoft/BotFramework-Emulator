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

import { ILuisService, ServiceType } from 'msbot/bin/schema';
import { ComponentClass } from 'react';
import { call, ForkEffect, takeEvery, takeLatest } from 'redux-saga/effects';
import { CommandServiceImpl } from '../../platform/commands/commandServiceImpl';
import { DialogService } from '../../ui/dialogs/service';
import { LuisEditor } from '../../ui/shell/explorer/luisExplorer/luisEditor/luisEditor';
import {
  LAUNCH_LUIS_EDITOR,
  LuisEditorPayload,
  LuisServiceAction,
  LuisServicePayload,
  OPEN_LUIS_CONTEXT_MENU,
  OPEN_LUIS_DEEP_LINK
} from '../action/luisServiceActions';
// import { LuisApi } from '../http/luisApi';
import { SharedConstants } from '@bfemulator/app-shared';

// const isModalServiceBusy = (state: RootState) => state.dialog.showing;

// function* launchLuisModelsViewer(action: AzureAuthAction<LuisModelViewer>): IterableIterator<any> {
//   let azureAuth = yield select(getLuisAuthFromState);
//   if (!azureAuth) {
//     azureAuth = yield call(
//      CommandServiceImpl.remoteCall.bind(CommandServiceImpl),
//      SharedConstants.Commands.Azure.RetrieveArmToken
//    );
//     yield put(azureArmTokenDataChanged(azureAuth));
//   }
//   const luisModels = yield* retrieveLuisModels();
//   yield* beginModelViewLifeCycle(action, luisModels);
// }

// function* beginModelViewLifeCycle(action: AzureAuthAction<LuisModelViewer>,
//                                   luisModels: LuisModel[]): IterableIterator<any> {
//   const isBusy = yield select(isModalServiceBusy);
//   if (isBusy) {
//     throw new Error('More than one modal cannot be displayed at the same time.');
//   }
//
//   const { luisModelViewer } = action.payload;
//   const result = yield DialogService.showDialog<ComponentClass<LuisModelViewer>>(luisModelViewer, { luisModels });
//   // TODO - write this to the bot file
//   return result;
// }
//
// function* retrieveLuisModels(): IterableIterator<any> {
//   const luisAuth = yield select(getLuisAuthFromState);
//   if (!luisAuth) {
//     throw new Error('Auth credentials do not exist.');
//   }
//   const luisModels = yield LuisApi.getApplicationsList(luisAuth);
//   return yield luisModels;
// }

function* openLuisDeepLink(action: LuisServiceAction<LuisServicePayload>): IterableIterator<any> {
  const { appId, version } = action.payload.luisService;
  const link = `https://www.luis.ai/applications/${appId}/versions/${version}/build`;
  yield CommandServiceImpl.remoteCall(SharedConstants.Commands.Electron.OpenExternal, link);
}

function* openLuisContextMenu(action: LuisServiceAction<LuisServicePayload>): IterableIterator<any> {
  const menuItems = [
    { label: 'Open in web portal', id: 'open' },
    { label: 'Edit settings', id: 'edit' },
    { label: 'Forget this service', id: 'forget' }
  ];
  const response = yield call(CommandServiceImpl
    .remoteCall.bind(CommandServiceImpl), SharedConstants.Commands.Electron.DisplayContextMenu, menuItems);
  switch (response.id) {

    case 'open':
      yield* openLuisDeepLink(action);
      break;

    case 'edit':
      yield* launchLuisEditor(action);
      break;

    case 'forget':
      yield* removeLuisServiceFromActiveBot(action.payload.luisService);
      break;

    default: // canceled context menu
      return;
  }
}

function* removeLuisServiceFromActiveBot(luisService: ILuisService): IterableIterator<any> {
  // TODO - localization
  const result = yield CommandServiceImpl.remoteCall(SharedConstants.Commands.Electron.ShowMessageBox, true, {
    type: 'question',
    buttons: ['Cancel', 'OK'],
    defaultId: 1,
    message: `Remove LUIS service ${luisService.name}. Are you sure?`,
    cancelId: 0,
  });
  if (result) {
    yield CommandServiceImpl.remoteCall(SharedConstants.Commands.Bot.RemoveService, ServiceType.Luis, luisService.id);
  }
}

function* launchLuisEditor(action: LuisServiceAction<LuisEditorPayload>): IterableIterator<any> {
  const { luisEditorComponent, luisService = {} } = action.payload;
  const result = yield DialogService.showDialog<ComponentClass<LuisEditor>>(luisEditorComponent, { luisService });
  if (result) {
    yield CommandServiceImpl.remoteCall(SharedConstants.Commands.Bot.AddOrUpdateService, ServiceType.Luis, result);
  }
}

export function* luisSagas(): IterableIterator<ForkEffect> {
  //  yield takeLatest(LUIS_LAUNCH_MODELS_VIEWER, launchLuisModelsViewer);
  yield takeLatest(LAUNCH_LUIS_EDITOR, launchLuisEditor);
  // yield takeEvery(RETRIEVE_LUIS_MODELS, retrieveLuisModels);
  yield takeEvery(OPEN_LUIS_DEEP_LINK, openLuisDeepLink);
  yield takeEvery(OPEN_LUIS_CONTEXT_MENU, openLuisContextMenu);
}
