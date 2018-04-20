import { IBotConfig, IAzureBotService, ServiceType } from '@bfemulator/sdk-shared';
import { call, ForkEffect, put, select, takeEvery } from 'redux-saga/effects';
import { CommandService } from '../../platform/commands/commandService';
import { setDirtyFlag } from '../action/editorActions';
import {
  AzureBotServiceActions, AzureBotServicePayload,
  OPEN_ABS_EXPLORER_CONTEXT_MENU
} from '../action/azureBotServiceActions';
import { IRootState } from '../store';

const getActiveBot = (state: IRootState) => state.bot.activeBot;
const getCurrentDocumentId = (state: IRootState) => {
  const key = state.editor.activeEditor;
  return state.editor.editors[key].activeDocumentId;
};

function* openAzureBotServiceContextMenu(action: AzureBotServiceActions<AzureBotServicePayload>): IterableIterator<any> {
  const menuItems = [
    { label: 'Forget this endpoint', id: 'forget' }
  ];
  const response = yield call(CommandService.remoteCall.bind(CommandService), 'electron:displayContextMenu', menuItems);
  switch (response.id) {

    case 'forget':
      yield* removeAzureBotServiceFromActiveBot(action.payload.azureBotService);
      break;

    default: // canceled context menu
      return;
  }
}

function* removeAzureBotServiceFromActiveBot(azureBotService: IAzureBotService): IterableIterator<any> {
  const activeBot: IBotConfig = yield select(getActiveBot);
  const activeEditorId = yield select(getCurrentDocumentId);
  const { services } = activeBot;
  // Since we cannot guarantee referential integrity
  // we look for the target service in a loop
  let i = services.length;
  while (i--) {
    const service = services[i];
    if (service.id === azureBotService.id && service.type === ServiceType.AzureBotService) {
      services.splice(i, 1);
      yield put(setDirtyFlag(activeEditorId, true));
      break;
    }
  }
}

export function* azureBotServiceSagas(): IterableIterator<ForkEffect> {
  yield takeEvery(OPEN_ABS_EXPLORER_CONTEXT_MENU, openAzureBotServiceContextMenu);
}
