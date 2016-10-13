import * as Restify from 'restify';
import { emulator } from '../emulator';
import * as SettingsStore from '../settings/settingsStore';
import { uniqueId } from '../utils';
import { IGenericActivity } from '../types/activityTypes';


interface IV1Attachment {
    url: string,
    contentType: string
}

interface IV1Message
{
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


const v1MessageToActivity = (message: IV1Message): IGenericActivity =>
    ({
        type: "message",
        eTag: message.eTag,
        id: message.id,
        serviceUrl: emulator.framework.serviceUrl(),
        timestamp: message.created,
        channelId: "emulator",
        from: { id: message.from },
        conversation: { id: message.conversationId },
        recipient: { id: "bot" }, // what go here?
        channelData: message.channelData,
        text: message.text,
        textFormat: "markdown",
        attachmentLayout: "list",
        attachments: message.attachments && message.attachments.map(a => ({
            contentType: a.contentType,
            contentUrl: a.url
        })),
    });



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
        const activeBot = SettingsStore.getActiveBot();
        if (activeBot) {
            const conversation = emulator.conversations.newConversation(activeBot.botId);
            res.json(200, {
                conversationId: conversation.conversationId,
                token: uniqueId()
            });
            // TODO: Send bot added to conversation
        } else {
            res.send(403, "no active bot");
        }
        return next();
    }

    getMessages = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        const conversation = emulator.conversations.conversationById(req.params.conversationId);
        if (conversation) {
            let watermark = Number(req.params.watermark || 0);
            const messages = conversation.getMessagesSince(req.params.watermark);
            res.json(200, {
                messages: messages,
                watermark: watermark + messages.length
            });
        } else {
            res.send(404, "conversation not found");
        }
        return next();
    }

    postMessage = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        const conversation = emulator.conversations.conversationById(req.params.conversationId);
        if (conversation) {
            const v1Message = req.body as IV1Message;
            const activity = v1MessageToActivity(v1Message);
            conversation.postToBot(activity);
            res.send(204);
        } else {
            res.send(404, "conversation not found");
        }
        return next();
    }

    uploadAttachment = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        res.send(501);
        return next();
    }

    getAttachment = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        res.send(501);
        return next();
    }
}
