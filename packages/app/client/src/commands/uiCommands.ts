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

import { showWelcomePage } from '../data/editorHelpers';
import {
  AzureLoginFailedDialogContainer,
  AzureLoginPromptDialogContainer,
  AzureLoginSuccessDialogContainer,
  BotCreationDialog,
  DialogService,
  PostMigrationDialogContainer,
  SecretPromptDialog
} from '../ui/dialogs';
import store from '../data/store';
import * as EditorActions from '../data/action/editorActions';
import * as NavBarActions from '../data/action/navBarActions';
import * as Constants from '../constants';
import { CommandRegistry } from '@bfemulator/sdk-shared';
import { ServiceTypes } from 'botframework-config/lib/schema';
import { SharedConstants } from '@bfemulator/app-shared';
import { azureArmTokenDataChanged, beginAzureAuthWorkflow, invalidateArmToken } from '../data/action/azureAuthActions';
import { AzureAuthState } from '../data/reducer/azureAuthReducer';
import { ProgressIndicatorPayload, updateProgressIndicator } from '../data/action/progressIndicatorActions';

/** Register UI commands (toggling UI) */
export function registerCommands(commandRegistry: CommandRegistry) {
  const { UI } = SharedConstants.Commands;

  // ---------------------------------------------------------------------------
  // Shows the welcome page
  commandRegistry.registerCommand(UI.ShowWelcomePage, () => {
    showWelcomePage();
  });

  // ---------------------------------------------------------------------------
  // Shows a bot creation dialog
  commandRegistry.registerCommand(UI.ShowBotCreationDialog, async () => {
    return await DialogService.showDialog(BotCreationDialog);
  });

  // ---------------------------------------------------------------------------
  // Shows a dialog prompting the user for a bot secret
  commandRegistry.registerCommand(UI.ShowSecretPromptDialog, async () => {
    return await DialogService.showDialog(SecretPromptDialog);
  });

  // ---------------------------------------------------------------------------
  // Switches navbar tab selection
  commandRegistry.registerCommand(UI.SwitchNavBarTab, (tabName: string): void => {
    store.dispatch(NavBarActions.select(tabName));
  });

  // ---------------------------------------------------------------------------
  // Switches navbar tab selection to Explorer
  commandRegistry.registerCommand(UI.ShowExplorer, (): void => {
    store.dispatch(NavBarActions.select(Constants.NAVBAR_BOT_EXPLORER));
  });

  // ---------------------------------------------------------------------------
  // Open App Settings
  commandRegistry.registerCommand(UI.ShowAppSettings, (): void => {
    const { CONTENT_TYPE_APP_SETTINGS, DOCUMENT_ID_APP_SETTINGS } = Constants;
    store.dispatch(EditorActions.open(CONTENT_TYPE_APP_SETTINGS, DOCUMENT_ID_APP_SETTINGS, true, null));
  });

  // ---------------------------------------------------------------------------
  // Theme switching from main
  commandRegistry.registerCommand(UI.SwitchTheme, themeHref => {
    const themeTag = document.getElementById('themeVars') as HTMLLinkElement;
    if (themeTag) {
      themeTag.href = themeHref;
    }
  });

  // ---------------------------------------------------------------------------
  // Azure sign in
  commandRegistry.registerCommand(UI.SignInToAzure, (serviceType: ServiceTypes) => {
    store.dispatch(beginAzureAuthWorkflow(
      AzureLoginPromptDialogContainer,
      { serviceType },
      AzureLoginSuccessDialogContainer,
      AzureLoginFailedDialogContainer));
  });

  commandRegistry.registerCommand(UI.ArmTokenReceivedOnStartup, (azureAuth: AzureAuthState) => {
    store.dispatch(azureArmTokenDataChanged(azureAuth.access_token));
  });

  commandRegistry.registerCommand(UI.InvalidateAzureArmToken, () => {
    store.dispatch(invalidateArmToken());
  });

  // ---------------------------------------------------------------------------
  // Show post migration dialog on startup if the user has just been migrated
  commandRegistry.registerCommand(UI.ShowPostMigrationDialog, () => {
    DialogService.showDialog(PostMigrationDialogContainer);
  });

  commandRegistry.registerCommand(UI.UpdateProgressIndicator, (value: ProgressIndicatorPayload) => {
    store.dispatch(updateProgressIndicator(value));
  });
}
