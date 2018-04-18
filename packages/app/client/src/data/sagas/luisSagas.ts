import { IBotConfig, ILuisService, ServiceType } from '@bfemulator/sdk-shared';
import { ComponentClass } from 'react';
import { call, ForkEffect, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import { CommandService } from '../../platform/commands/commandService';
import { DialogService } from '../../ui/dialogs/service';
import { setDirtyFlag } from '../action/editorActions';
import {
  LUIS_LAUNCH_MODELS_VIEWER,
  LuisAuthAction,
  luisAuthoringDataChanged,
  LuisModelViewer
} from '../action/luisAuthActions';
import {
  LuisServicePayload,
  LuisServicesActions,
  OPEN_LUIS_SERVICE_CONTEXT_MENU,
  OPEN_LUIS_SERVICE_DEEP_LINK,
  RETRIEVE_LUIS_MODELS
} from '../action/luisServicesActions';
import { LuisApi, LuisModel } from '../http/luisApi';
import { IRootState } from '../store';

const getLuisAuthFromState = (state: IRootState) => state.luisAuth.luisAuthData;
const isModalServiceBusy = (state: IRootState) => state.dialog.showing;
const getActiveBot = (state: IRootState) => state.bot.activeBot;
const getCurrentDocumentId = (state: IRootState) => {
  const key = state.editor.activeEditor;
  return state.editor.editors[key].activeDocumentId;
};

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
  // TODO - write this to the botfile
}

function* retrieveLuisModels(): IterableIterator<any> {
  const luisAuth = yield select(getLuisAuthFromState);
  if (!luisAuth) {
    throw new Error('Auth credentials do not exist.');
  }
  const luisModels = yield LuisApi.getApplicationsList(luisAuth);
  return yield luisModels;
}

function* openLuisDeepLink(action: LuisServicesActions<LuisServicePayload>): IterableIterator<any> {
  const { appId, version } = action.payload.luisService;
  const link = `https://www.luis.ai/applications/${appId}/versions/${version}/build`;
  yield CommandService.remoteCall('electron:openExternal', link);
}

function* openLuisContextMenu(action: LuisServicesActions<LuisServicePayload>): IterableIterator<any> {
  const menuItems = [
    { label: 'Open in web portal', id: 'open' },
    { label: 'Forget this app', id: 'forget' }
  ];
  const response = yield call(CommandService.remoteCall.bind(CommandService), 'electron:displayContextMenu', menuItems);
  switch (response.id) {
    case 'open':
      yield* openLuisDeepLink(action);
      break;

    case 'forget':
      yield* removeLuisServiceFromActiveBot(action.payload.luisService);
      break;

    default: // canceled context menu
      return;
  }
}

function* removeLuisServiceFromActiveBot(luisService: ILuisService): IterableIterator<any> {
  const activeBot: IBotConfig = yield select(getActiveBot);
  const activeEditorId = yield select(getCurrentDocumentId);
  const { services } = activeBot;
  // Since we cannot guarantee referential integrity
  // we look for the target luisService in a loop
  let i = services.length;
  while (i--) {
    const service = services[i];
    if (service.id === luisService.id && service.type === ServiceType.Luis) {
      services.splice(i, 1);
      yield put(setDirtyFlag(activeEditorId, true));
      break;
    }
  }
}

export function* luisSagas(): IterableIterator<ForkEffect> {
  yield takeLatest(LUIS_LAUNCH_MODELS_VIEWER, launchLuisModelsViewer);
  yield takeEvery(RETRIEVE_LUIS_MODELS, retrieveLuisModels);
  yield takeEvery(OPEN_LUIS_SERVICE_DEEP_LINK, openLuisDeepLink);
  yield takeEvery(OPEN_LUIS_SERVICE_CONTEXT_MENU, openLuisContextMenu);
}
