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
import { remote, app } from 'electron';
import * as path from 'path';
import * as fs from 'fs-extra';
import { AzureAuthWorkflowService } from '../services/azureAuthWorkflowService';
import { getStore as getSettingsStore } from '../settingsData/store';
import { CommandRegistry } from '@bfemulator/sdk-shared';
import { SharedConstants } from '@bfemulator/app-shared';
import { azureLoggedInUserChanged, azurePersistLoginChanged } from '../settingsData/actions/azureAuthActions';
import { mainWindow } from '../main';
import { emulator } from '../emulator';

/** Registers LUIS commands */
export function registerCommands(commandRegistry: CommandRegistry) {
  const { Azure } = SharedConstants.Commands;

  // ---------------------------------------------------------------------------
  // Retrieve the Azure ARM Token
  commandRegistry.registerCommand(Azure.RetrieveArmToken, async (renew: boolean = false) => {
    const settingsStore = getSettingsStore();
    const serverUrl = (emulator.framework.serverUrl || '').replace('[::]', 'localhost');
    const workflow = AzureAuthWorkflowService.retrieveAuthToken(renew, `${serverUrl}/v4/token`);
    let result = undefined;
    while (true) {
      const next = workflow.next(result);
      if (next.done) {
        break;
      }
      try {
        result = await next.value;
      } catch {
        break;
      }
    }
    if (result && !result.error) {
      const [, payload] = (result.access_token as string).split('.');
      const pjson = JSON.parse(Buffer.from(payload, 'base64').toString());
      settingsStore.dispatch(azureLoggedInUserChanged((pjson.upn || pjson.unique_name || pjson.name || pjson.email)));
      await mainWindow.commandService.call(SharedConstants.Commands.Electron.UpdateFileMenu);
      // Add the current persistLogin value which the UI can use
      // to bind to without retrieving the entire settingsStore
      result.persistLogin = settingsStore.getState().azure.persistLogin;
    }
    return result;
  });

  // ---------------------------------------------------------------------------
  // Sign the user out of Azure
  commandRegistry.registerCommand(Azure.SignUserOutOfAzure, async (prompt: boolean = true) => {
    const cookiesPath = path.join((app || remote.app).getPath('userData'), 'Cookies');
    const stat = await fs.stat(cookiesPath);
    if (stat.isFile()) {
      await fs.unlink(cookiesPath);
    }

    const store = getSettingsStore();
    store.dispatch(azureLoggedInUserChanged(''));
    try {
      await mainWindow.commandService.call(SharedConstants.Commands.Electron.UpdateFileMenu);
    } catch {
      // Nothing to do
    }
    if (prompt) {
      try {
        await mainWindow.commandService.call(SharedConstants.Commands.Electron.ShowMessageBox, false, {
          message: 'You have successfully signed out of azure',
          title: 'Success!'
        });
      } catch {
        // Nothing to do
      }
    }

    return true;
  });

  // ---------------------------------------------------------------------------
  // User has changed the "Keep me signed in" selection after a successful login
  commandRegistry.registerCommand(Azure.PersistAzureLoginChanged, persistLogin => {
    getSettingsStore().dispatch(azurePersistLoginChanged(persistLogin));
  });
}
