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
import { Next, Request, Response } from 'restify';

import { createAPIException } from '../../../../utils/createResponse/createAPIException';
import AttachmentParams from '../types/attachmentParams';
import { sendErrorResponse } from '../../../../utils/sendErrorResponse';
import { ServerState } from '../../../../state/serverState';

export function createGetAttachmentHandler(state: ServerState) {
  return (req: Request, res: Response, next: Next): any => {
    try {
      const params: AttachmentParams = req.params;
      const attachment: AttachmentData = state.attachments.getAttachmentData(params.attachmentId);

      if (attachment) {
        if (params.viewId === 'original' || params.viewId === 'thumbnail') {
          const attachmentBase64 =
            params.viewId === 'original' ? attachment.originalBase64 : attachment.thumbnailBase64;

          if (attachmentBase64) {
            // can be an ArrayBuffer if uploaded via the Web Chat paperclip control, or can be
            // an already-encoded base64 content string if sent from the bot
            let buffer;
            if (attachmentBase64.buffer) {
              buffer = Buffer.from(attachmentBase64 as any);
            } else {
              buffer = Buffer.from(attachmentBase64.toString(), 'base64');
            }

            res.contentType = attachment.type;
            res.send(HttpStatus.OK, buffer);
          } else {
            sendErrorResponse(
              req,
              res,
              next,
              createAPIException(
                HttpStatus.NOT_FOUND,
                ErrorCodes.BadArgument,
                params.viewId === 'original' ? 'There is no original view' : 'There is no thumbnail view'
              )
            );
          }
        }
      } else {
        sendErrorResponse(
          req,
          res,
          next,
          createAPIException(
            HttpStatus.NOT_FOUND,
            ErrorCodes.BadArgument,
            `attachment[${params.attachmentId}] not found`
          )
        );
      }
    } catch (err) {
      sendErrorResponse(
        req,
        res,
        next,
        createAPIException(HttpStatus.INTERNAL_SERVER_ERROR, ErrorCodes.ServiceError, err.message)
      );
    }

    next();
  };
}
