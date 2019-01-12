import { AzureSettings } from "@bfemulator/app-shared";

import {
  AZURE_LOGGED_IN_USER_CHANGED,
  AZURE_PERSIST_LOGIN_CHANGED,
  AzureAuthAction
} from "../actions/azureAuthActions";

export function azureAuth(
  state: AzureSettings = {},
  action: AzureAuthAction<string | boolean>
): AzureSettings {
  switch (action.type) {
    case AZURE_PERSIST_LOGIN_CHANGED:
      return { ...state, persistLogin: action.payload as boolean };

    case AZURE_LOGGED_IN_USER_CHANGED:
      return { ...state, signedInUser: action.payload as string };

    default:
      return state;
  }
}
