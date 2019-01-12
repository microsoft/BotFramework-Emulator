import { ClientAwareSettings } from "@bfemulator/app-shared";
import { Action } from "redux";

export const CLIENT_AWARE_SETTINGS_CHANGED = "CLIENT_AWARE_SETTINGS_CHANGED";

export declare type ClientAwareSettingsActionsType = "CLIENT_AWARE_SETTINGS_CHANGED";

export interface ClientAwareSettingsActions extends Action {
  type: ClientAwareSettingsActionsType;
  payload: ClientAwareSettings;
}

export function clientAwareSettingsChanged(
  settings: ClientAwareSettings
): ClientAwareSettingsActions {
  return {
    type: CLIENT_AWARE_SETTINGS_CHANGED,
    payload: settings
  };
}
