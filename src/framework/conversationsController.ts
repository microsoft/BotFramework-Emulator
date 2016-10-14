import * as Restify from 'restify';
import { IGenericActivity } from '../types/activityTypes';
import { emulator } from '../emulator';
import { uniqueId } from '../utils';


export class ConversationsController {

    registerRoutes = (server: Restify.Server) => {
        server.post('/v3/conversations', this.newConversation);
        server.post('/v3/conversations/:conversationId/activities', this.sendToConversation);
        server.post('/v3/conversations/:conversationId/activities/:activityId', this.replyToActivity);
        server.get('/v3/conversations/:conversationId/members', this.getConversationMembers);
        server.get('/v3/conversations/:conversationId/activities/:activityId/members', this.getActivityMembers);
        server.post('/v3/:conversation_id/attachments', this.uploadAttachment);
    }

    newConversation = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        console.log("framework: newConversation");
        res.send(200, {});
        res.end();
    }

    sendToConversation = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        let activity = <IGenericActivity>req.body;
        const conversationId = req.params.conversationId;
        activity.conversation = {
            id: conversationId
        };
        console.log("framework: sendToConversation", JSON.stringify(activity));
        const conversation = emulator.conversations.conversationById(conversationId);
        if (conversation) {
            conversation.postActivityToUser(activity);
        }
        res.send(200, {});
        res.end();
    }

    replyToActivity = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        let activity = <IGenericActivity>req.body;
        const conversationId = req.params.conversationId;
        activity.replyToId = req.params.activityId;
        activity.conversation = {
            id: conversationId
        };
        console.log("framework: replyToActivity", JSON.stringify(activity));
        const conversation = emulator.conversations.conversationById(conversationId);
        if (conversation) {
            conversation.postActivityToUser(activity);
        }
        res.send(200, {});
        res.end();
    }

    getConversationMembers = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        console.log("framework: getConversationMembers");
        res.send(200, {});
        res.end();
    }

    getActivityMembers = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        console.log("framework: getActivityMembers");
        res.send(200, {});
        res.end();
    }

    uploadAttachment = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        console.log("framework: uploadAttachment");
        res.send(200, {});
        res.end();
    }
}
