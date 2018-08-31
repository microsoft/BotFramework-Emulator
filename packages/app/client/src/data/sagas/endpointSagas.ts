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

import { IEndpointService, ServiceTypes } from 'botframework-config/lib/schema';
import { ComponentClass } from 'react';
import { call, ForkEffect, takeEvery, takeLatest } from 'redux-saga/effects';
import { CommandServiceImpl } from '../../platform/commands/commandServiceImpl';
import { DialogService } from '../../ui/dialogs/service';
import { EndpointEditor } from '../../ui/shell/explorer/endpointExplorer/endpointEditor/endpointEditor';
import {
  EndpointEditorPayload,
  EndpointServiceAction,
  EndpointServicePayload,
  LAUNCH_ENDPOINT_EDITOR,
  OPEN_ENDPOINT_CONTEXT_MENU,
  OPEN_ENDPOINT_DEEP_LINK
} from '../action/endpointServiceActions';
import { SharedConstants } from '@bfemulator/app-shared';

function* launchEndpointEditor(action: EndpointServiceAction<EndpointEditorPayload>): IterableIterator<any> {
  const { endpointEditorComponent, endpointService = {} } = action.payload;
  const result = yield DialogService
    .showDialog<ComponentClass<EndpointEditor>>(endpointEditorComponent, { endpointService });
  if (result) {
    yield CommandServiceImpl.remoteCall(SharedConstants.Commands.Bot.AddOrUpdateService, ServiceTypes.Endpoint, result);
  }
}

function* openEndpointContextMenu(action: EndpointServiceAction<EndpointServicePayload | EndpointEditorPayload>)
  : IterableIterator<any> {
  const menuItems = [
    { label: 'Edit settings', id: 'edit' },
    { label: 'Open in emulator', id: 'open' },
    { label: 'Remove', id: 'forget' }
  ];
  const response = yield call(CommandServiceImpl
    .remoteCall.bind(CommandServiceImpl), SharedConstants.Commands.Electron.DisplayContextMenu, menuItems);
  switch (response.id) {
    case 'edit':
      yield* launchEndpointEditor(action);
      break;

    case 'open':
      yield* openEndpointDeepLink(action);
      break;

    case 'forget':
      yield* removeEndpointServiceFromActiveBot(action.payload.endpointService);
      break;

    default: // canceled context menu
      return;
  }
}

function* openEndpointDeepLink(action: EndpointServiceAction<EndpointServicePayload>): IterableIterator<any> {
  CommandServiceImpl.call(SharedConstants.Commands.Emulator.NewLiveChat, action.payload.endpointService).catch();
}

function* removeEndpointServiceFromActiveBot(endpointService: IEndpointService): IterableIterator<any> {
  const result = yield CommandServiceImpl.remoteCall(SharedConstants.Commands.Electron.ShowMessageBox, true, {
    type: 'question',
    buttons: ['Cancel', 'OK'],
    defaultId: 1,
    message: `Remove endpoint ${endpointService.name}. Are you sure?`,
    cancelId: 0,
  });
  if (result) {
    yield CommandServiceImpl
      .remoteCall(SharedConstants.Commands.Bot.RemoveService, ServiceTypes.Endpoint, endpointService.id);
  }
}

export function* endpointSagas(): IterableIterator<ForkEffect> {
  yield takeLatest(LAUNCH_ENDPOINT_EDITOR, launchEndpointEditor);
  yield takeEvery(OPEN_ENDPOINT_CONTEXT_MENU, openEndpointContextMenu);
  yield takeEvery(OPEN_ENDPOINT_DEEP_LINK, openEndpointDeepLink);
}
