import { AzureSettings } from '@bfemulator/app-shared';
import {
  ArmToken,
  AuthStatus,
  AZURE_AUTH_STATUS_CHANGED,
  AZURE_PERSIST_LOGIN_CHANGED,
  AzureAuthAction,
  AzureAuthWorkflowStatus
} from '../actions/azureAuthActions';

export function azureAuth(state: AzureSettings = {} as AzureSettings,
                          action: AzureAuthAction<AzureAuthWorkflowStatus | ArmToken | AuthStatus | boolean>)
  : AzureSettings {
  switch (action.type) {
    case AZURE_AUTH_STATUS_CHANGED:
      return { ...state, azureAuthWorkflowStatus: action.payload as AuthStatus } as AzureSettings;

    case AZURE_PERSIST_LOGIN_CHANGED:
      return { ...state, persistLogin: action.payload as boolean };

    default:
      return state;
  }
}
