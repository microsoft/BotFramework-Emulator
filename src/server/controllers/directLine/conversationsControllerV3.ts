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

import * as Restify from 'restify';
import * as HttpStatus from "http-status-codes";
import { emulator } from '../../emulator';
import { getSettings, dispatch } from '../../settings';
import { uniqueId } from '../../../utils';
import { IGenericActivity } from '../../../types/activityTypes';
import { IAttachment } from '../../../types/attachmentTypes';
import { IAttachmentData } from '../../../types/attachmentTypes';
import { AttachmentsController } from '../connector/attachmentsController';
import * as log from '../../log';
import * as Os from 'os';
import * as Fs from 'fs';
import * as Formidable from 'formidable';
import { RestServer } from '../../restServer';
import { jsonBodyParser } from '../../jsonBodyParser';
import { usersDefault } from '../../../types/serverSettingsTypes';


export class ConversationsControllerV3 {

    static registerRoutes(server: RestServer) {
        server.router.opts('/v3/directline', this.options);
        server.router.post('/v3/directline/conversations', jsonBodyParser(), this.startConversation);
        server.router.get('/v3/directline/conversations/:conversationId', this.reconnectToConversation);
        server.router.get('/v3/directline/conversations/:conversationId/activities/', this.getActivities);
        server.router.post('/v3/directline/conversations/:conversationId/activities', jsonBodyParser(), this.postActivity);
        server.router.post('/v3/directline/conversations/:conversationId/upload', this.upload);
        server.router.get('/v3/directline/conversations/:conversationId/stream', this.stream);
    }

