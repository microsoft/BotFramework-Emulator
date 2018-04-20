import { IBotConfig, IDispatchService, ServiceType } from '@bfemulator/sdk-shared';
import { call, ForkEffect, put, select, takeEvery } from 'redux-saga/effects';
import { CommandService } from '../../platform/commands/commandService';
import { setDirtyFlag } from '../action/editorActions';
import {
  OPEN_DISPATCH_EXPLORER_CONTEXT_MENU,
  OPEN_DISPATCH_DEEP_LINK,
  DispatchServiceAction,
  DispatchServicePayload
} from '../action/dispatchActions';
import { IRootState } from '../store';

const getActiveBot = (state: IRootState) => state.bot.activeBot;
const getCurrentDocumentId = (state: IRootState) => {
  const key = state.editor.activeEditor;
  return state.editor.editors[key].activeDocumentId;
};

function* openDispatchContextMenu(action: DispatchServiceAction<DispatchServicePayload>): IterableIterator<any> {
  const menuItems = [
    { label: 'Open in web portal', id: 'open' },
    { label: 'Forget this app', id: 'forget' }
  ];
  const response = yield call(CommandService.remoteCall.bind(CommandService), 'electron:displayContextMenu', menuItems);
  switch (response.id) {
    case 'open':
      yield* openDispatchDeepLink(action);
      break;

    case 'forget':
      yield* removeDispatchServiceFromActiveBot(action.payload.dispatchService);
      break;

    default: // canceled context menu
      return;
  }
}

function* openDispatchDeepLink(action: DispatchServiceAction<DispatchServicePayload>): IterableIterator<any> {
  const { appId, version } = action.payload.dispatchService;
  const link = `https://www.luis.ai/applications/${appId}/versions/${version}/build`;
  yield CommandService.remoteCall('electron:openExternal', link);
}

function* removeDispatchServiceFromActiveBot(dispatchService: IDispatchService): IterableIterator<any> {
  const activeBot: IBotConfig = yield select(getActiveBot);
  const activeEditorId = yield select(getCurrentDocumentId);
  const { services } = activeBot;
  // Since we cannot guarantee referential integrity
  // we look for the target service in a loop
  let i = services.length;
  while (i--) {
    const service = services[i];
    if (service.id === dispatchService.id && service.type === ServiceType.Dispatch) {
      services.splice(i, 1);
      yield put(setDirtyFlag(activeEditorId, true));
      break;
    }
  }
}

export function* dispatchSagas(): IterableIterator<ForkEffect> {
  yield takeEvery(OPEN_DISPATCH_EXPLORER_CONTEXT_MENU, openDispatchContextMenu);
  yield takeEvery(OPEN_DISPATCH_DEEP_LINK, openDispatchDeepLink);
}
