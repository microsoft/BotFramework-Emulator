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

import { DebugMode } from '@bfemulator/app-shared';

import * as windowStateActions from './windowStateActions';

describe('Window state actions', () => {
  test('rememberTheme action', () => {
    expect(windowStateActions.rememberTheme('light')).toEqual({
      type: windowStateActions.REMEMBER_THEME,
      payload: {
        theme: 'light',
      },
    });
  });

  test('rememberBounds action', () => {
    const boundsState = {
      displayId: 123,
      top: 0,
      left: 0,
      width: 300,
      height: 300,
    };
    expect(windowStateActions.rememberBounds(boundsState)).toEqual({
      type: windowStateActions.REMEMBER_BOUNDS,
      state: boundsState,
    });
  });

  test('rememberZoomLevel action', () => {
    const zoomState = { zoomLevel: 200 };
    expect(windowStateActions.rememberZoomLevel(zoomState)).toEqual({
      type: windowStateActions.REMEMBER_ZOOM_LEVEL,
      state: zoomState,
    });
  });

  test('debugModeChanged action', () => {
    expect(windowStateActions.debugModeChanged(DebugMode.Normal)).toEqual({
      type: windowStateActions.DEBUG_MODE_CHANGED,
      payload: {
        debugMode: DebugMode.Normal,
      },
    });
  });
});
