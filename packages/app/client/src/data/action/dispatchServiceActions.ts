import { IDispatchService } from '@bfemulator/sdk-shared';
import { ComponentClass } from 'react';
import { Action } from 'redux';
import { DispatchEditor } from '../../ui/shell/explorer/dispatchExplorer/dispatchEditor/dispatchEditor';

export const OPEN_DISPATCH_DEEP_LINK = 'OPEN_DISPATCH_DEEP_LINK';
export const OPEN_DISPATCH_CONTEXT_MENU = 'OPEN_DISPATCH_CONTEXT_MENU';
export const LAUNCH_DISPATCH_EDITOR = 'LAUNCH_DISPATCH_EDITOR';
export const RETRIEVE_DISPATCH_MODELS = 'RETRIEVE_DISPATCH_MODELS';

export interface DispatchServiceAction<T> extends Action {
  payload: T;
}

export interface DispatchServicePayload {
  dispatchService: IDispatchService;
}

export interface DispatchEditorPayload extends DispatchServicePayload {
  dispatchEditorComponent?: ComponentClass<DispatchEditor>,
}

export function launchDispatchEditor(dispatchEditorComponent: ComponentClass<DispatchEditor>, dispatchService?: IDispatchService): DispatchServiceAction<DispatchEditorPayload> {
  return {
    type: LAUNCH_DISPATCH_EDITOR,
    payload: { dispatchEditorComponent, dispatchService }
  };
}

export function openDispatchDeepLink(dispatchService: IDispatchService): DispatchServiceAction<DispatchServicePayload> {
  return {
    type: OPEN_DISPATCH_DEEP_LINK,
    payload: { dispatchService }
  };
}

export function openDispatchExplorerContextMenu(dispatchEditorComponent: ComponentClass<DispatchEditor>, dispatchService?: IDispatchService): DispatchServiceAction<DispatchEditorPayload> {
  return {
    type: OPEN_DISPATCH_CONTEXT_MENU,
    payload: { dispatchEditorComponent, dispatchService }
  };
}

export function retrieveDispatchModels(): Action {
  return {
    type: RETRIEVE_DISPATCH_MODELS
  };
}
