import { AppState } from './App';
import { RecognizerResult } from './Models/RecognizerResults';
import { LuisAppInfo } from './Models/LuisAppInfo';
import { LuisTraceInfo } from './Models/LuisTraceInfo';
import { AppInfo } from './Luis/AppInfo';
import { IntentInfo } from './Luis/IntentInfo';
import { IActivity, IEventActivity } from '@bfemulator/sdk-shared';

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

  private static validate(activities: IActivity[]): boolean {
    if (!activities || activities.length === 0) {
      return false;
    }
    const event = activities[0] as IEventActivity;
    if (event.type !== EventActivity || event.name !== LuisTraceEventName) {
      return false;
    }
    if (!event.value) {
      return false;
    }
    if (!AppStateAdapter.isALuisTraceInfo(event.value)) {
      return false;
    }
    return true;
  }

  private static isALuisTraceInfo(obj: any): obj is LuisTraceInfo {
    return obj.recognizerResult !== undefined && obj.luisModel !== undefined;
  }

  constructor(activities: IActivity[]) {
    if (!AppStateAdapter.validate(activities)) {
      return;
    }
    this.traceInfo = (activities[0] as IEventActivity).value as LuisTraceInfo;
  }
}