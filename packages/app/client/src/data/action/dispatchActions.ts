import { IDispatchService } from '@bfemulator/sdk-shared';
import { Action } from 'redux';

export const OPEN_DISPATCH_DEEP_LINK = 'OPEN_DISPATCH_DEEP_LINK';
export const OPEN_DISPATCH_EXPLORER_CONTEXT_MENU = 'OPEN_DISPATCH_EXPLORER_CONTEXT_MENU';

export interface DispatchServiceAction<T> extends Action {
  payload: T;
}

export interface DispatchServicePayload {
  dispatchService?: IDispatchService;
}

export function openDispatchDeepLink(dispatchService: IDispatchService): DispatchServiceAction<DispatchServicePayload> {
  return {
    type: OPEN_DISPATCH_DEEP_LINK,
    payload: { dispatchService }
};
}

export function openDispatchExplorerContextMenu(dispatchService: IDispatchService): DispatchServiceAction<DispatchServicePayload> {
  return {
    type: OPEN_DISPATCH_EXPLORER_CONTEXT_MENU,
    payload: { dispatchService }
  };
}
