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

import { createUploadAttachmentHandler } from './uploadAttachment';

const mockSendErrorResponse = jest.fn();
jest.mock('../../../../utils/sendErrorResponse', () => ({
  sendErrorResponse: (...args) => mockSendErrorResponse(...args),
}));

describe('uploadAttachment handler', () => {
  beforeEach(() => {
    mockSendErrorResponse.mockClear();
  });

  it('should upload the attachment and return a resource response with a 200', () => {
    const state: any = {
      attachments: {
        uploadAttachment: jest.fn(() => 'resourceId'),
      },
    };
    const req: any = {
      body: 'someData',
    };
    const res: any = {
      end: jest.fn(),
      send: jest.fn(),
    };
    const next = jest.fn();
    const uploadAttachment = createUploadAttachmentHandler(state);
    uploadAttachment(req, res, next);

    expect(state.attachments.uploadAttachment).toHaveBeenCalledWith('someData');
    expect(res.send).toHaveBeenCalledWith(HttpStatus.OK, { id: 'resourceId' });
    expect(res.end).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('should send an error response if something goes wrong', () => {
    const state: any = {
      attachments: {
        uploadAttachment: jest.fn(() => {
          throw new Error('Something went wrong.');
        }),
      },
    };
    const req: any = { body: {} };
    const res: any = {};
    const next = jest.fn();
    const uploadAttachment = createUploadAttachmentHandler(state);
    uploadAttachment(req, res, next);

    expect(mockSendErrorResponse).toHaveBeenCalledWith(req, res, next, new Error('Something went wrong.'));
    expect(next).toHaveBeenCalled();
  });
});
