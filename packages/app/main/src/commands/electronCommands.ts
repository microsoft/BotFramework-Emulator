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
import * as path from 'path';

import * as fs from 'fs-extra';
import * as Electron from 'electron';
import { app, dialog, MessageBoxOptions } from 'electron';
import { ContextMenuCoordinates, SharedConstants } from '@bfemulator/app-shared';
import { Command } from '@bfemulator/sdk-shared';

import { AppMenuBuilder } from '../appMenuBuilder';
import { store } from '../state/store';
import { emulatorApplication } from '../main';
import { ContextMenuService } from '../services/contextMenuService';
import { TelemetryService } from '../telemetry';
import { showOpenDialog, showSaveDialog } from '../utils';
import { AppUpdater } from '../appUpdater';
import { copyFileAsync } from '../utils/copyFileAsync';

const { shell } = Electron;

const Commands = SharedConstants.Commands.Electron;

/** Registers electron commands */
export class ElectronCommands {
  // ---------------------------------------------------------------------------
  // Show OS-native messsage box
  @Command(Commands.ShowMessageBox)
  protected showMessageBox(modal: boolean, options: MessageBoxOptions) {
    options = {
      message: '',
      title: app.getName(),
      ...options,
    };
    return dialog.showMessageBox(modal ? emulatorApplication.mainWindow.browserWindow : undefined, options);
  }

  // ---------------------------------------------------------------------------
  // Shows an open dialog and returns a path
  @Command(Commands.ShowOpenDialog)
  protected showOpenDialog(dialogOptions: Electron.OpenDialogOptions = {}): Promise<string> {
    return showOpenDialog(emulatorApplication.mainWindow.browserWindow, dialogOptions);
  }

  // ---------------------------------------------------------------------------
  // Shows a save dialog and returns a path + filename
  @Command(Commands.ShowSaveDialog)
  protected showSaveDialogWithOptions(dialogOptions: Electron.SaveDialogOptions = {}): string {
    return showSaveDialog(emulatorApplication.mainWindow.browserWindow, dialogOptions);
  }

  // ---------------------------------------------------------------------------
  // Builds a new app menu to reflect the updated recent bots list
  @Command(Commands.UpdateFileMenu)
  protected async updateFileMenu(): Promise<void> {
    AppMenuBuilder.refreshFileMenu();
    const state = store.getState();
    const recentBots = state.bot && state.bot.botFiles ? state.bot.botFiles : [];
    AppMenuBuilder.updateRecentBotsList(recentBots);
  }

  // ---------------------------------------------------------------------------
  // Builds a new app menu to reflect the updated conversation send activity list
  @Command(Commands.UpdateConversationMenu)
  protected async updateConversationMenu(clientEditorState: any): Promise<void> {
    // get the conversation menu items that we want to update
    const sendActivityMenuItems = AppMenuBuilder.sendActivityMenuItems;

    // enable / disable the send activity menu
    let enabled = false;
    const { editors = {}, activeEditor = '' } = clientEditorState;
    const { activeDocumentId = '' } = editors[activeEditor] || {};

    if (activeDocumentId && editors[activeEditor] && editors[activeEditor].documents) {
      const activeDocument = editors[activeEditor].documents[activeDocumentId];
      const { contentType = '' } = activeDocument;
      enabled = contentType && contentType === SharedConstants.ContentTypes.CONTENT_TYPE_LIVE_CHAT;
    }

    sendActivityMenuItems.forEach(item => {
      item.enabled = enabled;
    });
  }

  // ---------------------------------------------------------------------------
  // Sets the app's title bar
  @Command(Commands.SetTitleBar)
  protected setTitleBar(text: string) {
    if (text && text.length) {
      emulatorApplication.mainWindow.browserWindow.setTitle(app.getName() + ' - ' + text);
    } else {
      emulatorApplication.mainWindow.browserWindow.setTitle(app.getName());
    }
  }

