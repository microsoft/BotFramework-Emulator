import { Action } from "redux";

export const AZURE_LOGGED_IN_USER_CHANGED = "AZURE_LOGGED_IN_USER_CHANGED";
export const AZURE_PERSIST_LOGIN_CHANGED = "AZURE_PERSIST_LOGIN_CHANGED";

export interface AzureAuthAction<T> extends Action {
  payload: T;
}

export function azurePersistLoginChanged(
  persistLogin: boolean
): AzureAuthAction<boolean> {
  return {
    type: AZURE_PERSIST_LOGIN_CHANGED,
    payload: persistLogin
  };
}

export function azureLoggedInUserChanged(
  signedInUser: string
): AzureAuthAction<string> {
  return {
    type: AZURE_LOGGED_IN_USER_CHANGED,
    payload: signedInUser
  };
}
