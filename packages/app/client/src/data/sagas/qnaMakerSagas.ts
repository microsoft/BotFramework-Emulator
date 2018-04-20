import { IBotConfig, IQnAService, ServiceType } from '@bfemulator/sdk-shared';
import { ComponentClass } from 'react';
import { call, ForkEffect, put, select, takeEvery, takeLatest } from 'redux-saga/effects';
import { CommandService } from '../../platform/commands/commandService';
import { DialogService } from '../../ui/dialogs/service';
import { QnaMakerEditor } from '../../ui/shell/explorer/qnaMakerExplorer/qnaMakerEditor/qnaMakerEditor';
import { setDirtyFlag } from '../action/editorActions';
import { LAUNCH_QNA_MAKER_EDITOR, OPEN_QNA_MAKER_CONTEXT_MENU, OPEN_QNA_MAKER_DEEP_LINK, QnaMakerEditorPayload, QnaMakerServiceAction, QnaMakerServicePayload } from '../action/qnaMakerServiceActions';
import { IRootState } from '../store';

const getActiveBot = (state: IRootState) => state.bot.activeBot;
const getCurrentDocumentId = (state: IRootState) => {
  const key = state.editor.activeEditor;
  return state.editor.editors[key].activeDocumentId;
};

function* launchQnaMakerEditor(action: QnaMakerServiceAction<QnaMakerEditorPayload>): IterableIterator<any> {
  const { qnaMakerEditorComponent, qnaMakerService = {} } = action.payload;
  const result = yield DialogService.showDialog<ComponentClass<QnaMakerEditor>>(qnaMakerEditorComponent, { qnaMakerService });
  // TODO - write this to the bot file
}

function* openQnaMakerContextMenu(action: QnaMakerServiceAction<QnaMakerServicePayload | QnaMakerEditorPayload>): IterableIterator<any> {
  const menuItems = [
    { label: 'Edit', id: 'edit' },
    { label: 'Open in web portal', id: 'open' },
    { label: 'Forget this app', id: 'forget' }
  ];
  const response = yield call(CommandService.remoteCall.bind(CommandService), 'electron:displayContextMenu', menuItems);
  switch (response.id) {
    case 'edit':
      yield* launchQnaMakerEditor(action);
      break;

    case 'open':
      yield* openQnaMakerDeepLink(action);
      break;

    case 'forget':
      yield* removeQnaMakerServiceFromActiveBot(action.payload.qnaMakerService);
      break;

    default: // canceled context menu
      return;
  }
}

function* openQnaMakerDeepLink(action: QnaMakerServiceAction<QnaMakerServicePayload>): IterableIterator<any> {
  const { kbid } = action.payload.qnaMakerService;
  const link = `https://qnamaker.ai/Edit/KnowledgeBase?kbid=${kbid}`;
  yield CommandService.remoteCall('electron:openExternal', link);
}

function* removeQnaMakerServiceFromActiveBot(qnaService: IQnAService): IterableIterator<any> {
  const activeBot: IBotConfig = yield select(getActiveBot);
  const activeEditorId = yield select(getCurrentDocumentId);
  const { services } = activeBot;
  // Since we cannot guarantee referential integrity
  // we look for the target service in a loop
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
  yield takeLatest(LAUNCH_QNA_MAKER_EDITOR, launchQnaMakerEditor);
  yield takeEvery(OPEN_QNA_MAKER_CONTEXT_MENU, openQnaMakerContextMenu);
  yield takeEvery(OPEN_QNA_MAKER_DEEP_LINK, openQnaMakerDeepLink);
}
