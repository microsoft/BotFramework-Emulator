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

import { loadSettings } from './loadSettings';

const mockSettings = {
  framework: {
    stateSizeLimit: 64,
    use10Tokens: false,
    useCodeValidation: false,
    localhost: 'localhost',
    locale: '',
  },
  bots: [
    {
      botId: '1f5aeed9-a6d7-4757-b8c2-408c18c3e40c',
      botUrl: 'http://localhost:3978/api/messages',
      msaAppId: '',
      msaPassword: '',
      locale: '',
    },
  ],
  windowState: {
    zoomLevel: 0,
    width: 1400,
    height: 920,
    left: 324,
    top: 116,
    theme: 'Light',
    availableThemes: [
      {
        name: 'Dark',
        href: './themes/dark.css',
      },
      {
        name: 'High-contrast',
        href: './themes/high-contrast.css',
      },
      {
        name: 'Light',
        href: './themes/light.css',
      },
    ],
    displayId: 2779098405,
  },
  users: {},
  azure: {},
};

const mockLoadedSettings = {
  framework: mockSettings.framework,
  users: {},
};
const mockIsFile = jest.fn();
jest.mock('fs-extra', () => ({
  statSync: () => ({ isFile: () => mockIsFile() }),
  readFileSync: () => JSON.stringify(mockLoadedSettings),
  writeFileSync: () => true,
}));

jest.mock('./ensureStoragePath', () => ({
  ensureStoragePath: () => 'filePath/',
}));

describe('the loadSettings utility', () => {
  it('should return the loaded settings with the user property removed', () => {
    mockIsFile.mockReturnValueOnce(true);
    const settings = loadSettings('appData/server.json', {});

    expect(settings).toEqual({
      ...mockLoadedSettings,
      users: undefined,
    });
  });

  it('should return the default settings when the requested settings file does not exist', () => {
    mockIsFile.mockReturnValueOnce(false);
    const settings = loadSettings('appData/server.json', mockSettings);

    expect(settings).toEqual(mockSettings);
  });

  it('should return the default settings when there is an error trying to load the settings', () => {
    mockIsFile.mockImplementationOnce(() => {
      throw new Error('Invalid file path.');
    });
    const settings = loadSettings('appData/server.json', mockSettings);

    expect(settings).toEqual(mockSettings);
  });
});
