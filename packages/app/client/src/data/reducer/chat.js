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

import * as ChatActions from '../action/chatActions';

const DEFAULT_STATE = {
  log: {
    entries: [
      {
        type: 'info',
        source: 'app',
        text: 'Welcome to the Bot Framework Emulator.'
      },
    ]
  },
  liveChatChangeKey: 0,
  liveChats: {}
}

export default function chat(state = DEFAULT_STATE, action) {
  const { payload } = action;

  switch (action.type) {
    case ChatActions.NEW_LIVECHAT_DOCUMENT: {
      state = {
        ...state,
        liveChatChangeKey: state.liveChatChangeKey + 1,
        liveChats: {
          ...state.liveChats, [payload.conversationId]: { ...payload }
        }
      }
    }
      break;


    case ChatActions.CLOSE_LIVECHAT_DOCUMENT: {
      const copy = { ...state };
      copy.liveChatChangeKey += 1;
      delete copy.liveChats[payload.conversationId];
      state = { ...copy };
    }
      break;

    default: break;
  }

  return state;
}
