import { RecognizerResult } from './RecognizerResults';
import { LuisAppInfo } from './LuisAppInfo';
import { LuisResponse } from '../Luis/LuisResponse';
import { LuisModel } from './LuisModel';
import { LuisOptions } from '../Luis/LuisOptions';

export interface LuisTraceInfo {
  recognizerResult: RecognizerResult;
  luisModel: LuisModel;
  luisResult: LuisResponse;
  luisOptions: LuisOptions;
}