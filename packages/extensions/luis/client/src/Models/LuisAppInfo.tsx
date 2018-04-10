import { AppInfo } from '../Luis/AppInfo';

export interface LuisAppInfo {
  appId: string;
  key: string;
  baseUri: string;
  appInfo: AppInfo;
}