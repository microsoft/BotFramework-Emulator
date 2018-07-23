import { Action } from 'redux';

export declare type AuthStatus = 'inProgress' | 'ended' | 'notStarted' | 'canceled' | 'successful' | 'failed';

export const AZURE_AUTH_STATUS_CHANGED = 'AZURE_AUTH_STATUS_CHANGED';
export const AZURE_ARM_TOKEN_CHANGED = 'AZURE_ARM_TOKEN_CHANGED';
export const AZURE_PERSIST_LOGIN_CHANGED = 'AZURE_PERSIST_LOGIN_CHANGED';

export interface AzureAuthWorkflowStatus {
  azureAuthWorkflowStatus: AuthStatus;
}

export interface AzureAuthAction<T> extends Action {
  payload: T;
}

export declare type ArmToken = string;

export function azureAuthStatusChanged(azureAuthWorkflowStatus: AuthStatus): AzureAuthAction<AzureAuthWorkflowStatus> {
  return {
    type: AZURE_AUTH_STATUS_CHANGED,
    payload: { azureAuthWorkflowStatus }
  };
}

export function azurePersistLoginChanged(persistLogin: boolean): AzureAuthAction<boolean> {
  return {
    type: AZURE_PERSIST_LOGIN_CHANGED,
    payload: persistLogin
  };
}
