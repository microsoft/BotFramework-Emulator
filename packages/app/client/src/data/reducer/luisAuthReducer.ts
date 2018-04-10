import {
  LUIS_AUTH_STATUS_CHANGED,
  LUIS_AUTHORING_DATA_CHANGED,
  LUIS_LAUNCH_MODELS_VIEWER,
  LuisAuthAction,
  LuisAuthData,
  LuisAuthWorkflowStatus
} from '../action/luisAuthActions';

export interface ILuisAuthState {
  /**
   * The current status of the luis auth frame
   */
  luisAuthWorkflowStatus: 'notStarted' | 'inProgress' | 'ended' | 'canceled';
  /**
   * The luis authoring key for
   * communicating with the LUIS api
   */
  luisAuthData: { key: string, BaseUrl: string };
}

const initialState: ILuisAuthState = {
  luisAuthWorkflowStatus: 'notStarted',
  luisAuthData: null
};

export default function luisAuth(state: ILuisAuthState = initialState, action: LuisAuthAction<LuisAuthData> | LuisAuthAction<LuisAuthWorkflowStatus>): ILuisAuthState {
  const { payload = {}, type } = action;
  const { luisAuthData: luisAuthoringKey } = payload as LuisAuthData;
  const { luisAuthWorkflowStatus } = payload as LuisAuthWorkflowStatus;

  switch (type) {
    case LUIS_LAUNCH_MODELS_VIEWER:
      return { ...state, luisAuthWorkflowStatus: 'notStarted' };

    case LUIS_AUTH_STATUS_CHANGED:
      return { ...state, luisAuthWorkflowStatus };

    case LUIS_AUTHORING_DATA_CHANGED:
      return { ...state, luisAuthData: luisAuthoringKey };

    default:
      return state;
  }
}
