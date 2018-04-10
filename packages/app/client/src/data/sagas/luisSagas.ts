import { call, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import { CommandService } from '../../platform/commands/commandService';
import { DialogService } from '../../ui/dialogs/service';
import {
  LUIS_LAUNCH_MODELS_VIEWER,
  LuisAuthAction,
  luisAuthoringDataChanged,
  LuisModelViewer
} from '../action/luisAuthActions';
import { availableLuisModelsUpdated, RETRIEVE_LUIS_MODELS } from '../action/luisModelsActions';
import { LuisApi } from '../http/luisApi';
import { IRootState } from '../store';

const getLuisAuthFromState = state => <IRootState>state.luisAuth.luisAuthData;
const isModalServiceBusy = state => <IRootState>state.dialog.showing;

function* launchLuisModelsViewer(action: LuisAuthAction<LuisModelViewer>): IterableIterator<any> {
  let luisAuth = yield select(getLuisAuthFromState);
  // Auth needed first
  if (!luisAuth) {
    luisAuth = yield call(CommandService.remoteCall.bind(CommandService), 'luis:retrieve-authoring-key');
    yield put(luisAuthoringDataChanged(luisAuth));
  }
  yield* retrieveLuisModels();
  yield* beginModelViewLifeCycle(action);
}

function* beginModelViewLifeCycle(action: LuisAuthAction<LuisModelViewer>): IterableIterator<any> {
  const isBusy = yield select(isModalServiceBusy);
  if (isBusy) {
    throw new Error('More than one modal cannot be displayed at the same time.');
  }

  const { luisModelViewer } = action.payload;
  return DialogService.showDialog(luisModelViewer); // release control to the component
}

function* retrieveLuisModels(): IterableIterator<any> {
  const luisAuth = yield select(getLuisAuthFromState);
  if (!luisAuth) {
    throw new Error('Auth credentials do not exist.');
  }
  const luisModels = yield LuisApi.getApplicationsList(luisAuth);
  yield put(availableLuisModelsUpdated(luisModels));
}

export function* luisSagas() {
  yield takeLatest(LUIS_LAUNCH_MODELS_VIEWER, launchLuisModelsViewer);
  yield takeEvery(RETRIEVE_LUIS_MODELS, retrieveLuisModels);
}
