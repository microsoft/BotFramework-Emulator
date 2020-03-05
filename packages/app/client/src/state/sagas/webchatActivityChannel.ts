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
import { eventChannel, Channel, buffers } from 'redux-saga';
import { Activity } from 'botframework-schema';

import { ConversationQueue } from '../../utils/restartConversationQueue';

export interface WebChatActivityChannel {
  sendWebChatEvents: (args: ChannelPayload) => void;
  getWebChatChannelSubscriber: () => Channel<ChannelPayload>;
}

export interface WebChatEventPayload {
  type: string;
  payload: {
    activity: Activity;
  };
}

export interface ReplayActivitySnifferProps {
  conversationQueue: ConversationQueue;
}

export interface ChannelPayload {
  documentId: string;
  action: WebChatEventPayload;
  dispatch: () => void;
  meta: ReplayActivitySnifferProps;
}

export function createWebChatActivityChannel(): WebChatActivityChannel {
  let emitterBoundWcStore: (args: ChannelPayload) => void;
  let unsubscribeToEvents = false;

  function webChatStoreEvents(args: ChannelPayload) {
    if (!unsubscribeToEvents) {
      this.emitter(args);
    }
  }

  const getWebChatChannelSubscriber = (): Channel<ChannelPayload> => {
    return eventChannel(emitter => {
      const self = {
        emitter,
      };
      emitterBoundWcStore = webChatStoreEvents.bind(self);
      return () => {
        unsubscribeToEvents = true;
      };
    }, buffers.expanding(20));
  };

  const sendWebChatEvents = async (args: ChannelPayload) => {
    if (emitterBoundWcStore) {
      emitterBoundWcStore.call(null, { ...args });
    }
  };

  return {
    getWebChatChannelSubscriber,
    sendWebChatEvents,
  };
}
