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

import Conversation from "./conversation";

jest.mock("../botEmulator", () => ({ BotEmulator: {} }));

describe("Conversation class", () => {
  let botEndpointBotId;
  let botEndpoint;
  let botEmulator: any;
  let conversation: Conversation;
  let conversationId;
  let user: any;

  beforeEach(() => {
    botEndpointBotId = "someBotEndpointBotId";
    botEndpoint = { botId: botEndpointBotId };
    botEmulator = {};
    conversationId = "someConversationId";
    user = { id: "someUserId" };
    conversation = new Conversation(
      botEmulator,
      botEndpoint,
      conversationId,
      user
    );
  });

  it("should feed activities", () => {
    const mockProcessActivity = jest.fn(activity => ({
      ...activity,
      processed: true
    }));
    conversation.processActivity = mockProcessActivity;
    const fedActivities = [];
    const mockAddActivityToQueue = jest.fn(activity => {
      fedActivities.push(activity);
    });
    (conversation as any).addActivityToQueue = mockAddActivityToQueue;

    let activities: any = [
      {
        conversation: {},
        type: "event",
        from: { role: "bot" },
        recipient: { role: "user", id: "userId" }
      },
      {
        conversation: {},
        type: "message",
        from: { role: "user" },
        recipient: { role: "bot", id: "botId" }
      },
      {
        conversation: {},
        type: "messageReaction",
        from: { role: "bot", id: "botId" },
        recipient: { role: "user" }
      },
      {
        conversation: {},
        type: "typing",
        from: { role: "user", id: "userId" },
        recipient: { role: "bot" }
      }
    ];

    conversation.feedActivities(activities);

    expect(fedActivities).toEqual([
      {
        conversation: { id: "someConversationId" },
        type: "event",
        from: { role: "bot" },
        recipient: { role: "user", id: "someUserId" },
        processed: true
      },
      {
        conversation: { id: "someConversationId" },
        type: "message",
        from: { role: "user" },
        recipient: { role: "bot", id: "someBotEndpointBotId" }
      },
      {
        conversation: { id: "someConversationId" },
        type: "messageReaction",
        from: { role: "bot", id: "someBotEndpointBotId" },
        recipient: { role: "user" },
        processed: true
      },
      {
        conversation: { id: "someConversationId" },
        type: "typing",
        from: { role: "user", id: "someUserId" },
        recipient: { role: "bot" }
      }
    ]);
  });
});
