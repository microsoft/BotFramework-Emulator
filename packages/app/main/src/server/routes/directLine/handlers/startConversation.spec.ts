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

import * as HttpStatus from 'http-status-codes';

import { createStartConversationHandler } from './startConversation';

describe('startConversation handler', () => {
  it('should send a 201 with info about the created conversation if the conversation does not exist', async () => {
    const mockCreatedConversation = {
      conversationId: 'convo1',
      sendConversationUpdate: jest.fn().mockResolvedValueOnce(undefined),
    };
    const emulatorServer: any = {
      state: {
        conversations: {
          conversationById: jest.fn(() => undefined),
          newConversation: jest.fn(() => mockCreatedConversation),
        },
      },
    };
    const req: any = {
      botEndpoint: {
        id: 'endpoint1',
      },
      header: jest.fn(() => ''),
    };
    const res: any = {
      end: jest.fn(),
      json: jest.fn(),
    };
    const startConversation = createStartConversationHandler(emulatorServer);
    await startConversation(req, res);

    expect(mockCreatedConversation.sendConversationUpdate).toHaveBeenCalledWith(
      [
        { id: expect.any(String), name: 'User' },
        { id: req.botEndpoint.botId, name: 'Bot' },
      ],
      undefined
    );
    expect(res.json).toHaveBeenCalledWith(HttpStatus.CREATED, {
      conversationId: mockCreatedConversation.conversationId,
      token: req.botEndpoint.id,
      expires_in: expect.any(Number),
      streamUrl: '',
    });
    expect(res.end).toHaveBeenCalled();
  });

  it('should send a 200 with info about the conversation if it already exists, and should add members to the conversation', async () => {
    const mockCreatedConversation = {
      addMember: jest.fn(),
      conversationId: 'convo1',
      members: {
        findIndex: jest.fn(() => -1), // simulate not finding the bot or user in the current conversation
      },
      sendConversationUpdate: jest.fn().mockResolvedValueOnce(undefined),
      user: { id: 'user1', name: 'User' },
    };
    const emulatorServer: any = {
      state: {
        conversations: {
          conversationById: jest.fn(() => mockCreatedConversation),
        },
      },
    };
    const req: any = {
      botEndpoint: {
        id: 'endpoint1',
      },
      header: jest.fn(() => ''),
    };
    const res: any = {
      end: jest.fn(),
      json: jest.fn(),
    };
    const startConversation = createStartConversationHandler(emulatorServer);
    await startConversation(req, res);

    expect(mockCreatedConversation.addMember).toHaveBeenCalledTimes(2); // once for user, and once for bot
    expect(res.json).toHaveBeenCalledWith(HttpStatus.OK, {
      conversationId: mockCreatedConversation.conversationId,
      token: req.botEndpoint.id,
      expires_in: expect.any(Number),
      streamUrl: '',
    });
    expect(res.end).toHaveBeenCalled();
  });

  it('should send a 200 with info about the conversation if it already exists, and should send the conversation updates', async () => {
    const mockCreatedConversation = {
      addMember: jest.fn(),
      conversationId: 'convo1',
      members: {
        findIndex: jest.fn(() => 0), // simulate finding the bot and user in the current conversation
      },
      sendConversationUpdate: jest.fn().mockResolvedValueOnce(undefined),
      user: { id: 'user1', name: 'User' },
    };
    const emulatorServer: any = {
      state: {
        conversations: {
          conversationById: jest.fn(() => mockCreatedConversation),
        },
      },
    };
    const req: any = {
      botEndpoint: {
        id: 'endpoint1',
      },
      header: jest.fn(() => ''),
    };
    const res: any = {
      end: jest.fn(),
      json: jest.fn(),
    };
    const startConversation = createStartConversationHandler(emulatorServer);
    await startConversation(req, res);

    expect(mockCreatedConversation.addMember).not.toHaveBeenCalled();
    expect(mockCreatedConversation.sendConversationUpdate).toHaveBeenCalledWith(
      [mockCreatedConversation.user, { id: req.botEndpoint.botId, name: 'Bot' }],
      undefined
    );
    expect(res.json).toHaveBeenCalledWith(HttpStatus.OK, {
      conversationId: mockCreatedConversation.conversationId,
      token: req.botEndpoint.id,
      expires_in: expect.any(Number),
      streamUrl: '',
    });
    expect(res.end).toHaveBeenCalled();
  });
});
