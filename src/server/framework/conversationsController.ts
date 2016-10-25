import * as Restify from 'restify';
import { IGenericActivity } from '../../types/activityTypes';
import { getSettings } from '../settings';
import { emulator } from '../emulator';
import { uniqueId } from '../../utils';


export class ConversationsController {

    static registerRoutes(server: Restify.Server) {
        server.post('/v3/conversations', ConversationsController.newConversation);
        server.post('/v3/conversations/:conversationId/activities', ConversationsController.sendToConversation);
        server.post('/v3/conversations/:conversationId/activities/:activityId', ConversationsController.replyToActivity);
        server.get('/v3/conversations/:conversationId/members', ConversationsController.getConversationMembers);
        server.get('/v3/conversations/:conversationId/activities/:activityId/members', ConversationsController.getActivityMembers);
        server.post('/v3/:conversation_id/attachments', ConversationsController.uploadAttachment);
    }

    static newConversation(req: Restify.Request, res: Restify.Response, next: Restify.Next): any {
        console.log("framework: newConversation");
        res.send(200, {});
        res.end();
    }

    static sendToConversation(req: Restify.Request, res: Restify.Response, next: Restify.Next): any {
        const activeBot = getSettings().getActiveBot();
        if (activeBot) {
            let activity = <IGenericActivity>req.body;
            const conversationId = req.params.conversationId;
            activity.conversation = {
                id: conversationId
            };
            console.log("framework: sendToConversation", JSON.stringify(activity));
            const conversation = emulator.conversations.conversationById(activeBot.botId, conversationId);
            if (conversation) {
                conversation.postActivityToUser(activity);
            }
        }
        res.send(200, {});
        res.end();
    }

    static replyToActivity(req: Restify.Request, res: Restify.Response, next: Restify.Next): any {
        const activeBot = getSettings().getActiveBot();
        if (activeBot) {
            let activity = <IGenericActivity>req.body;
            const conversationId = req.params.conversationId;
            activity.replyToId = req.params.activityId;
            activity.conversation = {
                id: conversationId
            };
            console.log("framework: replyToActivity", JSON.stringify(activity));
            const conversation = emulator.conversations.conversationById(activeBot.botId, conversationId);
            if (conversation) {
                conversation.postActivityToUser(activity);
            }
        }
        res.send(200, {});
        res.end();
    }

    static getConversationMembers(req: Restify.Request, res: Restify.Response, next: Restify.Next): any {
        console.log("framework: getConversationMembers");
        res.send(200, {});
        res.end();
    }

    static getActivityMembers(req: Restify.Request, res: Restify.Response, next: Restify.Next): any {
        console.log("framework: getActivityMembers");
        res.send(200, {});
        res.end();
    }

    static uploadAttachment(req: Restify.Request, res: Restify.Response, next: Restify.Next): any {
        console.log("framework: uploadAttachment");
        res.send(200, {});
        res.end();
    }
}
