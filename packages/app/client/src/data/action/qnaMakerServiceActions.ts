import { IQnAService } from 'msbot/bin/schema';
import { ComponentClass } from 'react';
import { Action } from 'redux';
import { QnaMakerEditor } from '../../ui/shell/explorer/qnaMakerExplorer/qnaMakerEditor/qnaMakerEditor';

export const OPEN_QNA_MAKER_DEEP_LINK = 'OPEN_QNA_MAKER_DEEP_LINK';
export const OPEN_QNA_MAKER_CONTEXT_MENU = 'OPEN_QNA_MAKER_CONTEXT_MENU';
export const LAUNCH_QNA_MAKER_EDITOR = 'LAUNCH_QNA_MAKER_EDITOR';

export interface QnaMakerServiceAction<T> extends Action {
  payload: T;
}

export interface QnaMakerServicePayload {
  qnaMakerService: IQnAService;
}

export interface QnaMakerEditorPayload extends QnaMakerServicePayload {
  qnaMakerEditorComponent?: ComponentClass<QnaMakerEditor>,
}

export function launchQnaMakerEditor(qnaMakerEditorComponent: ComponentClass<QnaMakerEditor>, qnaMakerService?: IQnAService): QnaMakerServiceAction<QnaMakerEditorPayload> {
  return {
    type: LAUNCH_QNA_MAKER_EDITOR,
    payload: { qnaMakerEditorComponent, qnaMakerService }
  };
}

export function openQnAMakerDeepLink(qnaMakerService: IQnAService): QnaMakerServiceAction<QnaMakerServicePayload> {
  return {
    type: OPEN_QNA_MAKER_DEEP_LINK,
    payload: { qnaMakerService }
  };
}

export function openQnaMakerExplorerContextMenu(qnaMakerEditorComponent: ComponentClass<QnaMakerEditor>, qnaMakerService?: IQnAService): QnaMakerServiceAction<QnaMakerEditorPayload> {
  return {
    type: OPEN_QNA_MAKER_CONTEXT_MENU,
    payload: { qnaMakerEditorComponent, qnaMakerService }
  };
}
