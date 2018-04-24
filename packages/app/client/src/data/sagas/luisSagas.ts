import { ILuisService, ServiceType } from '@bfemulator/sdk-shared';
import { ComponentClass } from 'react';
import { call, ForkEffect, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import { CommandService } from '../../platform/commands/commandService';
import { DialogService } from '../../ui/dialogs/service';
import { LuisEditor } from '../../ui/shell/explorer/luisExplorer/luisEditor/luisEditor';
import { LuisAuthAction, luisAuthoringDataChanged, LuisModelViewer } from '../action/luisAuthActions';
import { LAUNCH_LUIS_EDITOR, LuisEditorPayload, LuisServiceAction, LuisServicePayload, OPEN_LUIS_CONTEXT_MENU, OPEN_LUIS_DEEP_LINK, RETRIEVE_LUIS_MODELS } from '../action/luisServiceActions';
import { LuisApi, LuisModel } from '../http/luisApi';
import { IRootState } from '../store';

const getLuisAuthFromState = (state: IRootState) => state.luisAuth.luisAuthData;
const isModalServiceBusy = (state: IRootState) => state.dialog.showing;

function* launchLuisModelsViewer(action: LuisAuthAction<LuisModelViewer>): IterableIterator<any> {
  let luisAuth = yield select(getLuisAuthFromState);
  if (!luisAuth) {
    luisAuth = yield call(CommandService.remoteCall.bind(CommandService), 'luis:retrieve-authoring-key');
    yield put(luisAuthoringDataChanged(luisAuth));
  }
  const luisModels = yield* retrieveLuisModels();
  yield* beginModelViewLifeCycle(action, luisModels);
}

function* beginModelViewLifeCycle(action: LuisAuthAction<LuisModelViewer>, luisModels: LuisModel[]): IterableIterator<any> {
  const isBusy = yield select(isModalServiceBusy);
  if (isBusy) {
    throw new Error('More than one modal cannot be displayed at the same time.');
  }

  const { luisModelViewer } = action.payload;
  const result = yield DialogService.showDialog<ComponentClass<LuisModelViewer>>(luisModelViewer, { luisModels });
  // TODO - write this to the bot file
}

function* retrieveLuisModels(): IterableIterator<any> {
  const luisAuth = yield select(getLuisAuthFromState);
  if (!luisAuth) {
    throw new Error('Auth credentials do not exist.');
  }
  const luisModels = yield LuisApi.getApplicationsList(luisAuth);
  return yield luisModels;
}

function* openLuisDeepLink(action: LuisServiceAction<LuisServicePayload>): IterableIterator<any> {
  const { appId, version } = action.payload.luisService;
  const link = `https://www.luis.ai/applications/${appId}/versions/${version}/build`;
  yield CommandService.remoteCall('electron:openExternal', link);
}

function* openLuisContextMenu(action: LuisServiceAction<LuisServicePayload>): IterableIterator<any> {
  const menuItems = [
    { label: 'Open in web portal', id: 'open' },
    { label: 'Edit settings', id: 'edit' },
    { label: 'Remove', id: 'forget' }
  ];
  const response = yield call(CommandService.remoteCall.bind(CommandService), 'electron:displayContextMenu', menuItems);
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
  const result = yield CommandService.remoteCall('shell:show-message-box', true, {
    type: 'question',
    buttons: ['Cancel', 'OK'],
    defaultId: 1,
    message: `Remove LUIS service ${luisService.name}. Are you sure?`,
    cancelId: 0,
  });
  if (result) {
    yield CommandService.remoteCall('bot:remove-service', ServiceType.Luis, luisService.id);
  }
}

function* launchLuisEditor(action: LuisServiceAction<LuisEditorPayload>): IterableIterator<any> {
  const { luisEditorComponent, luisService = {} } = action.payload;
  const result = yield DialogService.showDialog<ComponentClass<LuisEditor>>(luisEditorComponent, { luisService });
  if (result) {
    yield CommandService.remoteCall('bot:add-or-update-service', ServiceType.Luis, result);
  }
}

export function* luisSagas(): IterableIterator<ForkEffect> {
  //  yield takeLatest(LUIS_LAUNCH_MODELS_VIEWER, launchLuisModelsViewer);
  yield takeLatest(LAUNCH_LUIS_EDITOR, launchLuisEditor);
  yield takeEvery(RETRIEVE_LUIS_MODELS, retrieveLuisModels);
  yield takeEvery(OPEN_LUIS_DEEP_LINK, openLuisDeepLink);
  yield takeEvery(OPEN_LUIS_CONTEXT_MENU, openLuisContextMenu);
}
