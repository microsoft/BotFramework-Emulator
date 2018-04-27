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
import * as HttpStatus from 'http-status-codes';
import * as Restify from 'restify';

import * as Formidable from 'formidable';
import BotEmulator from '../../botEmulator';
import Conversation from '../../facility/conversation';
import IAttachment from '../../types/attachment';
import IAttachmentData from '../../types/attachment/data';

export default function upload(botEmulator: BotEmulator) {
  const { logError, logRequest, logResponse } = botEmulator.facilities.logger;

  return (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
    if (req.params.conversationId.includes('transcript')) {
      res.end();
      return;
    }

    logRequest(req.params.conversationId, 'user', req);

    const conversation: Conversation = req['conversation'];

    if (!conversation) {
      res.send(HttpStatus.NOT_FOUND, 'conversation not found');
      res.end();
      logError(req.params.conversationId, 'Cannot upload file. Conversation not found.');
      logResponse(req.params.conversationId, 'user', res);

      return;
    }

    if (req.getContentType() !== 'multipart/form-data' ||
      (req.getContentLength() === 0 && !req.isChunked())) {
      return;
    }

    const form = new Formidable.IncomingForm();

    form.multiples = true;
    form.keepExtensions = true;
    // TODO: Override form.onPart handler so it doesn't write temp files to disk.
    form.parse(req, async (err: any, fields: any, files: any) => {
      try {
        const activity = JSON.parse(fs.readFileSync(files.activity.path, 'utf8'));
        let uploads = files.file;

        if (!Array.isArray(uploads))
          uploads = [uploads];
        if (uploads && uploads.length) {
          activity.attachments = [];
          uploads.forEach((upload) => {
            const name = (upload as any).name || 'file.dat';
            const type = upload.type;
            const path = upload.path;
            const buf: Buffer = fs.readFileSync(path);
            const contentBase64 = buf.toString('base64');
            const attachmentData: IAttachmentData = {
              type,
              name,
              originalBase64: contentBase64,
              thumbnailBase64: contentBase64
            }
            const attachmentId = botEmulator.facilities.attachments.uploadAttachment(attachmentData);
            const attachment: IAttachment = {
              name,
              contentType: type,
              contentUrl: `${ botEmulator.getServiceUrl(req['botEndpoint']) }/v3/attachments/${attachmentId}/views/original`
            }

            activity.attachments.push(attachment);
          });

          try {
            const { activityId, statusCode } = await conversation.postActivityToBot(activity, true);

            //logNetwork(conversation.conversationId, req, res, `[${activity.type}]`);
            if (!/^2\d\d$/.test(`${statusCode}`)) {
              res.send(statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
              res.end();

              logResponse(req.params.conversationId, 'user', res, {
                type: 'err'
              });
            } else {
              res.send(statusCode, { id: activityId });
              res.end();

              logResponse(req.params.conversationId, 'user', res);
            }
          } catch (err) {
            res.send(HttpStatus.INTERNAL_SERVER_ERROR);
            res.end();

            logResponse(req.params.conversationId, 'user', res, {
              type: 'err',
              err}
            );
          }
        } else {
          res.send(HttpStatus.BAD_REQUEST, 'no file uploaded');
          res.end();
          logError(req.params.conversationId, 'Upload failed.');
          logResponse(req.params.conversationId, 'user', res);
        }
      } catch (e) {
        res.send(HttpStatus.INTERNAL_SERVER_ERROR, 'error processing uploads');
        res.end();
        logError(req.params.conversationId, 'Upload failed.');
        logResponse(req.params.conversationId, 'user', res);
      }
    });
  };
}
