import { ClientAwareSettings } from "@bfemulator/app-shared/built";

import {
  CLIENT_AWARE_SETTINGS_CHANGED,
  ClientAwareSettingsActions
} from "../action/clientAwareSettingsActions";

export function clientAwareSettings(
  state: ClientAwareSettings = {} as any,
  action: ClientAwareSettingsActions
): ClientAwareSettings {
  switch (action.type) {
    case CLIENT_AWARE_SETTINGS_CHANGED:
      return { ...state, ...action.payload };

    default:
      return state;
  }
}
