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

import { Attachments } from './attachments';

jest.mock('../utils/uniqueId', () => ({
  uniqueId: jest.fn(() => '1234'),
}));
jest.mock('../utils/createResponse/createAPIException', () => ({
  createAPIException: jest.fn(() => 'I am an error!'),
}));

describe('Attachments', () => {
  const attachments = new Attachments();

  it('should upload and get attachments', () => {
    const attachmentData: any = {
      type: 'someType',
      originalBase64: [0x00],
      data: 123,
    };
    const attachmentId = attachments.uploadAttachment(attachmentData);
    expect(attachmentId).toBe('1234');

    const retrievedAttachment = attachments.getAttachmentData(attachmentId);
    expect(retrievedAttachment).toEqual({ ...attachmentData, id: attachmentId });
  });

  it('should throw when no attachment type is supplied', () => {
    const attachmentData: any = {
      data: 123,
    };
    expect(() => attachments.uploadAttachment(attachmentData)).toThrow('I am an error!');
  });

  it('should throw when no originalBase64 byte array is supplied', () => {
    const attachmentData: any = {
      data: 123,
      type: 'someType',
    };
    expect(() => attachments.uploadAttachment(attachmentData)).toThrow('I am an error!');
  });
});
