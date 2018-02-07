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

import { uniqueId } from '../../utils';

export const UPDATE_JSON = 'CARD/UPDATE_JSON';
export const ADD_OUTPUT_MSG = 'CARD/ADD_OUTPUT_MSG';
export const CLEAR_OUTPUT_WINDOW = 'CARD/CLEAR_OUTPUT_WINDOW';
export const CREATE_CARD = 'CARD/CREATE_CARD';

export function updateCardJson(id, json) {
  return {
    type: UPDATE_JSON,
    payload: {
      id,
      json
    }
  };
}

export function addCardOutputMessage(id, msg) {
  return {
    type: ADD_OUTPUT_MSG,
    payload: {
      id,
      msg
    }
  };
}

export function clearCardOutputWindow(id) {
  return {
    type: CLEAR_OUTPUT_WINDOW,
    payload: {
      id
    }
  };
}

export function createCard(card) {
  return {
    type: CREATE_CARD,
    payload: {
      id: uniqueId(),
      card
    }
  };
}
