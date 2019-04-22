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

import Attachments from '../../facility/attachments';

import getAttachment from './getAttachment';
import getAttachmentInfo from './getAttachmentInfo';

describe('The getAttachment middleware', () => {
  let facilities;
  let attachments;
  let attachmentId;
  beforeEach(() => {
    attachments = new Attachments();
    attachmentId = attachments.uploadAttachment({
      name: 'an attachment',
      originalBase64: new Uint8Array(Buffer.from('aGk=')),
      type: 'application/text',
      thumbnailBase64: new Uint8Array(Buffer.from('aGk=')),
    });
    facilities = {
      attachments,
    };
  });

  it('should get the specified attachment', () => {
    const getAttachmentMiddleware = getAttachment({ facilities } as any);

    const req = {
      params: {
        viewId: 'thumbnail',
        attachmentId,
      },
    };

    const res = {
      send: () => null,
      end: () => void 0,
      contentType: '',
    };

    const sendSpy = jest.spyOn(res, 'send');

    getAttachmentMiddleware(
      req as any,
      res as any,
      function() {
        return null;
      } as any
    );

    expect(sendSpy).toHaveBeenCalledWith(HttpStatus.OK, Buffer.from('aGk=', 'base64'));
    expect(res.contentType).toBe('application/text');
  });

  it('should send an error response when the "originalBase64" and "thumbnailBase64" are falsy', () => {
    const getAttachmentMiddleware = getAttachment({ facilities } as any);
    (attachments as any).attachments[attachmentId].originalBase64 = undefined;
    (attachments as any).attachments[attachmentId].thumbnailBase64 = undefined;
    const req = {
      params: {
        viewId: 'thumbnail',
        attachmentId,
      },
    };

    const res = {
      send: () => null,
      end: () => null,
      contentType: '',
    };

    const sendSpy = jest.spyOn(res, 'send');

    getAttachmentMiddleware(
      req as any,
      res as any,
      function() {
        return null;
      } as any
    );

    expect(sendSpy).toHaveBeenCalledWith(HttpStatus.NOT_FOUND, {
      error: {
        code: 'BadArgument',
        message: 'There is no thumbnail view',
      },
    });
    expect(res.contentType).toBe('');
  });
});

describe('the getAttachmentInfo middleware', () => {
  let facilities;
  let attachments;
  let attachmentId;
  beforeEach(() => {
    attachments = new Attachments();
    attachmentId = attachments.uploadAttachment({
      name: 'an attachment',
      originalBase64: new Uint8Array(Buffer.from('aGk=')),
      type: 'application/text',
      thumbnailBase64: new Uint8Array(Buffer.from('aGk=')),
    });
    facilities = {
      attachments,
    };
  });

  it('should get the attachment info when a valid request is made', () => {
    const getAttachmentInfoMiddleware = getAttachmentInfo({
      facilities,
    } as any);
    const req = {
      params: {
        viewId: 'thumbnail',
        attachmentId,
      },
    };

    const res = {
      send: () => null,
      end: () => null,
      contentType: '',
    };
    const sendSpy = jest.spyOn(res, 'send');

    getAttachmentInfoMiddleware(
      req as any,
      res as any,
      function() {
        return null;
      } as any
    );

    expect(sendSpy).toHaveBeenCalledWith(HttpStatus.OK, {
      name: 'an attachment',
      type: 'application/text',
      views: [{ size: 2, viewId: 'original' }, { size: 2, viewId: 'thumbnail' }],
    });
  });

  it('should send an error response when the attachment is not found', () => {
    const getAttachmentInfoMiddleware = getAttachmentInfo({
      facilities,
    } as any);
    const req = {
      params: {
        viewId: 'thumbnail',
        attachmentId: 'not there',
      },
    };

    const res = {
      send: () => null,
      end: () => null,
      contentType: '',
    };
    const sendSpy = jest.spyOn(res, 'send');

    getAttachmentInfoMiddleware(
      req as any,
      res as any,
      function() {
        return null;
      } as any
    );

    expect(sendSpy).toHaveBeenCalledWith(HttpStatus.NOT_FOUND, {
      error: {
        code: 'BadArgument',
        message: 'attachment[not there] not found',
      },
    });
  });
});
