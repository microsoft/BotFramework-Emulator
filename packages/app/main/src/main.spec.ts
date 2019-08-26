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

import { emulatorApplication } from './main';

jest.mock('electron', () => ({
  app: {
    on: () => void 0,
    setName: () => void 0,
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
  },
}));

describe('main', () => {
  let commandService: CommandServiceImpl;
  let emulatorAppSpy;
  let electron;

  beforeEach(() => {
    emulatorAppSpy = jest.spyOn(emulatorApplication as any, 'onInvertedColorSchemeChanged');
    electron = require('electron');
    const decorator = CommandServiceInstance();
    const descriptor = decorator({ descriptor: {} }, 'none') as any;
    commandService = descriptor.descriptor.get();
  });

  afterEach(() => {
    emulatorAppSpy.mockClear();
  });

  it('should call `onInvertedColorSchemeChanged` when `inverted-color-scheme-changed` event is triggered', () => {
    const commandServiceSpy = jest.spyOn(commandService, 'remoteCall');

    const { systemPreferences } = require('electron');

    const onSpy = jest.spyOn(systemPreferences, 'on');
    (emulatorApplication as any).initializeSystemPreferencesListeners();

    expect(onSpy).toHaveBeenCalledWith('inverted-color-scheme-changed', jasmine.any(Function));

    onSpy.mockClear();
  });

  it('should invert colors on color scheme changed', () => {
    const commandServiceSpy = jest.spyOn(commandService, 'remoteCall');

    (emulatorApplication as any).onInvertedColorSchemeChanged();

    expect(commandServiceSpy).toHaveBeenCalledTimes(1);
    expect(commandServiceSpy).toHaveBeenCalledWith(
      SharedConstants.Commands.UI.SwitchTheme,
      'high-contrast',
      path.join('.', 'themes', 'high-contrast.css')
    );

    commandServiceSpy.mockClear();
  });

  it('false test case', () => {
    const commandServiceSpy = jest.spyOn(commandService, 'remoteCall');

    const { systemPreferences } = require('electron');
    const mockBlah = systemPreferences.isInvertedColorScheme as jest.Mock;
    mockBlah.mockImplementationOnce(() => false);

    expect(commandServiceSpy).not.toBeCalled();
  });
});
