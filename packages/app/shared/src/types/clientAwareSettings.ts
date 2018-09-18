import { UserSettings } from './serverSettingsTypes';

export interface ClientAwareSettings {
  cwd: string;
  serverUrl: string;
  users: UserSettings;
}