    static options = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        res.send(HttpStatus.OK);
        res.end();
    }

    static startConversation = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        const activeBot = getSettings().getActiveBot();
        if (activeBot) {
            let created = false;
            const auth = req.header('Authorization');
            const tokenMatch = /Bearer\s+(.+)/.exec(auth);
            const conversationId = tokenMatch[1];
            let conversation = emulator.conversations.conversationById(activeBot.botId, conversationId);
            if (!conversation) {
                const users = getSettings().users;
                let currentUser = users.usersById[users.currentUserId];
                // TODO: This is a band-aid until state system cleanup
                if (!currentUser) {
                    currentUser = usersDefault.usersById['default-user'];
                    dispatch({
                        type: 'Users_SetCurrentUser',
                        state: {
                            user: currentUser
                        }
                    })
                }
                conversation = emulator.conversations.newConversation(activeBot.botId, currentUser, conversationId);
                conversation.sendConversationUpdate(conversation.members, undefined);
                created = true;
            }
            res.json(created ? HttpStatus.CREATED : HttpStatus.OK, {
                conversationId: conversation.conversationId,
                token: conversation.conversationId,
                expires_in: Number.MAX_VALUE,
                streamUrl: ''
            });
        } else {
            res.send(HttpStatus.NOT_FOUND, "no active bot");
            log.error("DirectLine: Cannot start conversation. No active bot");
        }
        res.end();
    }

    static reconnectToConversation = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        const activeBot = getSettings().getActiveBot();
        if (activeBot) {
            const conversation = emulator.conversations.conversationById(activeBot.botId, req.params.conversationId);
            if (conversation) {
                res.json(HttpStatus.OK, {
                    conversationId: conversation.conversationId,
                    token: conversation.conversationId,
                    expires_in: Number.MAX_VALUE,
                    streamUrl: ''
                });
            } else {
                res.send(HttpStatus.NOT_FOUND, "conversation not found");
                log.error("DirectLine: Cannot post activity. Conversation not found");
            }
        } else {
            res.send(HttpStatus.NOT_FOUND, "no active bot");
            log.error("DirectLine: Cannot start conversation. No active bot");
        }
        res.end();
    }

    static getActivities = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        const activeBot = getSettings().getActiveBot();
        if (activeBot) {
            const conversation = emulator.conversations.conversationById(activeBot.botId, req.params.conversationId);
            if (conversation) {
                const watermark = Number(req.params.watermark || 0) || 0;
                const activities = conversation.getActivitiesSince(req.params.watermark);
                res.json(HttpStatus.OK, {
                    activities,
                    watermark: watermark + activities.length
                });
            } else {
                res.send(HttpStatus.NOT_FOUND, "conversation not found");
                log.error("DirectLine: Cannot get activities. Conversation not found");
            }
        } else {
            res.send(HttpStatus.NOT_FOUND, "no active bot");
            log.error("DirectLine: Cannot get activities. No active bot");
        }
        res.end();
    }

    static postActivity = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        const activeBot = getSettings().getActiveBot();
        if (activeBot) {
            const conversation = emulator.conversations.conversationById(activeBot.botId, req.params.conversationId);
            if (conversation) {
                const activity = <IGenericActivity>req.body;
                conversation.postActivityToBot(activity, true, (err, statusCode, activityId) => {
                    if (err || !/^2\d\d$/.test(`${statusCode}`)) {
                        res.send(statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
                    } else {
                        res.send(statusCode, { id: activityId });
                    }
                    res.end();
                });
            } else {
                res.send(HttpStatus.NOT_FOUND, "conversation not found");
                log.error("DirectLine: Cannot post activity. Conversation not found");
                res.end();
            }
        } else {
            res.send(HttpStatus.NOT_FOUND, "no active bot");
            log.error("DirectLine: Cannot post activity. No active bot");
            res.end();
        }
    }


    static upload = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        const settings = getSettings();
        const activeBot = settings.getActiveBot();
        const currentUser = settings.users.usersById[settings.users.currentUserId];
        if (activeBot) {
            const conversation = emulator.conversations.conversationById(activeBot.botId, req.params.conversationId);
            if (conversation) {
                if (req.getContentType() !== 'multipart/form-data' ||
                    (req.getContentLength() === 0 && !req.isChunked())) {
                    return undefined;
                }
                var form = new Formidable.IncomingForm();
                form.multiples = true;
                form.keepExtensions = true;
                // TODO: Override form.onPart handler so it doesn't write temp files to disk.
                form.parse(req, (err: any, fields: any, files: any) => {
                    try {
                        const activity = JSON.parse(Fs.readFileSync(files.activity.path, 'utf8'));
                        let uploads = files.file;
                        if (!Array.isArray(uploads))
                            uploads = [uploads];
                        if (uploads && uploads.length) {
                            activity.attachments = [];
                            uploads.forEach((upload) => {
                                const name = (upload as any).name || 'file.dat';
                                const type = upload.type;
                                const path = upload.path;
                                const buf: Buffer = Fs.readFileSync(path);
                                const contentBase64 = buf.toString('base64');
                                const attachmentData: IAttachmentData = {
                                    type,
                                    name,
                                    originalBase64: contentBase64,
                                    thumbnailBase64: contentBase64
                                }
                                const attachmentId = AttachmentsController.uploadAttachment(attachmentData);
                                const attachment: IAttachment = {
                                    name,
                                    contentType: type,
                                    contentUrl: `${emulator.framework.serviceUrl}/v3/attachments/${attachmentId}/views/original`
                                }
                                activity.attachments.push(attachment);
                            });

                            conversation.postActivityToBot(activity, true, (err, statusCode, activityId) => {
                                if (err || !/^2\d\d$/.test(`${statusCode}`)) {
                                    res.send(statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
                                } else {
                                    res.send(statusCode, { id: activityId });
                                }
                                res.end();
                            });
                        } else {
                            res.send(HttpStatus.BAD_REQUEST, "no file uploaded");
                            log.error("DirectLine: Cannot post activity. No file uploaded");
                            res.end();
                        }
                    } catch (e) {
                        res.send(HttpStatus.INTERNAL_SERVER_ERROR, "error processing uploads");
                        log.error("DirectLine: Failed to post activity. No files uploaded");
                        res.end();
                    }
                });
            } else {
                res.send(HttpStatus.NOT_FOUND, "conversation not found");
                log.error("DirectLine: Cannot post activity. Conversation not found");
                res.end();
            }
        } else {
            res.send(HttpStatus.NOT_FOUND, "no active bot");
            log.error("DirectLine: Cannot post activity. No active bot");
            res.end();
        }
    }

    static stream = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        res.send(HttpStatus.NOT_IMPLEMENTED);
        log.error("DirectLine: Cannot upgrade socket. Not implemented.");
        res.end();
    }
}
