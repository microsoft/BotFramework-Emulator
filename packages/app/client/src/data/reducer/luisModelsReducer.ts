import {
  ADDED_LUIS_MODELS_UPDATED,
  AddedLuisModels,
  AVAILABLE_LUIS_MODELS_UPDATED,
  AvailableLuisModels,
  LuisModelsActions
} from '../action/luisModelsActions';
import { LuisModel } from '../http/luisApi';

export interface ILuisModelsState {
  addedLuisModels?: LuisModel[];
  availableLuisModels?: LuisModel[];
}

const initialState: ILuisModelsState = {
  addedLuisModels: [],
  availableLuisModels: []
};

export default function luisModel(state: ILuisModelsState = initialState, action: LuisModelsActions<AddedLuisModels | AvailableLuisModels>): ILuisModelsState {
  const { payload = {} } = action;

  switch (action.type) {
    case ADDED_LUIS_MODELS_UPDATED:
      const { addedLuisModels } = payload as AddedLuisModels;
      return { ...state, addedLuisModels };

    case AVAILABLE_LUIS_MODELS_UPDATED:
      const { availableLuisModels } = payload as AvailableLuisModels;
      return { ...state, availableLuisModels };

    default:
      return state;
  }
}
