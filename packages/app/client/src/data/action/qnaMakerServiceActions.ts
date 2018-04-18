import { Action } from 'redux';
import { IQnAService } from '@bfemulator/sdk-shared';

export const OPEN_QNA_MAKER_DEEP_LINK = 'OPEN_QNA_MAKER_DEEP_LINK';
export const OPEN_QNA_MAKER_CONTEXT_MENU = 'OPEN_QNA_MAKER_CONTEXT_MENU';

export interface QnaMakerServiceAction<T> extends Action {
  payload: T;
}

export interface QnaMakerServicePayload {
  qnaService?: IQnAService;
}

export function openQnAMakerDeepLink(qnaService: IQnAService): QnaMakerServiceAction<QnaMakerServicePayload> {
  return {
    type: OPEN_QNA_MAKER_DEEP_LINK,
    payload: { qnaService }
  };
}

export function openQnaMakerExplorerContextMenu(qnaService: IQnAService): QnaMakerServiceAction<QnaMakerServicePayload> {
  return {
    type: OPEN_QNA_MAKER_CONTEXT_MENU,
    payload: { qnaService }
  };
}
