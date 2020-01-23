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

import { rememberBounds, rememberTheme, rememberZoomLevel, setAvailableThemes } from '../actions/windowStateActions';
import { windowStateDefault } from '../../types/serverSettingsTypes';

import { windowState } from './windowState';

describe('windowState reducer', () => {
  it('should return the unmodified state on unrecognized action', () => {
    expect(windowState(undefined, { type: '' } as any)).toEqual(windowStateDefault);
  });

  it('should handle a remember bounds action', () => {
    const payload = { displayId: 0, top: 0, left: 0, width: 500, height: 500 };
    const action = rememberBounds(payload);
    const state = windowState({} as any, action);

    expect(state).toEqual(payload);
  });

  it('should handle a remember zoom level action', () => {
    const action = rememberZoomLevel({ zoomLevel: 100 });
    const state = windowState({} as any, action);

    expect(state).toEqual({ zoomLevel: 100 });
  });

  it('should handle a remember theme action', () => {
    const action = rememberTheme('light');
    const state = windowState({} as any, action);

    expect(state).toEqual({ theme: 'light' });
  });

  it('should handle a set available themes action', () => {
    const themes = [
      { name: 'light', href: './light.css' },
      { name: 'dark', href: './dark.css' },
    ];
    const action = setAvailableThemes(themes);
    const state = windowState({} as any, action);

    expect(state.availableThemes).toEqual(themes);
  });
});
