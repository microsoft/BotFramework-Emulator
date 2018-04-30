import { IEndpointService, ServiceType } from 'msbot/bin/schema';
import { ComponentClass } from 'react';
import { call, ForkEffect, takeEvery, takeLatest } from 'redux-saga/effects';
import { CommandService } from '../../platform/commands/commandService';
import { DialogService } from '../../ui/dialogs/service';
import { EndpointEditor } from '../../ui/shell/explorer/endpointExplorer/endpointEditor/endpointEditor';
import { EndpointEditorPayload, EndpointServiceAction, EndpointServicePayload, LAUNCH_ENDPOINT_EDITOR, OPEN_ENDPOINT_CONTEXT_MENU, OPEN_ENDPOINT_DEEP_LINK } from '../action/endpointServiceActions';


function* launchEndpointEditor(action: EndpointServiceAction<EndpointEditorPayload>): IterableIterator<any> {
  const { endpointEditorComponent, endpointService = {} } = action.payload;
  const result = yield DialogService.showDialog<ComponentClass<EndpointEditor>>(endpointEditorComponent, { endpointService });
  if (result) {
    yield CommandService.remoteCall('bot:add-or-update-service', ServiceType.Endpoint, result);
  }
}

function* openEndpointContextMenu(action: EndpointServiceAction<EndpointServicePayload | EndpointEditorPayload>): IterableIterator<any> {
  const menuItems = [
    { label: 'Edit settings', id: 'edit' },
    { label: 'Open in emulator', id: 'open' },
    { label: 'Remove', id: 'forget' }
  ];
  const response = yield call(CommandService.remoteCall.bind(CommandService), 'electron:displayContextMenu', menuItems);
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
  CommandService.call('livechat:new', action.payload.endpointService);
}

function* removeEndpointServiceFromActiveBot(endpointService: IEndpointService): IterableIterator<any> {
  const result = yield CommandService.remoteCall('shell:show-message-box', true, {
    type: 'question',
    buttons: ['Cancel', 'OK'],
    defaultId: 1,
    message: `Remove endpoint ${endpointService.name}. Are you sure?`,
    cancelId: 0,
  });
  if (result) {
    yield CommandService.remoteCall('bot:remove-service', ServiceType.Endpoint, endpointService.id);
  }
}

export function* endpointSagas(): IterableIterator<ForkEffect> {
  yield takeLatest(LAUNCH_ENDPOINT_EDITOR, launchEndpointEditor);
  yield takeEvery(OPEN_ENDPOINT_CONTEXT_MENU, openEndpointContextMenu);
  yield takeEvery(OPEN_ENDPOINT_DEEP_LINK, openEndpointDeepLink);
}
