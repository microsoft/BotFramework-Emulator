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
import { Activity } from 'botframework-schema';

import { createWebChatActivityChannel, WebChatActivityChannel, ChannelPayload } from './webChatActivityChannel';

describe('Webchat activity channel', () => {
  let activityChannel: WebChatActivityChannel;
  let emitterSubscriber;
  beforeEach(() => {
    activityChannel = createWebChatActivityChannel();
    emitterSubscriber = activityChannel.getWebChatChannelSubscriber();
  });

  it('Receive events through emitter when sent to webchat channel exactly the same without mutation.', async () => {
    const payloads: ChannelPayload[] = [];
    const promiseResolvers = [];
    const numOfEventsToSend = 150;
    for (let i = 0; i < numOfEventsToSend; i++) {
      promiseResolvers.push(new Promise(resolve => emitterSubscriber.take(resolve)));
      const channelPayload: ChannelPayload = {
        documentId: 'some-id' + i,
        action: {
          type: 'incoming-activity',
          payload: {
            activity: {
              id: 'activity-1',
              replyToId: 'original' + i,
            } as Activity,
          },
        },
        meta: undefined,
        dispatch: jest.fn(),
      };
      payloads.push(channelPayload);
    }

    for (let i = 0; i < numOfEventsToSend; i++) {
      activityChannel.sendWebChatEvents(payloads[i]);
    }

    const receivedEvents: ChannelPayload[] = await Promise.all(promiseResolvers);
    expect(receivedEvents).toEqual(payloads);
  });

  it('Should not receive events after closing the channel.', async () => {
    const channelPayload: ChannelPayload = {
      documentId: 'some-id',
      action: {
        type: 'incoming-activity',
        payload: {
          activity: {
            id: 'activity-1',
            replyToId: 'original',
          } as Activity,
        },
      },
      meta: undefined,
      dispatch: jest.fn(),
    };
    emitterSubscriber.close();
    const eventsReceived = new Promise(resolve => emitterSubscriber.take(resolve));

    const unresolved = await eventsReceived;
    activityChannel.sendWebChatEvents(channelPayload);
    expect(unresolved).not.toEqual(channelPayload);
  });
});
