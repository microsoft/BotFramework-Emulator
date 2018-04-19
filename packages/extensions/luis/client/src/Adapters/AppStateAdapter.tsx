import { AppState, PersistentAppState } from '../App';
import { RecognizerResult } from '../Models/RecognizerResults';
import { LuisAppInfo } from '../Models/LuisAppInfo';
import { LuisTraceInfo } from '../Models/LuisTraceInfo';
import { AppInfo } from '../Luis/AppInfo';
import { IntentInfo } from '../Luis/IntentInfo';
import { ITraceActivity } from '@bfemulator/sdk-shared';
import { ButtonSelected } from '../Controls/ControlBar';
import { RecognizerResultAdapter } from 'src/Adapters/RecognizerResultAdapter';

const TraceActivity = 'trace';
const LuisTraceType = 'https://www.luis.ai/schemas/trace';

interface LuisModel {
  ModelID: string;
  SubscriptionKey: string;
}

export default class AppStateAdapter implements AppState {
  authoringKey: string;
  persistentState: { [key: string]: PersistentAppState; };
  appInfo: AppInfo;
  intentInfo: IntentInfo[];
  traceInfo: LuisTraceInfo;
  controlBarButtonSelected: ButtonSelected;
  id: string;

  private static validate(obj: any): boolean {
    if (!obj) {
      return false;
    }
    const trace = obj as ITraceActivity;
    if (trace.type !== TraceActivity || trace.valueType !== LuisTraceType) {
      return false;
    }
    if (!trace.value) {
      return false;
    }
    if (!AppStateAdapter.isALuisTraceInfo(trace.value)) {
      return false;
    }
    return true;
  }

  private static isALuisTraceInfo(obj: any): obj is LuisTraceInfo {
    return obj.luisOptions && obj.luisModel && obj.luisResult;
  }

  constructor(obj: any) {
    if (!AppStateAdapter.validate(obj)) {
      return;
    }
    let traceActivity = (obj as ITraceActivity);
    this.traceInfo = traceActivity.value as LuisTraceInfo;
    this.controlBarButtonSelected = this.traceInfo.recognizerResult ? 
                                      ButtonSelected.RecognizerResult : 
                                      ButtonSelected.RawResponse;
    if (!this.traceInfo.recognizerResult) {
      // Polyfill the Recognizer Result object
      this.traceInfo.recognizerResult = new RecognizerResultAdapter(this.traceInfo.luisResult);
    }
    this.id = traceActivity.id || '';
  }
}