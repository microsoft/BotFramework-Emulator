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

import { ADD_SAVED_BOT_URL, SavedBotUrlsAction, SavedBotUrlsActionPayload } from '../actions/savedBotUrlsActions';

interface BotUrl {
  url: string;
  lastAccessed: string;
}

export function savedBotUrls(state: BotUrl[] = [], action: SavedBotUrlsAction<SavedBotUrlsActionPayload>): BotUrl[] {
  switch (action.type) {
    case ADD_SAVED_BOT_URL: {
      const foundAtIndex = state.findIndex(element => element.url === action.payload);
      if (foundAtIndex === -1) {
        state.push({ url: action.payload, lastAccessed: new Date().toUTCString() });
      } else {
        state[foundAtIndex].lastAccessed = new Date().toUTCString();
      }

      if (state.length > 1) {
        state.sort((prev, curr) => {
          // Comparing string will not work so we use dates
          // e.g. "Mon, 06 May 2019 21:18:08 GMT" > "Fri, 10 May 2019 14:59:38 GMT" // returns true when it should be false
          return new Date(curr.lastAccessed) > new Date(prev.lastAccessed) ? 1 : -1;
        });
      }

      break;
    }
    default:
      break;
  }
  return state;
}
