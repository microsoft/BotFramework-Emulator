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

import { windowStateDefault, WindowStateSettings } from '../../types';
import {
  REMEMBER_BOUNDS,
  REMEMBER_THEME,
  REMEMBER_ZOOM_LEVEL,
  RememberBoundsPayload,
  RememberThemePayload,
  RememberZoomLevelPayload,
  SetAvailableThemesPayload,
  WindowStateAction,
  WindowStatePayload,
  SET_AVAILABLE_THEMES,
} from '../actions/windowStateActions';

export function windowState(
  state: WindowStateSettings = windowStateDefault,
  action: WindowStateAction<WindowStatePayload>
) {
  switch (action.type) {
    case REMEMBER_BOUNDS: {
      const bounds = action.payload as RememberBoundsPayload;
      return {
        ...state,
        displayId: bounds.displayId,
        top: bounds.top,
        left: bounds.left,
        width: bounds.width,
        height: bounds.height,
      };
    }

    case REMEMBER_ZOOM_LEVEL: {
      const { zoomLevel } = action.payload as RememberZoomLevelPayload;
      return { ...state, zoomLevel };
    }

    case REMEMBER_THEME: {
      const { theme } = action.payload as RememberThemePayload;
      return { ...state, theme };
    }

    case SET_AVAILABLE_THEMES: {
      const { availableThemes } = action.payload as SetAvailableThemesPayload;
      return { ...state, availableThemes };
    }

    default:
      return state;
  }
}
