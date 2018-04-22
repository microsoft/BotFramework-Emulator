import { IAzureBotService } from '@bfemulator/sdk-shared';
import { ComponentClass } from 'react';
import { Action } from 'redux';
import { AzureBotServiceEditor } from '../../ui/shell/explorer/azureBotServiceExplorer/azureBotServiceEditor/azureBotServiceEditor';

export const OPEN_AZURE_BOT_SERVICE_DEEP_LINK = 'OPEN_AZURE_BOT_SERVICE_DEEP_LINK';
export const OPEN_AZURE_BOT_SERVICE_CONTEXT_MENU = 'OPEN_AZURE_BOT_SERVICE_CONTEXT_MENU';
export const LAUNCH_AZURE_BOT_SERVICE_EDITOR = 'LAUNCH_AZURE_BOT_SERVICE_EDITOR';

export interface AzureBotServiceAction<T> extends Action {
  payload: T;
}

export interface AzureBotServicePayload {
  azureBotService: IAzureBotService;
}

export interface AzureBotServiceEditorPayload extends AzureBotServicePayload {
  azureBotServiceEditorComponent?: ComponentClass<AzureBotServiceEditor>,
}

export function launchAzureBotServiceEditor(azureBotServiceEditorComponent: ComponentClass<AzureBotServiceEditor>, azureBotService?: IAzureBotService): AzureBotServiceAction<AzureBotServiceEditorPayload> {
  return {
    type: LAUNCH_AZURE_BOT_SERVICE_EDITOR,
    payload: { azureBotServiceEditorComponent, azureBotService }
  };
}

export function openAzureBotServiceDeepLink(azureBotService: IAzureBotService): AzureBotServiceAction<AzureBotServicePayload> {
  return {
    type: OPEN_AZURE_BOT_SERVICE_DEEP_LINK,
    payload: { azureBotService }
  };
}

export function openAzureBotServiceExplorerContextMenu(azureBotServiceEditorComponent: ComponentClass<AzureBotServiceEditor>, azureBotService?: IAzureBotService): AzureBotServiceAction<AzureBotServiceEditorPayload> {
  return {
    type: OPEN_AZURE_BOT_SERVICE_CONTEXT_MENU,
    payload: { azureBotServiceEditorComponent, azureBotService }
  };
}
