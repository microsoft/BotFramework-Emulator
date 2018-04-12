import { AppState } from './App';
import { RecognizerResult } from './Models/RecognizerResults';
import { LuisAppInfo } from './Models/LuisAppInfo';
import { LuisTraceInfo } from './Models/LuisTraceInfo';
import { AppInfo } from './Luis/AppInfo';
import { IntentInfo } from './Luis/IntentInfo';

const EventActivity = 'event';
const LuisTraceEventName = 'https://www.luis.ai/schemas/trace';

interface LuisModel {
  ModelID: string;
  SubscriptionKey: string;
}

export default class AppStateAdapter implements AppState {
  appInfo: AppInfo;
  intentInfo: IntentInfo[];
  traceInfo: LuisTraceInfo;
  pendingTrain: boolean;
  pendingPublish: boolean;

  private static validate(args: any): boolean {
    if (!args || args.length === 0) {
      return false;
    }
    if (args[0].type !== EventActivity || args[0].name !== LuisTraceEventName) {
      return false;
    }
    if (!args[0].value) {
      return false;
    }
    if (!AppStateAdapter.isALuisTraceInfo(args[0].value)) {
      return false;
    }
    return true;
  }

  private static isALuisTraceInfo(obj: any): obj is LuisTraceInfo {
    return obj.recognizerResult !== undefined && obj.luisModel !== undefined;
  }

  constructor(args: any) {
    if (!AppStateAdapter.validate(args)) {
      return;
    }
    this.traceInfo = args[0].value as LuisTraceInfo;
  }
}