  // ---------------------------------------------------------------------------
  // Displays the context menu for a given element
  @Command(Commands.DisplayContextMenu)
  protected displayContextMenu(menuItems: Electron.MenuItemConstructorOptions[], menuCoords?: ContextMenuCoordinates) {
    return ContextMenuService.showMenuAndWaitForInput(menuItems, menuCoords);
  }

  // ---------------------------------------------------------------------------
  // fetches the resource using node-fetch - useful when CORS is enabled on the remote host
  // Returns an array buffer since it's the most versatile data structure.
  @Command(Commands.FetchRemote)
  protected async fetchRemote(url: string, requestInit: RequestInit) {
    const response: {
      buffer?: () => Promise<ArrayBuffer>;
      arrayBuffer?: () => Promise<ArrayBuffer>;
      ok: boolean;
    } = await fetch(url, requestInit);
    let buffer: ArrayBuffer;
    if (response.ok) {
      try {
        buffer = await response.arrayBuffer();
        return new Uint8Array(buffer);
      } catch {
        // Old version of node-fetch?
      }
      try {
        buffer = await response.buffer();
        return new Uint8Array(buffer);
      } catch {
        // Something went wrong.
      }
    }
    return null;
  }

  // ---------------------------------------------------------------------------
  // Opens an external link
  @Command(Commands.OpenExternal)
  protected openExternal(url: string) {
    TelemetryService.trackEvent('app_openLink', { url });
    shell.openExternal(url, { activate: true });
  }

  // ---------------------------------------------------------------------------
  // Opens and item on the disk in Explorer (win) or Finder (mac)
  @Command(Commands.OpenFileLocation)
  protected async openFileLocation(filePath: string): Promise<boolean> {
    const parts = path.parse(filePath);
    const err = await shell.openPath(path.resolve(parts.dir));
    if (!err) {
      // success
      return true;
    }
    return false;
  }

  // ---------------------------------------------------------------------------
  // Moves an item to the trash
  @Command(Commands.UnlinkFile)
  protected async unlinkFile(filePath: string): Promise<void> {
    return shell.trashItem(path.resolve(filePath));
  }

  // ---------------------------------------------------------------------------
  // Given source path. Copies it to Destination Path
  @Command(Commands.CopyFile)
  protected async copyFile(sourcePath: string, destinationPath: string) {
    try {
      await copyFileAsync(sourcePath, destinationPath);
    } catch (ex) {
      return ex;
    }
  }

  // ---------------------------------------------------------------------------
  // Renames a file - the payload must contain the property "path" and "name"
  // This will also rename the file extension if one is provided in the "name" field
  @Command(Commands.RenameFile)
  protected async renameFile(info: { path: string; newPath: string; name: string }) {
    const { path: existingPath, newPath } = info;
    let { name } = info;
    const exists = await fs.pathExists(existingPath);
    if (!exists) {
      throw new ReferenceError(`Cannot rename File: ${existingPath} does not exist`);
    }
    const parts = path.parse(newPath || existingPath);
    if (!name) {
      name = parts.base;
    }
    const nameHasExt = path.extname(name);
    let fullPath = `${parts.dir}/${name}`;
    if (!nameHasExt) {
      fullPath += parts.ext;
    }
    return fs.rename(existingPath, fullPath); // let any errors propagate up the stack
  }

  // ---------------------------------------------------------------------------
  // Toggles Chrome dev tools
  @Command(Commands.ToggleDevTools)
  protected toggleDevTools(): void {
    emulatorApplication.mainBrowserWindow.webContents.toggleDevTools();
  }

  // ---------------------------------------------------------------------------
  // Quits the app and installs updates
  @Command(Commands.QuitAndInstall)
  protected quitAndInstall(): void {
    AppUpdater.quitAndInstall();
  }

  // ---------------------------------------------------------------------------
  // Checks for app updates
  @Command(Commands.CheckForUpdates)
  protected checkForUpdates(userInitiated = true): Promise<void> {
    return AppUpdater.checkForUpdates(userInitiated);
  }
}
