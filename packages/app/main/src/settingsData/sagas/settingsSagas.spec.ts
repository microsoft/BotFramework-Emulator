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
import '../../fetchProxy';
import { DebugMode, Settings, settingsDefault, SharedConstants } from '@bfemulator/app-shared';
import { applyMiddleware, createStore, Store } from 'redux';
import sagaMiddlewareFactory from 'redux-saga';

import reducers from '../reducers';
import { debugModeChanged, rememberTheme } from '../actions/windowStateActions';

import { settingsSagas } from './settingsSagas';
import { CommandServiceImpl, CommandServiceInstance } from '@bfemulator/sdk-shared';

const mockEmulator = {
  startup: async () => true,
  framework: {
    serverPort: null,
    server: { botEmulator: { facilities: { conversations: { conversations: { convo: {} } } } } },
  },
};

jest.mock('../../emulator', () => ({
  Emulator: {
    getInstance: () => mockEmulator,
  },
}));

jest.mock('../../botHelpers', () => ({
  getActiveBot: () => ({}),
}));

let mockStore: Store<Settings>;

jest.mock('../store', () => ({
  get store() {
    return mockStore;
  },
}));

const sagaMiddleWare = sagaMiddlewareFactory();

jest.mock('electron', () => ({
  app: { getAppPath: () => '' },
  ipcMain: new Proxy(
    {},
    {
      get(): any {
        return () => ({});
      },
      has() {
        return true;
      },
    }
  ),
  ipcRenderer: new Proxy(
    {},
    {
      get(): any {
        return () => ({});
      },
      has() {
        return true;
      },
    }
  ),
}));

describe('The SettingsSagas', () => {
  let commandService: CommandServiceImpl;
  beforeAll(() => {
    const decorator = CommandServiceInstance();
    const descriptor = decorator({ descriptor: {} }, 'none') as any;
    commandService = descriptor.descriptor.get();
  });

  beforeEach(() => {
    mockStore = createStore(
      reducers,
      {
        ...settingsDefault,
        windowState: { availableThemes: [{ href: 'myTheme.scss', name: 'myTheme' }] },
      },
      applyMiddleware(sagaMiddleWare)
    );
    sagaMiddleWare.run(settingsSagas);
  });

  it('should remember a theme change and dispatch', () => {
    const commandServiceSpy = jest.spyOn(commandService, 'remoteCall');
    mockStore.dispatch(rememberTheme('myTheme'));
    expect(commandServiceSpy).toHaveBeenCalledWith(SharedConstants.Commands.UI.SwitchTheme, 'myTheme', 'myTheme.scss');
  });

  it('should orchestrate the changes needed when switching debug modes', async () => {
    const localCommandServiceSpy = jest.spyOn(commandService, 'call').mockResolvedValue(true);
    const remoteCommandServiceSpy = jest.spyOn(commandService, 'remoteCall').mockResolvedValue(true);

    mockStore.dispatch(debugModeChanged(DebugMode.Sidecar));
    expect(localCommandServiceSpy).toHaveBeenCalledWith(
      SharedConstants.Commands.Electron.ShowMessageBox,
      true,
      jasmine.any(Object)
    );
    await Promise.resolve(true); // Wait for ShowMessageBox to resolve
    expect(localCommandServiceSpy).toHaveBeenCalledWith(SharedConstants.Commands.Ngrok.KillProcess);

    expect(remoteCommandServiceSpy).toHaveBeenCalledWith(
      SharedConstants.Commands.UI.SwitchDebugMode,
      DebugMode.Sidecar
    );
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(remoteCommandServiceSpy).toHaveBeenCalledWith(
      SharedConstants.Commands.Settings.ReceiveGlobalSettings,
      jasmine.any(Object)
    );
  });
});
