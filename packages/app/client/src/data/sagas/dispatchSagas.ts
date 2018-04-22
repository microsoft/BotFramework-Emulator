import { IBotConfig, IDispatchService, ServiceType } from '@bfemulator/sdk-shared';
import { ComponentClass } from 'react';
import { call, ForkEffect, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import { DispatchEditor } from '../../ui/shell/explorer/dispatchExplorer/dispatchEditor/dispatchEditor';
import { CommandService } from '../../platform/commands/commandService';
import { DialogService } from '../../ui/dialogs/service';
import { setDirtyFlag } from '../action/editorActions';
import {
  DispatchServicePayload,
  DispatchServiceAction,
  DispatchEditorPayload, 
  LAUNCH_DISPATCH_EDITOR,
  OPEN_DISPATCH_CONTEXT_MENU,
  OPEN_DISPATCH_DEEP_LINK,
  RETRIEVE_DISPATCH_MODELS
} from '../action/dispatchServiceActions';
import { IRootState } from '../store';

const getActiveBot = (state: IRootState) => state.bot.activeBot;
const getCurrentDocumentId = (state: IRootState) => {
  const key = state.editor.activeEditor;
  return state.editor.editors[key].activeDocumentId;
};

function* openDispatchDeepLink(action: DispatchServiceAction<DispatchServicePayload>): IterableIterator<any> {
  const { appId, version } = action.payload.dispatchService;
  const link = `https://www.dispatch.ai/applications/${appId}/versions/${version}/build`;
  yield CommandService.remoteCall('electron:openExternal', link);
}

function* openDispatchContextMenu(action: DispatchServiceAction<DispatchServicePayload>): IterableIterator<any> {
  const menuItems = [
    { label: 'Open in web portal', id: 'open' },
    { label: 'Edit settings', id: 'edit' },
    { label: 'Remove', id: 'forget' }
  ];
  const response = yield call(CommandService.remoteCall.bind(CommandService), 'electron:displayContextMenu', menuItems);
  switch (response.id) {
    case 'open':
      yield* openDispatchDeepLink(action);
      break;

    case 'edit':
      yield* launchDispatchEditor(action);
      break;

    case 'forget':
      yield* removeDispatchServiceFromActiveBot(action.payload.dispatchService);
      break;

    default: // canceled context menu
      return;
  }
}

function* removeDispatchServiceFromActiveBot(dispatchService: IDispatchService): IterableIterator<any> {
  const activeBot: IBotConfig = yield select(getActiveBot);
  const activeEditorId = yield select(getCurrentDocumentId);
  const { services } = activeBot;
  // Since we cannot guarantee referential integrity
  // we look for the target dispatchService in a loop
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

function* launchDispatchEditor(action: DispatchServiceAction<DispatchEditorPayload>): IterableIterator<any> {
  const { dispatchEditorComponent, dispatchService = {} } = action.payload;
  const result = yield DialogService.showDialog<ComponentClass<DispatchEditor>>(dispatchEditorComponent, { dispatchService });
  // TODO - write this to the bot file
}

export function* dispatchSagas(): IterableIterator<ForkEffect> {
  yield takeLatest(LAUNCH_DISPATCH_EDITOR, launchDispatchEditor);
  yield takeEvery(OPEN_DISPATCH_DEEP_LINK, openDispatchDeepLink);
  yield takeEvery(OPEN_DISPATCH_CONTEXT_MENU, openDispatchContextMenu);
  
}
