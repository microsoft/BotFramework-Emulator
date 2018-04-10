import { RecognizerResult } from './RecognizerResults';
import { LuisAppInfo } from './LuisAppInfo';
import { LuisResponse } from '../Luis/LuisResponse';
import { LuisModel } from './LuisModel';

export interface LuisTraceInfo {
  recognizerResult: RecognizerResult;
  luisModel: LuisModel;
  luisResult: LuisResponse;
}