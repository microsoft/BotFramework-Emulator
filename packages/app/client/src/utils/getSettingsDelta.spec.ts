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

import { FrameworkSettings } from '@bfemulator/app-shared';

import { getSettingsDelta } from './getSettingsDelta';

describe('getSettingsDelta', () => {
  it('should return an object containing the delta between 2 settings objects', () => {
    const currentSettings: Partial<FrameworkSettings> = {
      autoUpdate: true,
      locale: 'en-us',
      use10Tokens: true,
      usePrereleases: true,
      userGUID: 'some-id',
    };
    const updatedSettings: Partial<FrameworkSettings> = {
      autoUpdate: true,
      use10Tokens: false,
      usePrereleases: false,
      userGUID: 'some-other-id',
    };

    expect(getSettingsDelta(currentSettings, updatedSettings)).toEqual({
      locale: undefined,
      use10Tokens: false,
      usePrereleases: false,
      userGUID: 'some-other-id',
    });
  });

  it('should return undefined for settings objects that do not contain a delta', () => {
    const currentSettings: Partial<FrameworkSettings> = {
      autoUpdate: true,
      use10Tokens: true,
      usePrereleases: true,
      userGUID: 'some-id',
    };
    const updatedSettings = currentSettings;

    expect(getSettingsDelta(currentSettings, updatedSettings)).toBe(undefined);
  });
});
