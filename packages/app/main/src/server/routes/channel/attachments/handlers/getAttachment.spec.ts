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
import { ErrorCodes } from '@bfemulator/app-shared';

import { createAPIException } from '../../../../utils/createResponse/createAPIException';

import { createGetAttachmentHandler } from './getAttachment';

const mockSendErrorResponse = jest.fn();
jest.mock('../../../../utils/sendErrorResponse', () => ({
  sendErrorResponse: (...args) => mockSendErrorResponse(...args),
}));

describe('getAttachment handler', () => {
  let state;

  beforeEach(() => {
    state = {};
    mockSendErrorResponse.mockClear();
  });

  it('should return the attachment content uploaded via Web Chat', () => {
    const mockAttachmentData = new Uint8Array(Buffer.from('aGk='));
    state.attachments = {
      getAttachmentData: jest.fn(() => ({
        originalBase64: mockAttachmentData,
        type: 'text/plain',
      })),
    };
    const getAttachmentHandler = createGetAttachmentHandler(state);
    const req: any = {
      params: { viewId: 'original' },
    };
    const res: any = {
      end: jest.fn(),
      send: jest.fn(),
    };
    const next = jest.fn();
    getAttachmentHandler(req, res, next);

    expect(res.contentType).toBe('text/plain');
    expect(res.send).toHaveBeenCalledWith(HttpStatus.OK, Buffer.from(mockAttachmentData));
    expect(next).toHaveBeenCalled();
  });

  it('should return the attachment content uploaded via the bot', () => {
    const mockAttachmentData = Buffer.from('some data', 'base64').toString();
    state.attachments = {
      getAttachmentData: jest.fn(() => ({
        originalBase64: mockAttachmentData,
        type: 'text/plain',
      })),
    };
    const getAttachmentHandler = createGetAttachmentHandler(state);
    const req: any = {
      params: { viewId: 'original' },
    };
    const res: any = {
      end: jest.fn(),
      send: jest.fn(),
    };
    const next = jest.fn();
    getAttachmentHandler(req, res, next);

    expect(res.contentType).toBe('text/plain');
    expect(res.send).toHaveBeenCalledWith(HttpStatus.OK, Buffer.from(mockAttachmentData.toString(), 'base64'));
    expect(next).toHaveBeenCalled();
  });

  it('should send an error message if the original view is requested, but missing', () => {
    state.attachments = {
      getAttachmentData: jest.fn(() => ({ originalBase64: undefined })),
    };
    const getAttachmentHandler = createGetAttachmentHandler(state);
    const req: any = {
      params: { viewId: 'original' },
    };
    const res: any = {
      end: jest.fn(),
      send: jest.fn(),
    };
    const next = jest.fn();
    getAttachmentHandler(req, res, next);

    expect(mockSendErrorResponse).toHaveBeenCalledWith(
      req,
      res,
      next,
      createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, 'There is no original view')
    );
    expect(next).toHaveBeenCalled();
  });

  it('should send an error message if the thumbnail view is requested, but missing', () => {
    state.attachments = {
      getAttachmentData: jest.fn(() => ({ thumbnailBase64: undefined })),
    };
    const getAttachmentHandler = createGetAttachmentHandler(state);
    const req: any = {
      params: { viewId: 'thumbnail' },
    };
    const res: any = {
      end: jest.fn(),
      send: jest.fn(),
    };
    const next = jest.fn();
    getAttachmentHandler(req, res, next);

    expect(mockSendErrorResponse).toHaveBeenCalledWith(
      req,
      res,
      next,
      createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, 'There is no thumbnail view')
    );
    expect(next).toHaveBeenCalled();
  });

  it('should send an error message the attachment can not be found', () => {
    state.attachments = {
      getAttachmentData: jest.fn(() => undefined),
    };
    const getAttachmentHandler = createGetAttachmentHandler(state);
    const req: any = {
      params: { attachmentId: 'attach1' },
    };
    const res: any = {
      end: jest.fn(),
      send: jest.fn(),
    };
    const next = jest.fn();
    getAttachmentHandler(req, res, next);

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

  it('should send an error message if an error is thrown', () => {
    state.attachments = {
      getAttachmentData: jest.fn(() => {
        throw new Error('Something went wrong.');
      }),
    };
    const getAttachmentHandler = createGetAttachmentHandler(state);
    const req: any = {
      params: {},
    };
    const res: any = {
      end: jest.fn(),
      send: jest.fn(),
    };
    const next = jest.fn();
    getAttachmentHandler(req, res, next);

    expect(mockSendErrorResponse).toHaveBeenCalledWith(
      req,
      res,
      next,
      createAPIException(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCodes.ServiceError, 'Something went wrong.')
    );
    expect(next).toHaveBeenCalled();
  });
});
