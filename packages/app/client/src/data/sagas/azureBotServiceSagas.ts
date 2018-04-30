import { IAzureBotService, ServiceType } from 'msbot/bin/schema';
import { ComponentClass } from 'react';
import { call, ForkEffect, takeEvery, takeLatest } from 'redux-saga/effects';
import { CommandService } from '../../platform/commands/commandService';
import { DialogService } from '../../ui/dialogs/service';
import { AzureBotServiceEditor } from '../../ui/shell/explorer/azureBotServiceExplorer/azureBotServiceEditor/azureBotServiceEditor';
import { AzureBotServiceAction, AzureBotServiceEditorPayload, AzureBotServicePayload, LAUNCH_AZURE_BOT_SERVICE_EDITOR, OPEN_AZURE_BOT_SERVICE_CONTEXT_MENU, OPEN_AZURE_BOT_SERVICE_DEEP_LINK } from '../action/azureBotServiceActions';

function* launchAzureBotServiceEditor(action: AzureBotServiceAction<AzureBotServiceEditorPayload>): IterableIterator<any> {
  const { azureBotServiceEditorComponent, azureBotService = {} } = action.payload;
  const result = yield DialogService.showDialog<ComponentClass<AzureBotServiceEditor>>(azureBotServiceEditorComponent, { azureBotService });
  if (result) {
    yield CommandService.remoteCall('bot:add-or-update-service', ServiceType.AzureBotService, result);
  }
}

function* openAzureBotServiceContextMenu(action: AzureBotServiceAction<AzureBotServicePayload | AzureBotServiceEditorPayload>): IterableIterator<any> {
  const menuItems = [
    { label: 'Edit settings', id: 'edit' },
    { label: 'Open in web portal', id: 'open' },
    { label: 'Remove', id: 'forget' }
  ];
  const response = yield call(CommandService.remoteCall.bind(CommandService), 'electron:displayContextMenu', menuItems);
  switch (response.id) {
    case 'edit':
      yield* launchAzureBotServiceEditor(action);
      break;

    case 'open':
      yield* openAzureBotServiceDeepLink(action);
      break;

    case 'forget':
      yield* removeAzureBotServiceFromActiveBot(action.payload.azureBotService);
      break;

    default: // canceled context menu
      return;
  }
}

function* openAzureBotServiceDeepLink(action: AzureBotServiceAction<AzureBotServicePayload>): IterableIterator<any> {
  const { tenantId, subscriptionId, resourceGroup, id } = action.payload.azureBotService;
  const link = `https://ms.portal.azure.com/#@${tenantId}/resource/subscriptions/${subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.BotService/botServices/${id}/channels`;
  yield CommandService.remoteCall('electron:openExternal', link);
}

function* removeAzureBotServiceFromActiveBot(azureBotService: IAzureBotService): IterableIterator<any> {
  const result = yield CommandService.remoteCall('shell:show-message-box', true, {
    type: 'question',
    buttons: ["Cancel", "OK"],
    defaultId: 1,
    message: `Remove QnA service ${azureBotService.name}. Are you sure?`,
    cancelId: 0,
  });
  if (result) {
    yield CommandService.remoteCall('bot:remove-service', ServiceType.AzureBotService, azureBotService.id);
  }
}

export function* azureBotServiceSagas(): IterableIterator<ForkEffect> {
  yield takeLatest(LAUNCH_AZURE_BOT_SERVICE_EDITOR, launchAzureBotServiceEditor);
  yield takeEvery(OPEN_AZURE_BOT_SERVICE_CONTEXT_MENU, openAzureBotServiceContextMenu);
  yield takeEvery(OPEN_AZURE_BOT_SERVICE_DEEP_LINK, openAzureBotServiceDeepLink);
}
