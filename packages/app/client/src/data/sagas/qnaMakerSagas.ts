import { IBotConfig, IQnAService, ServiceType } from '@bfemulator/sdk-shared';
import { call, ForkEffect, put, select, takeEvery } from 'redux-saga/effects';
import { CommandService } from '../../platform/commands/commandService';
import { setDirtyFlag } from '../action/editorActions';
import {
  OPEN_QNA_MAKER_CONTEXT_MENU,
  OPEN_QNA_MAKER_DEEP_LINK,
  QnaMakerServiceAction,
  QnaMakerServicePayload
} from '../action/qnaMakerServiceActions';
import { IRootState } from '../store';

const getActiveBot = (state: IRootState) => state.bot.activeBot;
const getCurrentDocumentId = (state: IRootState) => {
  const key = state.editor.activeEditor;
  return state.editor.editors[key].activeDocumentId;
};

function* openQnaMakerContextMenu(action: QnaMakerServiceAction<QnaMakerServicePayload>): IterableIterator<any> {
  const menuItems = [
    { label: 'Open in web portal', id: 'open' },
    { label: 'Forget this app', id: 'forget' }
  ];
  const response = yield call(CommandService.remoteCall.bind(CommandService), 'electron:displayContextMenu', menuItems);
  switch (response.id) {
    case 'open':
      yield* openQnaMakerDeepLink(action);
      break;

    case 'forget':
      yield* removeQnaMakerServiceFromActiveBot(action.payload.qnaService);
      break;

    default: // canceled context menu
      return;
  }
}

function* openQnaMakerDeepLink(action: QnaMakerServiceAction<QnaMakerServicePayload>): IterableIterator<any> {
  const { kbid } = action.payload.qnaService;
  const link = `https://qnamaker.ai/Edit/KnowledgeBase?kbid=${kbid}`;
  yield CommandService.remoteCall('electron:openExternal', link);
}

function* removeQnaMakerServiceFromActiveBot(qnaService: IQnAService): IterableIterator<any> {
  const activeBot: IBotConfig = yield select(getActiveBot);
  const activeEditorId = yield select(getCurrentDocumentId);
  const { services } = activeBot;
  // Since we cannot guarantee referential integrity
  // we look for the target luisService in a loop
  let i = services.length;
  while (i--) {
    const service = services[i];
    if (service.id === qnaService.id && service.type === ServiceType.QnA) {
      services.splice(i, 1);
      yield put(setDirtyFlag(activeEditorId, true));
      break;
    }
  }
}

export function* qnaMakerSagas(): IterableIterator<ForkEffect> {
  yield takeEvery(OPEN_QNA_MAKER_CONTEXT_MENU, openQnaMakerContextMenu);
  yield takeEvery(OPEN_QNA_MAKER_DEEP_LINK, openQnaMakerDeepLink);
}
