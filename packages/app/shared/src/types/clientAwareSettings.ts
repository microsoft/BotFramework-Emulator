import { UserSettings } from "./serverSettingsTypes";

export interface ClientAwareSettings {
  cwd: string;
  locale: string;
  serverUrl: string;
  users: UserSettings;
}
