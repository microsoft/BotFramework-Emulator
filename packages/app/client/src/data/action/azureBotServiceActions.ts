//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

import { IAzureBotService } from 'msbot/bin/schema';
import { ComponentClass } from 'react';
import { Action } from 'redux';
import { AzureBotServiceEditor } from '../../ui/shell/explorer/azureBotServiceExplorer/azureBotServiceEditor';

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
  azureBotServiceEditorComponent?: ComponentClass<AzureBotServiceEditor>;
}

export function launchAzureBotServiceEditor(azureBotServiceEditorComponent: ComponentClass<AzureBotServiceEditor>,
                                            azureBotService?: IAzureBotService)
  : AzureBotServiceAction<AzureBotServiceEditorPayload> {
  return {
    type: LAUNCH_AZURE_BOT_SERVICE_EDITOR,
    payload: { azureBotServiceEditorComponent, azureBotService }
  };
}

export function openAzureBotServiceDeepLink(azureBotService: IAzureBotService)
  : AzureBotServiceAction<AzureBotServicePayload> {
  return {
    type: OPEN_AZURE_BOT_SERVICE_DEEP_LINK,
    payload: { azureBotService }
  };
}

export function openAzureBotServiceExplorerContextMenu(azureBotServiceEditorComponent
                                                         : ComponentClass<AzureBotServiceEditor>,
                                                       azureBotService?: IAzureBotService)
  : AzureBotServiceAction<AzureBotServiceEditorPayload> {
  return {
    type: OPEN_AZURE_BOT_SERVICE_CONTEXT_MENU,
    payload: { azureBotServiceEditorComponent, azureBotService }
  };
}
