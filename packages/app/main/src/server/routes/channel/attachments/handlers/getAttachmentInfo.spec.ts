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

import { ErrorCodes } from '@bfemulator/sdk-shared';
import * as HttpStatus from 'http-status-codes';

import { createAPIException } from '../../../../utils/createResponse/createAPIException';

import { createGetAttachmentInfoHandler } from './getAttachmentInfo';

const mockSendErrorResponse = jest.fn();
jest.mock('../../../../utils/sendErrorResponse', () => ({
  sendErrorResponse: (...args) => mockSendErrorResponse(...args),
}));

describe('getAttachmentInfo handler', () => {
  let state;

  beforeEach(() => {
    state = {};
  });

  it('should return info about the attachment', () => {
    const mockAttachment = {
      name: 'my-attachment',
      type: 'image/png',
      originalBase64: new Uint8Array(Buffer.from('aGk=')),
      thumbnailBase64: new Uint8Array(Buffer.from('data')),
    };
    state.attachments = {
      getAttachmentData: jest.fn(() => mockAttachment),
    };
    const req: any = {
      params: { attachmentId: 'attach1' },
    };
    const res: any = {
      end: jest.fn(),
      send: jest.fn(),
    };
    const next = jest.fn();
    const getAttachmentInfo = createGetAttachmentInfoHandler(state);
    getAttachmentInfo(req, res, next);

    expect(res.send).toHaveBeenCalledWith(HttpStatus.OK, {
      name: mockAttachment.name,
      type: mockAttachment.type,
      views: [
        {
          viewId: 'original',
          size: Buffer.from(Buffer.from(mockAttachment.originalBase64.buffer as ArrayBuffer).toString(), 'base64')
            .length,
        },
        {
          viewId: 'thumbnail',
          size: Buffer.from(Buffer.from(mockAttachment.thumbnailBase64.buffer as ArrayBuffer).toString(), 'base64')
            .length,
        },
      ],
    });
    expect(next).toHaveBeenCalled();
  });

  it('should send an error message if the attachment is not found', () => {
    state.attachments = {
      getAttachmentData: jest.fn(undefined),
    };
    const req: any = {
      params: { attachmentId: 'attach1' },
    };
    const res: any = {
      end: jest.fn(),
      send: jest.fn(),
    };
    const next = jest.fn();
    const getAttachmentInfo = createGetAttachmentInfoHandler(state);
    getAttachmentInfo(req, res, next);

    expect(mockSendErrorResponse).toHaveBeenCalledWith(
      req,
      res,
      next,
      createAPIException(
        HttpStatus.NOT_FOUND,
        ErrorCodes.BadArgument,
        `attachment[${req.params.attachmentId}] not found`
      )
    );
    expect(next).toHaveBeenCalled();
  });

  it('should send an error message if something goes wrong', () => {
    state.attachments = {
      getAttachmentData: jest.fn(() => {
        throw new Error('Something went wrong.');
      }),
    };
    const req: any = {
      params: {},
    };
    const res: any = {
      end: jest.fn(),
      send: jest.fn(),
    };
    const next = jest.fn();
    const getAttachmentInfo = createGetAttachmentInfoHandler(state);
    getAttachmentInfo(req, res, next);

    expect(mockSendErrorResponse).toHaveBeenCalledWith(
      req,
      res,
      next,
      createAPIException(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCodes.ServiceError, 'Something went wrong.')
    );
    expect(next).toHaveBeenCalled();
  });
});
