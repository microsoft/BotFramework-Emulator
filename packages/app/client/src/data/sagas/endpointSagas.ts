import { IBotConfig, IEndpointService, ServiceType } from '@bfemulator/sdk-shared';
import { ComponentClass } from 'react';
import { call, ForkEffect, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import { CommandService } from '../../platform/commands/commandService';
import { DialogService } from '../../ui/dialogs/service';
import { EndpointEditor } from '../../ui/shell/explorer/endpointExplorer/endpointEditor/endpointEditor';
import { setDirtyFlag } from '../action/editorActions';
import { LAUNCH_ENDPOINT_EDITOR, OPEN_ENDPOINT_CONTEXT_MENU, OPEN_ENDPOINT_DEEP_LINK, EndpointEditorPayload, EndpointServiceAction, EndpointServicePayload } from '../action/endpointServiceActions';
import { IRootState } from '../store';

const getActiveBot = (state: IRootState) => state.bot.activeBot;
const getCurrentDocumentId = (state: IRootState) => {
  const key = state.editor.activeEditor;
  return state.editor.editors[key].activeDocumentId;
};

function* launchEndpointEditor(action: EndpointServiceAction<EndpointEditorPayload>): IterableIterator<any> {
  const { endpointEditorComponent, endpointService = {} } = action.payload;
  const result = yield DialogService.showDialog<ComponentClass<EndpointEditor>>(endpointEditorComponent, { endpointService });
  // TODO - write this to the bot file
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
  // TODO Open emulator on link
  
  // const { kbid } = action.payload.endpointService;
  // const link = `https://endpointmaker.ai/Edit/KnowledgeBase?kbid=${kbid}`;
  // yield CommandService.remoteCall('electron:openExternal', link);
}

function* removeEndpointServiceFromActiveBot(endpointService: IEndpointService): IterableIterator<any> {
  const activeBot: IBotConfig = yield select(getActiveBot);
  const activeEditorId = yield select(getCurrentDocumentId);
  const { services } = activeBot;
  // Since we cannot guarantee referential integrity
  // we look for the target service in a loop
  let i = services.length;
  while (i--) {
    const service = services[i];
    if (service.id === endpointService.id && service.type === ServiceType.Endpoint) {
      services.splice(i, 1);
      yield put(setDirtyFlag(activeEditorId, true));
      break;
    }
  }
}

export function* endpointSagas(): IterableIterator<ForkEffect> {
  yield takeLatest(LAUNCH_ENDPOINT_EDITOR, launchEndpointEditor);
  yield takeEvery(OPEN_ENDPOINT_CONTEXT_MENU, openEndpointContextMenu);
  yield takeEvery(OPEN_ENDPOINT_DEEP_LINK, openEndpointDeepLink);
}
