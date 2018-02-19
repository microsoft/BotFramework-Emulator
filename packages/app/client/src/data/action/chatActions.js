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

import { uniqueId } from 'botframework-emulator-shared/built/utils';
import { createStore as createWebChatStore } from "custom-botframework-webchat";

export const NEW_LIVECHAT_DOCUMENT = 'CHAT/DOCUMENT/NEW/LIVE';
export const OPEN_LIVECHAT_DOCUMENT = 'CHAT/DOCUMENT/OPEN/LIVE';
export const CLOSE_LIVECHAT_DOCUMENT = 'CHAT/DOCUMENT/CLOSE/LIVE';

export const APPEND_TO_LOG = 'CHAT/LOG/APPEND';
export const CLEAR_LOG = 'CHAT/LOG/CLEAR';

export const OPEN_TRANSCRIPT_DOCUMENT = 'CHAT/DOCUMENT/OPEN/TRANSCRIPT';
export const CLOSE_TRANSCRIPT_DOCUMENT = 'CHAT/DOCUMENT/CLOSE/TRANSCRIPT';

export function newLiveChatDocument(conversationId, executive) {
  return {
    type: NEW_LIVECHAT_DOCUMENT,
    payload: {
      conversationId,
      webChatStore: createWebChatStore(),
      directLine: null,
      executive,
      log: {
        entries: []
      }
    }
  }
}

export function closeLiveChatDocument(conversationId) {
  return {
    type: CLOSE_LIVECHAT_DOCUMENT,
    payload: {
      conversationId,
    }
  }
}

export function appendToLog(conversationId, entry) {
  return {
    type: APPEND_TO_LOG,
    payload: {
      conversationId,
      entry
    }
  }
}

export function clearLog(conversationId) {
  return {
    type: CLEAR_LOG,
    payload: {
      conversationId,
    }
  }
}
