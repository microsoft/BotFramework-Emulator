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
  openServiceDeepLink,
  EndpointEditorPayload,
  EndpointServiceAction,
  EndpointServicePayload,
  SharedConstants,
  LAUNCH_ENDPOINT_EDITOR,
  OPEN_ENDPOINT_CONTEXT_MENU,
  OPEN_ENDPOINT_IN_EMULATOR,
} from '@bfemulator/app-shared';
import { IBotService, IEndpointService, ServiceTypes } from 'botframework-config/lib/schema';
import { ComponentClass } from 'react';
import { call, ForkEffect, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import { CommandServiceImpl, CommandServiceInstance } from '@bfemulator/sdk-shared';

import { DialogService } from '../../ui/dialogs/service';
import { RootState } from '../store';

const getConnectedAbs = (state: RootState, endpointAppId: string) => {
  return (state.bot.activeBot.services || []).find(service => {
    return service.type === ServiceTypes.Bot && (service as IBotService).appId === endpointAppId;
  });
};

export class EndpointSagas {
  @CommandServiceInstance()
  private static commandService: CommandServiceImpl;

  public static *launchEndpointEditor(action: EndpointServiceAction<EndpointEditorPayload>): IterableIterator<any> {
    const { endpointEditorComponent, endpointService = {}, resolver } = action.payload;
    const servicesToUpdate = yield DialogService.showDialog<ComponentClass<any>, IEndpointService[]>(
      endpointEditorComponent,
      { endpointService }
    );

    if (servicesToUpdate) {
      const { AddOrUpdateService, RemoveService } = SharedConstants.Commands.Bot;
      let i = servicesToUpdate.length;
      while (i--) {
        const service = servicesToUpdate[i];
        let shouldBeRemoved = false;
        if (service.type === ServiceTypes.Bot) {
          // Since we could end up with an invalid ABS
          // naively validate and remove it if all fields are missing
          const { serviceName, resourceGroup, subscriptionId, tenantId } = service as IBotService;
          shouldBeRemoved = !serviceName && !resourceGroup && !subscriptionId && !tenantId;
        }
        yield EndpointSagas.commandService.remoteCall(
          shouldBeRemoved ? RemoveService : AddOrUpdateService,
          service.type,
          service
        );
      }
    }
    resolver && resolver();
  }

  public static *openEndpointContextMenu(
    action: EndpointServiceAction<EndpointServicePayload | EndpointEditorPayload>
  ): IterableIterator<any> {
    const connectedAbs = yield select<RootState, string>(getConnectedAbs, action.payload.endpointService.appId);
    const menuItems = [
      { label: 'Open in Emulator', id: 'open' },
      { label: 'Open in portal', id: 'absLink', enabled: !!connectedAbs },
      { label: 'Edit configuration', id: 'edit' },
      { label: 'Remove', id: 'forget' },
    ];
    const { DisplayContextMenu } = SharedConstants.Commands.Electron;
    const response = yield call(
      [EndpointSagas.commandService, EndpointSagas.commandService.remoteCall],
      DisplayContextMenu,
      menuItems
    );
    switch (response.id) {
      case 'edit':
        yield* EndpointSagas.launchEndpointEditor(action);
        break;

      case 'open':
        yield* EndpointSagas.openEndpointInEmulator(action);
        break;

      case 'absLink':
        yield put(openServiceDeepLink(connectedAbs));
        break;

      case 'forget':
        yield* EndpointSagas.removeEndpointServiceFromActiveBot(action.payload.endpointService);
        break;

      default:
        // canceled context menu
        return;
    }
  }

  public static *openEndpointInEmulator(action: EndpointServiceAction<EndpointServicePayload>): IterableIterator<any> {
    const { endpointService } = action.payload;
    yield EndpointSagas.commandService.call(SharedConstants.Commands.Emulator.NewLiveChat, endpointService);
  }

  public static *removeEndpointServiceFromActiveBot(endpointService: IEndpointService): IterableIterator<any> {
    const result = yield EndpointSagas.commandService.remoteCall(
      SharedConstants.Commands.Electron.ShowMessageBox,
      true,
      {
        type: 'question',
        buttons: ['Cancel', 'OK'],
        defaultId: 1,
        message: `Remove endpoint ${endpointService.name}. Are you sure?`,
        cancelId: 0,
      }
    );
    if (result) {
      yield EndpointSagas.commandService.remoteCall(
        SharedConstants.Commands.Bot.RemoveService,
        endpointService.type,
        endpointService.id
      );
    }
  }
}

export function* endpointSagas(): IterableIterator<ForkEffect> {
  yield takeLatest(LAUNCH_ENDPOINT_EDITOR, EndpointSagas.launchEndpointEditor);
  yield takeEvery(OPEN_ENDPOINT_CONTEXT_MENU, EndpointSagas.openEndpointContextMenu);
  yield takeEvery(OPEN_ENDPOINT_IN_EMULATOR, EndpointSagas.openEndpointInEmulator);
}
