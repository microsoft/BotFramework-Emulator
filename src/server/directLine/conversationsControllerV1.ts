import * as Restify from 'restify';
import { emulator } from '../emulator';
import * as SettingsServer from '../../settings/settingsServer';
import { uniqueId } from '../../utils';
import { IGenericActivity } from '../../types/activityTypes';
import { IAttachment } from '../../types/attachmentTypes';
import { Conversation } from '../conversationManager';


interface IV1Attachment {
    url: string,
    contentType: string
}

interface IV1Message {
    id?: string,
    conversationId?: string,
    created?: string,
    from?: string,
    text?: string,
    channelData?: any,
    images?: string[],
    attachments?: IV1Attachment[];
    eTag?: string;
}

const messageToActivity = (message: IV1Message): IGenericActivity =>
    ({
        type: "message",
        eTag: message.eTag,
        id: message.id,
        serviceUrl: emulator.framework.serviceUrl(),
        timestamp: message.created,
        channelId: "emulator",
        from: { id: message.from },
        conversation: { id: message.conversationId },
        channelData: message.channelData,
        text: message.text,
        textFormat: "markdown",
        attachmentLayout: "list",
        attachments: message.attachments && message.attachments.map(a => (<IAttachment>{
            contentType: a.contentType,
            contentUrl: a.url
        })),
    });

const activityToMessage = (activity: IGenericActivity): IV1Message => {
    if (activity.channelData) {
        let result: IV1Message = {
            eTag: activity.eTag,
            id: activity.id,
            conversationId: activity.conversation.id,
            created: activity.timestamp,
            from: activity.from.id,
            text: activity.text,
            channelData: activity.channelData,
        }
        return result;
    } else {
        let result: IV1Message = {
            eTag: activity.eTag,
            id: activity.id,
            conversationId: activity.conversation.id,
            created: activity.timestamp,
            from: activity.from.id,
            channelData: activity
        }
        return result;
    }
}


export class ConversationsControllerV1 {

    registerRoutes = (server: Restify.Server) => {
        server.post('/api/conversations', this.newConversation);
        server.get('/api/conversations/:conversationId/messages', this.getMessages);
        server.post('/api/conversations/:conversationId/messages', this.postMessage);
        server.post('/api/conversations/:conversationId/upload', this.uploadAttachment);
        server.post('/api/conversations/:conversationId/users/:userId/upload', this.uploadAttachment);
        server.get('/api/conversations/:conversationId/messages/:messageId/:kind/:imageIndex', this.getAttachment);
    }

    newConversation = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        const activeBot = SettingsServer.settings().getActiveBot();
        if (activeBot) {
            const auth = req.header('Authorization');
            const tokenMatch = /BotConnector\s+(.+)/.exec(auth);
            let conversation = emulator.conversations.conversationById(activeBot.botId, tokenMatch[1]);
            if (!conversation) {
                conversation = emulator.conversations.newConversation(activeBot.botId);
                conversation.sendBotAddedToConversation();
            }
            res.json(200, {
                conversationId: conversation.conversationId
            });
        } else {
            res.send(403, "no active bot");
        }
        res.end();
    }

    getMessages = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        const activeBot = SettingsServer.settings().getActiveBot();
        if (activeBot) {
            const conversation = emulator.conversations.conversationById(activeBot.botId, req.params.conversationId);
            if (conversation) {
                const watermark = Number(req.params.watermark || 0);
                const activities = conversation.getActivitiesSince(req.params.watermark);
                const messages = activities.map(a => activityToMessage(a));
                res.json(200, {
                    messages: messages,
                    watermark: watermark + activities.length
                });
            } else {
                res.send(404, "conversation not found");
            }
        } else {
            res.send(403, "no active bot");
        }
        res.end();
    }

    postMessage = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        const activeBot = SettingsServer.settings().getActiveBot();
        if (activeBot) {
            const conversation = emulator.conversations.conversationById(activeBot.botId, req.params.conversationId);
            if (conversation) {
                const message = <IV1Message>req.body;
                const activity = messageToActivity(message);
                conversation.postActivityToBot(activity);
                res.send(204);
            } else {
                res.send(404, "conversation not found");
            }
        } else {
            res.send(403, "no active bot");
        }
        res.end();
    }

    uploadAttachment = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        res.send(501);
        res.end();
    }

    getAttachment = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        res.send(501);
        res.end();
    }
}
