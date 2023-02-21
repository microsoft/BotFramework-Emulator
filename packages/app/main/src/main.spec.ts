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

import { CommandServiceImpl, CommandServiceInstance } from '@bfemulator/sdk-shared';
import { SharedConstants } from '@bfemulator/app-shared';
import { nativeTheme } from 'electron';

import { emulatorApplication } from './main';

let mockShouldUseInvertedColorScheme = true;
jest.mock('electron', () => ({
  app: {
    on: () => void 0,
    setName: () => void 0,
    getPath: () => '',
  },
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
  systemPreferences: {
    isInvertedColorScheme: jest.fn(() => true),
    on: jest.fn(() => null),
    onInvertedColorSchemeChanged: jest.fn(() => true),
  },
  nativeTheme: {
    on: jest.fn(() => null),
    get shouldUseInvertedColorScheme() {
      return mockShouldUseInvertedColorScheme;
    },
  },
}));

jest.mock('./server/webSocketServer', () => ({
  WebSocketServer: {
    init: jest.fn(),
  },
}));

describe('main', () => {
  let commandService: CommandServiceImpl;
  let emulatorAppSpy;

  beforeEach(() => {
    emulatorAppSpy = jest.spyOn(emulatorApplication as any, 'onInvertedColorSchemeChanged');
    const decorator = CommandServiceInstance();
    const descriptor = decorator({ descriptor: {} }, 'none') as any;
    commandService = descriptor.descriptor.get();
    mockShouldUseInvertedColorScheme = true;
  });

  afterEach(() => {
    emulatorAppSpy.mockClear();
  });

  it('should call `onInvertedColorSchemeChanged` when `updated` event is triggered', () => {
    const onSpy = jest.spyOn(nativeTheme, 'on');

    (emulatorApplication as any).initializeSystemPreferencesListeners();

    expect(onSpy).toHaveBeenCalledWith('updated', expect.any(Function));

    onSpy.mockClear();
  });

  it('should call command to invert colors `onInvertedColorSchemeChanged`', () => {
    const commandServiceSpy = jest.spyOn(commandService, 'remoteCall');

    (emulatorApplication as any).onInvertedColorSchemeChanged();

    expect(commandServiceSpy).toHaveBeenCalledTimes(1);
    expect(commandServiceSpy).toHaveBeenCalledWith(
      SharedConstants.Commands.UI.SwitchTheme,
      'high-contrast',
      path.join('.', 'themes', 'high-contrast.css'),
      false
    );

    commandServiceSpy.mockClear();
  });

  it('should not change to high contrast when theme is not high contrast', () => {
    const commandServiceSpy = jest.spyOn(commandService, 'remoteCall');

    mockShouldUseInvertedColorScheme = false;

    (emulatorApplication as any).onInvertedColorSchemeChanged();

    expect(commandServiceSpy).toBeCalledTimes(1);

    expect(commandServiceSpy).toHaveBeenCalledWith(
      SharedConstants.Commands.UI.SwitchTheme,
      'Light',
      './themes/light.css',
      false
    );

    commandServiceSpy.mockClear();
  });
});
