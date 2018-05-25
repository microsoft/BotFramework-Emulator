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
import * as Restify from 'restify';

import BotEmulator from '../../botEmulator';
import createAPIException from '../../utils/createResponse/apiException';
import ErrorCodes from '../../types/errorCodes';
import AttachmentData from '../../types/attachment/data';
import AttachmentParams from '../attachmentParams';
import sendErrorResponse from '../../utils/sendErrorResponse';

export default function getAttachment(bot: BotEmulator) {
  return (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
    try {
      const parms: AttachmentParams = req.params;
      const attachment: AttachmentData = bot.facilities.attachments.getAttachmentData(parms.attachmentId);

      if (attachment) {
        if (parms.viewId === 'original' || parms.viewId === 'thumbnail') {
          const attachmentBase64 = parms.viewId === 'original' ? attachment.originalBase64 : attachment.thumbnailBase64;

          if (attachmentBase64) {
            const buffer = new Buffer(attachmentBase64, 'base64');

            res.contentType = attachment.type;
            res.send(HttpStatus.OK, buffer);
          } else {
            sendErrorResponse(req, res, next, createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument,
              parms.viewId === 'original' ? 'There is no original view' : 'There is no thumbnail view'));
          }
        }
      } else {
        sendErrorResponse(req, res, next, createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument,
          `attachment[${ parms.attachmentId }] not found`));
      }
    } catch (err) {
      sendErrorResponse(req, res, next, createAPIException(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCodes.ServiceError,
        err.message));
    }
    
    next();
  };
}
