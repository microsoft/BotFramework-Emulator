import { IQnAService, ServiceType } from 'msbot/bin/schema';
import { ComponentClass } from 'react';
import { call, ForkEffect, takeEvery, takeLatest } from 'redux-saga/effects';
import { CommandService } from '../../platform/commands/commandService';
import { DialogService } from '../../ui/dialogs/service';
import { QnaMakerEditor } from '../../ui/shell/explorer/qnaMakerExplorer/qnaMakerEditor/qnaMakerEditor';
import { LAUNCH_QNA_MAKER_EDITOR, OPEN_QNA_MAKER_CONTEXT_MENU, OPEN_QNA_MAKER_DEEP_LINK, QnaMakerEditorPayload, QnaMakerServiceAction, QnaMakerServicePayload } from '../action/qnaMakerServiceActions';

function* launchQnaMakerEditor(action: QnaMakerServiceAction<QnaMakerEditorPayload>): IterableIterator<any> {
  const { qnaMakerEditorComponent, qnaMakerService = {} } = action.payload;
  const result = yield DialogService.showDialog<ComponentClass<QnaMakerEditor>>(qnaMakerEditorComponent, { qnaMakerService });
  if (result) {
    yield CommandService.remoteCall('bot:add-or-update-service', ServiceType.QnA, result);
  }
}

function* openQnaMakerContextMenu(action: QnaMakerServiceAction<QnaMakerServicePayload | QnaMakerEditorPayload>): IterableIterator<any> {
  const menuItems = [
    { label: 'Edit settings', id: 'edit' },
    { label: 'Open in web portal', id: 'open' },
    { label: 'Remove', id: 'forget' }
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
  const { kbId } = action.payload.qnaMakerService;
  const link = `https://qnamaker.ai/Edit/KnowledgeBase?kbid=${kbId}`;
  yield CommandService.remoteCall('electron:openExternal', link);
}

function* removeQnaMakerServiceFromActiveBot(qnaService: IQnAService): IterableIterator<any> {
  const result = yield CommandService.remoteCall('shell:show-message-box', true, {
    type: 'question',
    buttons: ['Cancel', 'OK'],
    defaultId: 1,
    message: `Remove QnA service ${qnaService.name}. Are you sure?`,
    cancelId: 0,
  });
  if (result) {
    yield CommandService.remoteCall('bot:remove-service', ServiceType.QnA, qnaService.id);
  }
}

export function* qnaMakerSagas(): IterableIterator<ForkEffect> {
  yield takeLatest(LAUNCH_QNA_MAKER_EDITOR, launchQnaMakerEditor);
  yield takeEvery(OPEN_QNA_MAKER_CONTEXT_MENU, openQnaMakerContextMenu);
  yield takeEvery(OPEN_QNA_MAKER_DEEP_LINK, openQnaMakerDeepLink);
}
