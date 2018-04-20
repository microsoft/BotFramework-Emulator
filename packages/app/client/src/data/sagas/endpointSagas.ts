import { IBotConfig, IEndpointService, ServiceType } from '@bfemulator/sdk-shared';
import { call, ForkEffect, put, select, takeEvery } from 'redux-saga/effects';
import { CommandService } from '../../platform/commands/commandService';
import { setDirtyFlag } from '../action/editorActions';
import {
  EndpointServicePayload, EndpointServiceAction,
  OPEN_ENDPOINT_EXPLORER_CONTEXT_MENU
} from '../action/endpointActions';
import { IRootState } from '../store';

const getActiveBot = (state: IRootState) => state.bot.activeBot;
const getCurrentDocumentId = (state: IRootState) => {
  const key = state.editor.activeEditor;
  return state.editor.editors[key].activeDocumentId;
};

function* openEndpointContextMenu(action: EndpointServiceAction<EndpointServicePayload>): IterableIterator<any> {
  const menuItems = [
    { label: 'Forget this endpoint', id: 'forget' }
  ];
  const response = yield call(CommandService.remoteCall.bind(CommandService), 'electron:displayContextMenu', menuItems);
  switch (response.id) {

    case 'forget':
      yield* removeEndpointServiceFromActiveBot(action.payload.endpointService);
      break;

    default: // canceled context menu
      return;
  }
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
  yield takeEvery(OPEN_ENDPOINT_EXPLORER_CONTEXT_MENU, openEndpointContextMenu);
}
