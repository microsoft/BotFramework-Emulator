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

import {
  azureArmTokenDataChanged,
  beginAdd,
  beginAzureAuthWorkflow,
  invalidateArmToken,
  newNotification,
  open as openDocument,
  select as selectNavBar,
  switchTheme,
  updateProgressIndicator,
  AzureAuthState,
  ProgressIndicatorPayload,
  SharedConstants,
} from '@bfemulator/app-shared';
import { Command, CommandServiceImpl, CommandServiceInstance } from '@bfemulator/sdk-shared';
import { ServiceTypes } from 'botframework-config/lib/schema';
import { ComponentClass } from 'react';
import * as remote from '@electron/remote';

import * as Constants from '../constants';
import { showMarkdownPage, showWelcomePage } from '../state/helpers/editorHelpers';
import { store } from '../state/store';
import { ariaAlertService } from '../ui/a11y';
import {
  AzureLoginFailedDialogContainer,
  AzureLoginPromptDialogContainer,
  AzureLoginSuccessDialogContainer,
  BotCreationDialogContainer,
  DialogService,
  OpenBotDialogContainer,
  OpenUrlDialogContainer,
  PostMigrationDialogContainer,
  ProgressIndicatorContainer,
  SecretPromptDialogContainer,
  UpdateAvailableDialogContainer,
  UpdateUnavailableDialogContainer,
  DataCollectionDialogContainer,
} from '../ui/dialogs';
import { CustomActivityEditorContainer } from '../ui/dialogs/customActivityEditor/customActivityEditorContainer';
import { OpenBotDialogProps } from '../ui/dialogs/openBotDialog/openBotDialog';

const { UI, Telemetry } = SharedConstants.Commands;

/** Register UI commands (toggling UI) */
export class UiCommands {
  @CommandServiceInstance()
  private commandService: CommandServiceImpl;

  // ---------------------------------------------------------------------------
  // Shows the welcome page
  @Command(UI.ShowWelcomePage)
  protected showWelcomePageDispatcher() {
    return showWelcomePage();
  }

  // ---------------------------------------------------------------------------
  // Shows the markdown page after retrieving the remote source
  @Command(UI.ShowMarkdownPage)
  protected async showMarkdownPage(urlOrMarkdown: string, label: string, windowRef = window) {
    let markdown = '';
    let { onLine } = windowRef.navigator;
    if (!onLine) {
      return showMarkdownPage(markdown, label, onLine);
    }
    try {
      new URL(urlOrMarkdown); // Is this a valid URL?
      const bytes = await this.commandService.remoteCall<ArrayBuffer>(
        SharedConstants.Commands.Electron.FetchRemote,
        urlOrMarkdown
      );
      markdown = new TextDecoder().decode(bytes);
    } catch (e) {
      if (typeof e === 'string' && ('' + e).includes('ENOTFOUND')) {
        onLine = false;
      } else {
        // assume this is markdown text
        markdown = urlOrMarkdown;
      }
    }
    return showMarkdownPage(markdown, label, onLine);
  }

  // ---------------------------------------------------------------------------
  // Shows a bot creation dialog
  @Command(UI.ShowBotCreationDialog)
  protected async showBotCreationPage() {
    return await DialogService.showDialog(BotCreationDialogContainer);
  }

  // ---------------------------------------------------------------------------
  // Shows a bot creation dialog
  @Command(UI.ShowOpenBotDialog)
  protected async showOpenBotDialog(isDebug = false): Promise<void> {
    const mode = isDebug ? 'debug' : undefined;
    return await DialogService.showDialog<ComponentClass, void>(OpenBotDialogContainer, {
      isDebug,
      mode,
    } as OpenBotDialogProps);
  }

  // ---------------------------------------------------------------------------
  // Shows a dialog prompting the user for a bot secret
  @Command(UI.ShowSecretPromptDialog)
  protected async showSecretPromptDialog() {
    return await DialogService.showDialog(SecretPromptDialogContainer);
  }

  // ---------------------------------------------------------------------------
  // Switches navbar tab selection
  @Command(UI.SwitchNavBarTab)
  protected switchNavBar(tabName: string): void {
    store.dispatch(selectNavBar(tabName));
  }

  // ---------------------------------------------------------------------------
  // Open App Settings
  @Command(UI.ShowAppSettings)
  protected showAppSettings(): void {
    const { CONTENT_TYPE_APP_SETTINGS, DOCUMENT_ID_APP_SETTINGS } = Constants;
    store.dispatch(
      openDocument({
        contentType: CONTENT_TYPE_APP_SETTINGS,
        documentId: DOCUMENT_ID_APP_SETTINGS,
        isGlobal: true,
        meta: null,
      })
    );
  }

