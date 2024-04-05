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

import * as fs from 'fs';

import { LogLevel, textItem } from '@bfemulator/sdk-shared';
import { Attachment, AttachmentData } from 'botframework-schema';
import * as Formidable from 'formidable';
import * as HttpStatus from 'http-status-codes';
import { Next, Request, Response } from 'restify';

import { BotEndpoint } from '../../../state/botEndpoint';
import { Conversation } from '../../../state/conversation';
import { sendErrorResponse } from '../../../utils/sendErrorResponse';
import { EmulatorRestServer } from '../../../restServer';
import { WebSocketServer } from '../../../webSocketServer';

export function createUploadHandler(emulatorServer: EmulatorRestServer) {
  const {
    logger: { logMessage },
    state,
  } = emulatorServer;

  return (req: Request, res: Response, next: Next): any => {
    if (req.params.conversationId.includes('transcript')) {
      res.end();
      next();
      return;
    }

    const conversation: Conversation = (req as any).conversation;
    const botEndpoint: BotEndpoint = (req as any).botEndpoint;

    if (!conversation) {
      res.send(HttpStatus.NOT_FOUND, 'conversation not found');
      res.end();
      logMessage(req.params.conversationId, textItem(LogLevel.Error, 'Cannot upload file. Conversation not found.'));
      next();
      return;
    }

    if (req.getContentType() !== 'multipart/form-data' || (req.getContentLength() === 0 && !req.isChunked())) {
      next();
      return;
    }

    const form = new Formidable.IncomingForm({ keepExtensions: true, multiples: true });

    // TODO: Override form.onPart handler so it doesn't write temp files to disk.
    form.parse(req, async (err: any, fields: any, files: any) => {
      const ROOT_PATH = '';

      try {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        const activity = JSON.parse(fs.readFileSync(path.resolve(ROOT_PATH, files.activity.path), 'utf8'));
        let uploads = files.file;

        if (!Array.isArray(uploads)) {
          uploads = [uploads];
        }
        if (uploads && uploads.length) {
          const serviceUrl = await emulatorServer.getServiceUrl(botEndpoint.botUrl);
          activity.attachments = [];
          uploads.forEach(upload1 => {
            const name = (upload1 as any).name || 'file.dat';
            const type = upload1.type;
            const path = upload1.path;
            // eslint-disable-next-line security/detect-non-literal-fs-filename
            const base64EncodedContent = fs.readFileSync(path.resolve(ROOT_PATH, path), { encoding: 'base64' });
            const base64Buf = Buffer.from(base64EncodedContent, 'base64');
            const attachmentData: AttachmentData = {
              type,
              name,
              originalBase64: new Uint8Array(base64Buf),
              thumbnailBase64: new Uint8Array(base64Buf),
            };
            const attachmentId = state.attachments.uploadAttachment(attachmentData);
            const attachment: Attachment = {
              name,
              contentType: type,
              contentUrl: `${serviceUrl}/v3/attachments/${attachmentId}/views/original`,
            };

            activity.attachments.push(attachment);
          });

          try {
            const { updatedActivity, statusCode, response } = await conversation.postActivityToBot(activity, true);

            if (~~statusCode === 0 && ~~statusCode > 300) {
              res.send(statusCode || HttpStatus.INTERNAL_SERVER_ERROR, await response.text());
              res.end();
            } else {
              res.send(statusCode, { id: updatedActivity.id });
              res.end();
              WebSocketServer.sendToSubscribers(conversation.conversationId, updatedActivity);
            }
          } catch (err) {
            sendErrorResponse(req, res, next, err);
          }
        } else {
          res.send(HttpStatus.BAD_REQUEST, 'no file uploaded');
          res.end();
        }
      } catch (e) {
        sendErrorResponse(req, res, next, e);
      }

      next();
    });
  };
}
