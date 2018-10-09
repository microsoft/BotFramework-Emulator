import { call, ForkEffect, select, takeEvery } from 'redux-saga/effects';
import { REMEMBER_THEME, RememberThemePayload, WindowStateAction } from '../actions/windowStateActions';
import { NgrokService } from '../../ngrokService';
import { FrameworkAction, SET_FRAMEWORK } from '../actions/frameworkActions';
import { FrameworkSettings, Settings, SharedConstants } from '@bfemulator/app-shared';
import { mainWindow } from '../../main';

const getAvailableThemes = (state: Settings) => state.windowState.availableThemes;
const getCurrentTheme = (state: Settings) => state.windowState.theme;

export function* rememberThemeSaga(_action: WindowStateAction<RememberThemePayload>): IterableIterator<any> {
  const availableThemes = yield select(getAvailableThemes);
  const theme = yield select(getCurrentTheme);

  const themeInfo = availableThemes.find(availableTheme => availableTheme.name === theme);
  const { commandService } = mainWindow;
  const { SwitchTheme } = SharedConstants.Commands.UI;
  yield call(commandService.remoteCall.bind(commandService), SwitchTheme, themeInfo.name, themeInfo.href);
}

export function* setFramework(action: FrameworkAction<FrameworkSettings>): IterableIterator<any> {
  const ngrokService = new NgrokService();
  const { commandService } = mainWindow;
  const { PushClientAwareSettings } = SharedConstants.Commands.Settings;
  yield ngrokService.updateNgrokFromSettings(action.state);
  yield call(commandService.call.bind(commandService, PushClientAwareSettings));
}

export function* settingsSagas(): IterableIterator<ForkEffect> {
  yield takeEvery(REMEMBER_THEME, rememberThemeSaga);
  yield takeEvery(SET_FRAMEWORK, setFramework);
}