  // ---------------------------------------------------------------------------
  // Theme switching from main
  @Command(UI.SwitchTheme)
  protected switchTheme(themeName: string, themeHref: string, announce = true) {
    const linkTags = document.querySelectorAll<HTMLLinkElement>('[data-theme-component="true"]');
    const themeTag = document.getElementById('themeVars') as HTMLLinkElement;
    if (themeTag) {
      themeTag.href = themeHref;
    }
    const themeComponents = Array.prototype.map.call(linkTags, link => link.href); // href is fully qualified
    store.dispatch(switchTheme(themeName, themeComponents));
    this.commandService
      .remoteCall(Telemetry.TrackEvent, 'app_chooseTheme', {
        themeName,
      })
      .catch();

    if (announce) {
      ariaAlertService.alert(`${themeName} theme has been applied successfully.`);
    }
  }

  // ---------------------------------------------------------------------------
  // Azure sign in
  @Command(UI.SignInToAzure)
  protected signIntoAzure(serviceType: ServiceTypes) {
    return new Promise(resolve => {
      store.dispatch(
        beginAzureAuthWorkflow(
          AzureLoginPromptDialogContainer,
          { serviceType },
          AzureLoginSuccessDialogContainer,
          AzureLoginFailedDialogContainer,
          resolve
        )
      );
    });
  }

  @Command(UI.ArmTokenReceivedOnStartup)
  protected armTokenReceivedOnStartup(azureAuth: AzureAuthState) {
    store.dispatch(azureArmTokenDataChanged(azureAuth.access_token));
  }

  @Command(UI.InvalidateAzureArmToken)
  protected invalidateAzureArmToken() {
    store.dispatch(invalidateArmToken());
  }

  // ---------------------------------------------------------------------------
  // Show post migration dialog on startup if the user has just been migrated
  @Command(UI.ShowPostMigrationDialog)
  protected showPostMigrationDialog() {
    return DialogService.showDialog(PostMigrationDialogContainer);
  }

  // ---------------------------------------------------------------------------
  // Shows the progress indicator component
  @Command(UI.ShowProgressIndicator)
  protected async showProgressIndicator(props?: ProgressIndicatorPayload) {
    try {
      return await DialogService.showDialog(ProgressIndicatorContainer, props);
    } catch (e) {
      beginAdd(newNotification(e));
    }
  }

  // ---------------------------------------------------------------------------
  // Updates the progress of the progress indicator component
  @Command(UI.UpdateProgressIndicator)
  protected updateProgressIndicator(value: ProgressIndicatorPayload) {
    store.dispatch(updateProgressIndicator(value));
  }

  // ---------------------------------------------------------------------------
  // Shows the dialog telling the user that an update is available
  @Command(UI.ShowUpdateAvailableDialog)
  protected async showUpdateAvailableDialog(version = '') {
    try {
      await DialogService.dialogHidden();
      return await DialogService.showDialog(UpdateAvailableDialogContainer, {
        version,
      });
    } catch (e) {
      beginAdd(newNotification(e));
    }
  }

  // ---------------------------------------------------------------------------
  // Shows the dialog telling the user that an update is unavailable
  @Command(UI.ShowUpdateUnavailableDialog)
  protected async showUpdateUnavailableDialog() {
    try {
      return await DialogService.showDialog(UpdateUnavailableDialogContainer);
    } catch (e) {
      beginAdd(newNotification(e));
    }
  }

  // ---------------------------------------------------------------------------
  // Shows the confirmation dialog when open url
  @Command(UI.ShowOpenUrlDialog)
  protected async showOpenUrlDialog(url: string) {
    return await DialogService.showDialog(OpenUrlDialogContainer, { url });
  }

  // ---------------------------------------------------------------------------
  // Shows the data collection dialog
  @Command(UI.ShowDataCollectionDialog)
  protected showDataCollectionDialog() {
    return DialogService.showDialog(DataCollectionDialogContainer);
  }

  @Command(UI.ShowCustomActivityEditor)
  protected showCustomActivityEditor() {
    return DialogService.showDialog(CustomActivityEditorContainer);
  }

  @Command(UI.ToggleFullScreen)
  protected async toggleFullScreen(newState?: boolean, announce = true) {
    const currentWindow = remote.getCurrentWindow();
    const currentState = currentWindow.isFullScreen();
    newState = newState ?? !currentState;

    if (currentState === newState) return;

    currentWindow.setFullScreen(newState);

    if (announce) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      ariaAlertService.alert(`Full screen mode: ${newState ? 'entering full screen' : 'exiting full screen'}.`);
    }
  }
}
