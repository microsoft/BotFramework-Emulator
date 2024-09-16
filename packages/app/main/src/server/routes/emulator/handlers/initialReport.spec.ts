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

import { createInitialReportHandler } from './initialReport';

jest.mock('../../../../emulator', () => ({
  Emulator: {
    getInstance: () => ({}),
  },
}));

describe('the initialReport handler', () => {
  it('should return a 200 when the initial report is sent successfully', () => {
    const req: any = {
      params: {
        conversationId: 'convoId1',
      },
    };
    const res: any = {
      end: jest.fn(),
      send: jest.fn(),
    };
    const next = jest.fn();
    const mockEmulatorServer: any = {
      report: jest.fn(),
    };
    const handler = createInitialReportHandler(mockEmulatorServer);
    handler(req, res, next);

    expect(res.send).toHaveBeenCalledWith(OK);
    expect(res.end).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('should return a 500 and an error when something fails', () => {
    const req: any = {
      params: {},
    };
    const res: any = {
      end: jest.fn(),
      send: jest.fn(),
    };
    const next = jest.fn();
    const mockEmulatorServer: any = {
      report: jest.fn(() => {
        throw new Error('Failed to report.');
      }),
    };
    const handler = createInitialReportHandler(mockEmulatorServer);
    handler(req, res, next);

    expect(res.send).toHaveBeenCalledWith(INTERNAL_SERVER_ERROR, new Error('Failed to report.'));
    expect(next).toHaveBeenCalled();
  });
});
