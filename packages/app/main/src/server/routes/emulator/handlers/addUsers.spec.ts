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

import { addUsers } from './addUsers';

const mockSendErrorResponse = jest.fn();
jest.mock('../../../utils/sendErrorResponse', () => ({
  sendErrorResponse: (...args) => mockSendErrorResponse(...args),
}));

describe('addUsers handler', () => {
  beforeEach(() => {
    mockSendErrorResponse.mockClear();
  });

  it('should send a 200 after adding the users to the conversation', async () => {
    const req: any = {
      body: JSON.stringify([
        { id: 'user1', name: 'User 1' },
        { id: 'user2', name: 'User 2' },
      ]),
      conversation: {
        addMember: jest.fn(),
      },
    };
    const res: any = {
      end: jest.fn(),
      send: jest.fn(),
    };
    await addUsers(req, res);

    expect(req.conversation.addMember).toHaveBeenCalledTimes(2);
    expect(res.send).toHaveBeenCalledWith(HttpStatus.OK);
    expect(res.end).toHaveBeenCalled();
  });

  it('should send an error response if something goes wrong', async () => {
    const req: any = {
      body: JSON.stringify([
        { id: 'user1', name: 'User 1' },
        { id: 'user2', name: 'User 2' },
      ]),
      conversation: {
        addMember: jest.fn(() => {
          throw new Error('Failed to add member.');
        }),
      },
    };
    const res: any = {};
    await addUsers(req, res);

    expect(mockSendErrorResponse).toHaveBeenCalledWith(req, res, null, new Error('Failed to add member.'));
  });
});
