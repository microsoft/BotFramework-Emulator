import { Action } from 'redux';
import { ILuisService } from '@bfemulator/sdk-shared';

export const RETRIEVE_LUIS_MODELS = 'RETRIEVE_LUIS_MODELS';
export const OPEN_LUIS_SERVICE_DEEP_LINK = 'OPEN_LUIS_SERVICE_DEEP_LINK';
export const OPEN_LUIS_EXPLORER_CONTEXT_MENU = 'OPEN_LUIS_EXPLORER_CONTEXT_MENU';

export interface LuisServicesActions<T> extends Action {
  payload: T
}

export interface LuisServicePayload {
  luisService?: ILuisService;
}

export function openLuisDeepLink(luisService: ILuisService): LuisServicesActions<LuisServicePayload> {
  return {
    type: OPEN_LUIS_SERVICE_DEEP_LINK,
    payload: { luisService },
  };
}

export function openLuisExplorerContextMenu(luisService:ILuisService): LuisServicesActions<LuisServicePayload> {
  return {
    type: OPEN_LUIS_EXPLORER_CONTEXT_MENU,
    payload: { luisService },
  };
}

export function retrieveLuisModels(): Action {
  return {
    type: RETRIEVE_LUIS_MODELS
  };
}
