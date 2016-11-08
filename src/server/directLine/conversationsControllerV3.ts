import * as Restify from 'restify';
import * as HttpStatus from "http-status-codes";
import { emulator } from '../emulator';
import { getSettings } from '../settings';
import { uniqueId } from '../../utils';
import { IGenericActivity } from '../../types/activityTypes';
import { IAttachment } from '../../types/attachmentTypes';
import { IAttachmentData } from '../../types/attachmentTypes';
import { AttachmentsController } from '../framework/attachmentsController';
import * as log from '../log';
import * as Os from 'os';
import * as Fs from 'fs';
import { RestServer } from '../RestServer';


export class ConversationsControllerV3 {

    static registerRoutes(server: RestServer) {
        server.router.opts('/v3/directline', this.options);
        server.router.post('/v3/directline/conversations', this.startConversation);
        server.router.get('/v3/directline/conversations/:conversationId', this.reconnectToConversation);
        server.router.get('/v3/directline/conversations/:conversationId/activities/', this.getActivities);
        server.router.post('/v3/directline/conversations/:conversationId/activities', this.postActivity);
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
            let conversation = emulator.conversations.conversationById(activeBot.botId, tokenMatch[1]);
            if (!conversation) {
                const users = getSettings().users;
                const currentUser = users.usersById[users.currentUserId];
                conversation = emulator.conversations.newConversation(activeBot.botId, currentUser);
                conversation.sendBotAddedToConversation();
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
                activity.serviceUrl = emulator.framework.serviceUrl;
                conversation.postActivityToBot(activity, true, (err, statusCode, activityId) => {
                    if (err || !/^2\d\d$/.test(`${statusCode}`)) {
                        res.send(statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
                        log.error("Failed to post activity to bot: " + (err || statusCode));
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
        // TODO: Combine multiple uploads into a single message. Restify calls upload for each one in the multipart/form-data in this naive implementation.
        const settings = getSettings();
        const activeBot = settings.getActiveBot();
        const currentUser = settings.users.usersById[settings.users.currentUserId];
        if (activeBot) {
            const conversation = emulator.conversations.conversationById(activeBot.botId, req.params.conversationId);
            if (conversation) {
                if (req.files && req.files['file']) {
                    const fileSpec: any = req.files['file'];
                    log.info('upload', fileSpec.type, fileSpec.name);
                    const buf: Buffer = Fs.readFileSync(fileSpec.path);

                    const contentBase64 = buf.toString('base64');
                    const attachment: IAttachmentData = {
                        type: fileSpec.type,
                        name: fileSpec.name,
                        originalBase64: contentBase64,
                        thumbnailBase64: contentBase64
                    }

                    const attachmentId = AttachmentsController.uploadAttachment(attachment);

                    const activity: IGenericActivity = {
                        type: "message",
                        from: {
                            name: currentUser.name,
                            id: currentUser.id
                        },
                        attachments: [
                            {
                                contentType: fileSpec.type,
                                name: fileSpec.name,
                                contentUrl: `${emulator.framework.serviceUrl}/v3/attachments/${attachmentId}/views/original`
                            }
                        ],
                        serviceUrl: emulator.framework.serviceUrl
                    }
                    conversation.postActivityToBot(activity, true, (err, statusCode, activityId) => {
                        if (err || !/^2\d\d$/.test(`${statusCode}`)) {
                            res.send(statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
                            log.error("Failed to upload to bot: " + (err || statusCode));
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
