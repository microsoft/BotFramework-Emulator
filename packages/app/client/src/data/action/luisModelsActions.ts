import { Action } from 'redux';
import { LuisModel } from '../http/luisApi';

export const ADDED_LUIS_MODELS_UPDATED = 'ADDED_LUIS_MODELS_UPDATED';
export const AVAILABLE_LUIS_MODELS_UPDATED = 'AVAILABLE_LUIS_MODELS_UPDATED';
export const RETRIEVE_LUIS_MODELS = 'RETRIEVE_LUIS_MODELS';

export interface LuisModelsActions<T> extends Action {
  payload: T
}

export interface AddedLuisModels {
  addedLuisModels: LuisModel[];
}

export interface AvailableLuisModels {
  availableLuisModels: LuisModel[];
}

export function addedLuisModelsUpdated(addedLuisModels: LuisModel[]): LuisModelsActions<AddedLuisModels> {
  return {
    type: ADDED_LUIS_MODELS_UPDATED,
    payload: { addedLuisModels }
  };
}

export function availableLuisModelsUpdated(availableLuisModels: LuisModel[]): LuisModelsActions<AvailableLuisModels> {
  return {
    type: AVAILABLE_LUIS_MODELS_UPDATED,
    payload: { availableLuisModels }
  };
}

export function retrieveLuisModels(): Action {
  return {
    type: RETRIEVE_LUIS_MODELS
  };
}
