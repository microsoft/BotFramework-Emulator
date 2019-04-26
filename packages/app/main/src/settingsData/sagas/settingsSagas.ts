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
import { DebugMode, FrameworkSettings, Settings, SharedConstants } from '@bfemulator/app-shared';
import { Users } from '@bfemulator/emulator-core';
import { ClientAwareSettings } from '@bfemulator/app-shared';
import { call, ForkEffect, select, takeEvery } from 'redux-saga/effects';

import { Emulator } from '../../emulator';
import { mainWindow } from '../../main';
import { FrameworkAction, PUSH_CLIENT_AWARE_SETTINGS, SET_FRAMEWORK } from '../actions/frameworkActions';
import {
  DEBUG_MODE_CHANGED,
  REMEMBER_THEME,
  RememberDebugModePayload,
  WindowStateAction,
} from '../actions/windowStateActions';

const getAvailableThemes = (state: Settings) => state.windowState.availableThemes;
const getCurrentTheme = (state: Settings) => state.windowState.theme;
const getState = (state: Settings) => state;

export function* rememberThemeSaga(): IterableIterator<any> {
  const availableThemes = yield select(getAvailableThemes);
  const theme = yield select(getCurrentTheme);

  const themeInfo = availableThemes.find(availableTheme => availableTheme.name === theme);
  const { commandService } = mainWindow;
  const { SwitchTheme } = SharedConstants.Commands.UI;
  yield call([commandService, commandService.remoteCall], SwitchTheme, themeInfo.name, themeInfo.href);
}

export function* debugModeChanged(action: WindowStateAction<RememberDebugModePayload>) {
  const { debugMode } = action.payload;
  const hasConversations = Object.keys(
    Emulator.getInstance().framework.server.botEmulator.facilities.conversations.conversations
  ).length;
  // If the user has an open botfile, confirm before switching
  // Note that once this propagates to the client,
  // it's assumed the user has confirmed that all
  // tabs will be closed.
  const { commandService } = mainWindow;
  if (hasConversations) {
    const confirmation = yield call(
      [commandService, commandService.call],
      SharedConstants.Commands.Electron.ShowMessageBox,
      true,
      {
        buttons: ['Cancel', 'OK'],
        cancelId: 0,
        defaultId: 1,
        message: 'Switch debug modes? All tabs will be closed.',
        type: 'question',
      }
    );

    // User canceled the switch - reset the view menu
    // since it will already show a checked state when
    // we get here.
    if (!confirmation) {
      yield call(
        [commandService, commandService.call],
        SharedConstants.Commands.Electron.UpdateDebugModeMenuItem,
        false
      );
      return;
    } else {
      // Make sure ngrok is shutdown since the free service does not allow
      // more than 1 instance running at a time and an externally running
      // ngrok instance is required for sidecar debugging.
      yield call([commandService, commandService.call], SharedConstants.Commands.Ngrok.KillProcess);
    }
  }
  // If we get here, the user has confirmed to close an open
  // bot or there is not open bot.
  yield call([commandService, commandService.remoteCall], SharedConstants.Commands.UI.SwitchDebugMode, debugMode);
  // finally, push the new settings to the client
  yield pushClientAwareSettings();
}

export function* startEmulator(forceRestart: boolean = false) {
  const emulator = Emulator.getInstance();
  const port = emulator.framework.serverPort || null;
  if (!forceRestart && emulator.framework.serverPort === port) {
    return;
  }
  yield emulator.startup(port);
  const { users: userSettings, framework } = yield select(getState);
  const users = new Users();
  users.currentUserId = userSettings.currentUserId;
  users.users = userSettings.usersById;

  const { facilities } = emulator.framework.server.botEmulator;
  facilities.locale = framework.locale;
  facilities.users = users;
}

export function* setFramework(action: FrameworkAction<FrameworkSettings>): IterableIterator<any> {
  const emulator = Emulator.getInstance();
  yield emulator.ngrok.updateNgrokFromSettings(action.state);
  emulator.framework.server.botEmulator.facilities.locale = action.state.locale;
  yield* pushClientAwareSettings();
}

function* pushClientAwareSettings() {
  yield* startEmulator(); // Start the emulator to get the serverUrl
  const settingsState = yield select(getState);
  yield call(
    [mainWindow.commandService, mainWindow.commandService.remoteCall],
    SharedConstants.Commands.Settings.ReceiveGlobalSettings,
    {
      serverUrl: (Emulator.getInstance().framework.serverUrl || '').replace('[::]', 'localhost'),
      cwd: (process.cwd() || '').replace(/\\/g, '/'),
      users: settingsState.users,
      locale: settingsState.framework.locale,
      debugMode: settingsState.windowState.debugMode || DebugMode.Normal,
    } as ClientAwareSettings
  );
}

export function* settingsSagas(): IterableIterator<ForkEffect> {
  yield takeEvery(REMEMBER_THEME, rememberThemeSaga);
  yield takeEvery(DEBUG_MODE_CHANGED, debugModeChanged);
  yield takeEvery(SET_FRAMEWORK, setFramework);
  yield takeEvery(PUSH_CLIENT_AWARE_SETTINGS, pushClientAwareSettings);
}
