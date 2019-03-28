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

import { DebugMode, SharedConstants } from '@bfemulator/app-shared';
import { CommandRegistry } from '@bfemulator/sdk-shared';
import { ServiceTypes } from 'botframework-config/lib/schema';

import * as Constants from '../constants';
import { azureArmTokenDataChanged, beginAzureAuthWorkflow, invalidateArmToken } from '../data/action/azureAuthActions';
import { closeBot } from '../data/action/botActions';
import { switchDebugMode } from '../data/action/debugModeAction';
import * as EditorActions from '../data/action/editorActions';
import * as NavBarActions from '../data/action/navBarActions';
import { ProgressIndicatorPayload, updateProgressIndicator } from '../data/action/progressIndicatorActions';
import { switchTheme } from '../data/action/themeActions';
import { showWelcomePage } from '../data/editorHelpers';
import { AzureAuthState } from '../data/reducer/azureAuthReducer';
import { store } from '../data/store';
import { CommandServiceImpl } from '../platform/commands/commandServiceImpl';
import {
  AzureLoginFailedDialogContainer,
  AzureLoginPromptDialogContainer,
  AzureLoginSuccessDialogContainer,
  BotCreationDialog,
  DialogService,
  OpenBotDialogContainer,
  PostMigrationDialogContainer,
  ProgressIndicatorContainer,
  SecretPromptDialogContainer,
  UpdateAvailableDialogContainer,
  UpdateUnavailableDialogContainer,
} from '../ui/dialogs';

/** Register UI commands (toggling UI) */
export function registerCommands(commandRegistry: CommandRegistry) {
  const { UI, Telemetry } = SharedConstants.Commands;

  // ---------------------------------------------------------------------------
  // Shows the welcome page
  commandRegistry.registerCommand(UI.ShowWelcomePage, () => {
    return showWelcomePage();
  });

  // ---------------------------------------------------------------------------
  // Shows a bot creation dialog
  commandRegistry.registerCommand(UI.ShowBotCreationDialog, async () => {
    return await DialogService.showDialog(BotCreationDialog);
  });

  // ---------------------------------------------------------------------------
  // Shows a bot creation dialog
  commandRegistry.registerCommand(UI.ShowOpenBotDialog, async () => {
    return await DialogService.showDialog(OpenBotDialogContainer);
  });

  // ---------------------------------------------------------------------------
  // Shows a dialog prompting the user for a bot secret
  commandRegistry.registerCommand(UI.ShowSecretPromptDialog, async () => {
    return await DialogService.showDialog(SecretPromptDialogContainer);
  });

  // ---------------------------------------------------------------------------
  // Switches navbar tab selection
  commandRegistry.registerCommand(
    UI.SwitchNavBarTab,
    (tabName: string): void => {
      store.dispatch(NavBarActions.select(tabName));
    }
  );

  // ---------------------------------------------------------------------------
  // Open App Settings
  commandRegistry.registerCommand(
    UI.ShowAppSettings,
    (): void => {
      const { CONTENT_TYPE_APP_SETTINGS, DOCUMENT_ID_APP_SETTINGS } = Constants;
      store.dispatch(
        EditorActions.open({
          contentType: CONTENT_TYPE_APP_SETTINGS,
          documentId: DOCUMENT_ID_APP_SETTINGS,
          isGlobal: true,
          meta: null,
        })
      );
    }
  );

  // ---------------------------------------------------------------------------
  // Theme switching from main
  commandRegistry.registerCommand(UI.SwitchTheme, (themeName: string, themeHref: string) => {
    const linkTags = document.querySelectorAll<HTMLLinkElement>('[data-theme-component="true"]');
    const themeTag = document.getElementById('themeVars') as HTMLLinkElement;
    if (themeTag) {
      themeTag.href = themeHref;
    }
    const themeComponents = Array.prototype.map.call(linkTags, link => link.href); // href is fully qualified
    store.dispatch(switchTheme(themeName, themeComponents));
    CommandServiceImpl.remoteCall(Telemetry.TrackEvent, 'app_chooseTheme', {
      themeName,
    }).catch(_e => void 0);
  });

  // ---------------------------------------------------------------------------
  // Debug mode from main
  commandRegistry.registerCommand(UI.SwitchDebugMode, (debugMode: DebugMode) => {
    if (debugMode === DebugMode.Sidecar) {
      store.dispatch(EditorActions.closeNonGlobalTabs());
      store.dispatch(closeBot());
    }
    store.dispatch(switchDebugMode(debugMode));
  });

  // ---------------------------------------------------------------------------
  // Azure sign in
  commandRegistry.registerCommand(UI.SignInToAzure, (serviceType: ServiceTypes) => {
    store.dispatch(
      beginAzureAuthWorkflow(
        AzureLoginPromptDialogContainer,
        { serviceType },
        AzureLoginSuccessDialogContainer,
        AzureLoginFailedDialogContainer
      )
    );
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

  // ---------------------------------------------------------------------------
  // Shows the progress indicator component
  commandRegistry.registerCommand(UI.ShowProgressIndicator, async (props?: ProgressIndicatorPayload) => {
    return await DialogService.showDialog(
      ProgressIndicatorContainer,
      props
      // eslint-disable-next-line no-console
    ).catch(e => console.error(e));
  });

  // ---------------------------------------------------------------------------
  // Updates the progress of the progress indicator component
  commandRegistry.registerCommand(UI.UpdateProgressIndicator, (value: ProgressIndicatorPayload) => {
    store.dispatch(updateProgressIndicator(value));
  });

  // ---------------------------------------------------------------------------
  // Shows the dialog telling the user that an update is available
  commandRegistry.registerCommand(UI.ShowUpdateAvailableDialog, async (version: string = '') => {
    return await DialogService.showDialog(UpdateAvailableDialogContainer, {
      version,
      // eslint-disable-next-line no-console
    }).catch(e => console.error(e));
  });

  // ---------------------------------------------------------------------------
  // Shows the dialog telling the user that an update is unavailable
  commandRegistry.registerCommand(UI.ShowUpdateUnavailableDialog, async () => {
    return await DialogService.showDialog(
      UpdateUnavailableDialogContainer
      // eslint-disable-next-line no-console
    ).catch(e => console.error(e));
  });
}
