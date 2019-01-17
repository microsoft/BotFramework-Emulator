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
  FrameworkSettings,
  Settings,
  SharedConstants,
} from '@bfemulator/app-shared';

import { emulator } from '../../emulator';
import { mainWindow } from '../../main';
import { NgrokService } from '../../ngrokService';
import { FrameworkAction, SET_FRAMEWORK } from '../actions/frameworkActions';
import {
  REMEMBER_THEME,
  RememberThemePayload,
  WindowStateAction,
} from '../actions/windowStateActions';

import { call, ForkEffect, select, takeEvery } from 'redux-saga/effects';

const getAvailableThemes = (state: Settings) =>
  state.windowState.availableThemes;
const getCurrentTheme = (state: Settings) => state.windowState.theme;

export function* rememberThemeSaga(
  _action: WindowStateAction<RememberThemePayload>
): IterableIterator<any> {
  const availableThemes = yield select(getAvailableThemes);
  const theme = yield select(getCurrentTheme);

  const themeInfo = availableThemes.find(
    availableTheme => availableTheme.name === theme
  );
  const { commandService } = mainWindow;
  const { SwitchTheme } = SharedConstants.Commands.UI;
  yield call(
    commandService.remoteCall.bind(commandService),
    SwitchTheme,
    themeInfo.name,
    themeInfo.href
  );
}

export function* setFramework(
  action: FrameworkAction<FrameworkSettings>
): IterableIterator<any> {
  const ngrokService = new NgrokService();
  const { commandService } = mainWindow;
  const { PushClientAwareSettings } = SharedConstants.Commands.Settings;
  emulator.framework.server.botEmulator.facilities.locale = action.state.locale;
  yield ngrokService.updateNgrokFromSettings(action.state);
  yield call(commandService.call.bind(commandService, PushClientAwareSettings));
}

export function* settingsSagas(): IterableIterator<ForkEffect> {
  yield takeEvery(REMEMBER_THEME, rememberThemeSaga);
  yield takeEvery(SET_FRAMEWORK, setFramework);
}
