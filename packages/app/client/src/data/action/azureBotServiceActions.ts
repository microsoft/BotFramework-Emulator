import { IAzureBotService } from '@bfemulator/sdk-shared';
import { Action } from 'redux';

export const OPEN_ABS_EXPLORER_CONTEXT_MENU = 'OPEN_ABS_EXPLORER_CONTEXT_MENU';

export interface AzureBotServiceActions<T> extends Action {
  payload: T;
}

export interface AzureBotServicePayload {
  azureBotService?: IAzureBotService;
}

export function openAbsExplorerContextMenu(azureBotService: IAzureBotService): AzureBotServiceActions<AzureBotServicePayload> {
  return {
    type: OPEN_ABS_EXPLORER_CONTEXT_MENU,
    payload: { azureBotService }
  };
}
