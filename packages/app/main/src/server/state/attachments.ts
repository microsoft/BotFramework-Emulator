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
import { AttachmentData } from 'botframework-schema';
import * as HttpStatus from 'http-status-codes';

import { createAPIException } from '../utils/createResponse/createAPIException';
import { uniqueId } from '../utils/uniqueId';

export class Attachments {
  private attachments: { [key: string]: AttachmentData } = {};

  public getAttachmentData(id: string): AttachmentData {
    return this.attachments[id];
  }

  public uploadAttachment(attachmentData: AttachmentData): string {
    if (!attachmentData.type) {
      throw createAPIException(
        HttpStatus.BAD_REQUEST,
        ErrorCodes.MissingProperty,
        'You must specify type property for the attachment'
      );
    }

    if (!attachmentData.originalBase64) {
      throw createAPIException(
        HttpStatus.BAD_REQUEST,
        ErrorCodes.MissingProperty,
        'You must specify originalBase64 byte[] for the attachment'
      );
    }

    const attachment: any = { ...attachmentData, id: uniqueId() };

    this.attachments[attachment.id] = attachment;

    return attachment.id;
  }
}
