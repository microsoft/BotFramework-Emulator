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

import { INTERNAL_SERVER_ERROR, OK } from 'http-status-codes';

import { createTrackActivityHandler } from './trackActivity';

describe('trackActivity handler', () => {
  const mockConversation = {
    prepActivityToBeSentToBot: jest.fn().mockResolvedValue(null),
    prepActivityToBeSentToUser: jest.fn(),
    user: {
      id: 'user1',
    },
  };
  const mockState: any = {
    conversations: {
      conversationById: jest.fn().mockReturnValue(mockConversation),
    },
  };
  const trackActivity = createTrackActivityHandler(mockState);

  beforeEach(() => {
    mockConversation.prepActivityToBeSentToBot.mockClear();
    mockConversation.prepActivityToBeSentToUser.mockClear();
  });

  it('should track an activity sent to the user and return a 200', async () => {
    const req: any = {
      body: {
        from: {
          role: 'bot',
        },
      },
      params: {
        conversationId: 'convo1',
      },
    };
    const res: any = {
      end: jest.fn(),
      send: jest.fn(),
    };
    await trackActivity(req, res);

    expect(mockState.conversations.conversationById).toHaveBeenCalledWith(req.params.conversationId);
    expect(mockConversation.prepActivityToBeSentToUser).toHaveBeenCalledWith(mockConversation.user.id, req.body);

    expect(res.send).toHaveBeenCalledWith(OK);
    expect(res.end).toHaveBeenCalled();
  });

  it('should track an activity sent to the bot and return a 200', async () => {
    const req: any = {
      body: {
        from: {
          role: 'user',
        },
      },
      params: {
        conversationId: 'convo1',
      },
    };
    const res: any = {
      end: jest.fn(),
      send: jest.fn(),
    };
    await trackActivity(req, res);

    expect(mockState.conversations.conversationById).toHaveBeenCalledWith(req.params.conversationId);
    expect(mockConversation.prepActivityToBeSentToBot).toHaveBeenCalledWith(req.body, true);

    expect(res.send).toHaveBeenCalledWith(OK);
    expect(res.end).toHaveBeenCalled();
  });

  it('should return a 500 if something goes wrong', async () => {
    const mockState: any = {
      conversations: {
        conversationById: jest.fn(() => {
          throw new Error('Could not find conversation.');
        }),
      },
    };
    const req: any = {
      params: {
        conversationId: 'convo1',
      },
    };
    const res: any = {
      end: jest.fn(),
      send: jest.fn(),
    };
    await createTrackActivityHandler(mockState)(req, res);

    expect(res.send).toHaveBeenCalledWith(INTERNAL_SERVER_ERROR, new Error('Could not find conversation.'));
    expect(res.end).toHaveBeenCalled();
  });
});
