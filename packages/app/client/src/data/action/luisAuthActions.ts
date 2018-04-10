import { ComponentClass } from 'react';
import { Action } from 'redux';

export const LUIS_LAUNCH_MODELS_VIEWER = 'LUIS_LAUNCH_MODELS_VIEWER';
export const LUIS_AUTHORING_DATA_CHANGED = 'LUIS_AUTHORING_DATA_CHANGED';
export const LUIS_AUTH_STATUS_CHANGED = 'LUIS_AUTH_STATUS_CHANGED';

export interface LuisAuthAction<T> extends Action {
  payload: T
}

export interface LuisAuthData {
  luisAuthData: { key: string, BaseUrl: string },
}

export interface LuisAuthWorkflowStatus {
  luisAuthWorkflowStatus: 'inProgress' | 'ended' | 'notStarted' | 'canceled',
}

export interface LuisModelViewer {
  luisModelViewer: ComponentClass<any>;
}

export function launchLuisModelsViewer(luisModelViewer: ComponentClass<any>): LuisAuthAction<LuisModelViewer> {
  return {
    type: LUIS_LAUNCH_MODELS_VIEWER,
    payload: { luisModelViewer }
  };
}

export function luisAuthoringDataChanged(luisAuthData: { key: string, BaseUrl: string }): LuisAuthAction<LuisAuthData> {
  return {
    type: LUIS_AUTHORING_DATA_CHANGED,
    payload: { luisAuthData }
  };
}

export function luisAuthStatusChanged(luisAuthWorkflowStatus: 'inProgress' | 'ended' | 'notStarted' | 'canceled'): LuisAuthAction<LuisAuthWorkflowStatus> {
  return {
    type: LUIS_AUTH_STATUS_CHANGED,
    payload: { luisAuthWorkflowStatus }
  };
}
