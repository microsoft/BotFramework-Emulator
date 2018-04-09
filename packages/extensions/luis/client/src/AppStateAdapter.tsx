import { AppState } from  './App';
import { RecognizerResult } from './Models/RecognizerResults';
import { LuisAppInfo } from './Models/LuisAppInfo';

const EventActivity = 'event';
const LuisTraceEventName = 'https://www.luis.ai/schemas/trace';

interface LuisModel {
    ModelID: string;
    SubscriptionKey: string;
}

interface LuisTraceInfo {
    recognizerResult: any;
    luisModel: LuisModel;
}

export default class AppStateAdapter implements AppState {
    recognizerResult: RecognizerResult;
    luisAppInfo: LuisAppInfo;

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
        let luisTraceInfo = args[0].value as LuisTraceInfo;
        this.recognizerResult = luisTraceInfo.recognizerResult;
        this.luisAppInfo = {
            appId: luisTraceInfo.luisModel.ModelID,
            key: luisTraceInfo.luisModel.SubscriptionKey
        } as LuisAppInfo;
    }
}