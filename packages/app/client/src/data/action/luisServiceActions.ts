import { ILuisService } from 'msbot/bin/schema';
import { ComponentClass } from 'react';
import { Action } from 'redux';
import { LuisEditor } from '../../ui/shell/explorer/luisExplorer/luisEditor/luisEditor';

export const OPEN_LUIS_DEEP_LINK = 'OPEN_LUIS_DEEP_LINK';
export const OPEN_LUIS_CONTEXT_MENU = 'OPEN_LUIS_CONTEXT_MENU';
export const LAUNCH_LUIS_EDITOR = 'LAUNCH_LUIS_EDITOR';
export const RETRIEVE_LUIS_MODELS = 'RETRIEVE_LUIS_MODELS';

export interface LuisServiceAction<T> extends Action {
  payload: T;
}

export interface LuisServicePayload {
  luisService: ILuisService;
}

export interface LuisEditorPayload extends LuisServicePayload {
  luisEditorComponent?: ComponentClass<LuisEditor>,
}

export function launchLuisEditor(luisEditorComponent: ComponentClass<LuisEditor>, luisService?: ILuisService): LuisServiceAction<LuisEditorPayload> {
  return {
    type: LAUNCH_LUIS_EDITOR,
    payload: { luisEditorComponent, luisService }
  };
}

export function openLuisDeepLink(luisService: ILuisService): LuisServiceAction<LuisServicePayload> {
  return {
    type: OPEN_LUIS_DEEP_LINK,
    payload: { luisService }
  };
}

export function openLuisExplorerContextMenu(luisEditorComponent: ComponentClass<LuisEditor>, luisService?: ILuisService): LuisServiceAction<LuisEditorPayload> {
  return {
    type: OPEN_LUIS_CONTEXT_MENU,
    payload: { luisEditorComponent, luisService }
  };
}

export function retrieveLuisModels(): Action {
  return {
    type: RETRIEVE_LUIS_MODELS
  };
}
