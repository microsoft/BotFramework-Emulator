import * as Restify from 'restify';
import { emulator } from '../emulator';


export class ConversationsController {

    public registerRoutes(server: Restify.Server) {
        server.post('/v3/conversations', this.newConversation);
        server.post('/v3/conversations/:conversation_id/activities', this.sendToConversation);
        server.post('/v3/conversations/:conversation_id/activities/:activity_id', this.replyToActivity);
        server.get('/v3/conversations/:conversation_id/members', this.getConversationMembers);
        server.get('/v3/conversations/:conversation_id/activities/:activity_id/members', this.getActivityMembers);
        server.post('/v3/:conversation_id/attachments', this.uploadAttachment);
    }

    newConversation = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        console.log("framework: newConversation");
        res.send(200, {});
        return next();
    }

    sendToConversation = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        console.log("framework: sendToConversation");
        res.send(200, {});
        return next();
    }

    replyToActivity = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        console.log("framework: replyToActivity");
        res.send(200, {});
        return next();
    }

    getConversationMembers = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        console.log("framework: getConversationMembers");
        res.send(200, {});
        return next();
    }

    getActivityMembers = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        console.log("framework: getActivityMembers");
        res.send(200, {});
        return next();
    }

    uploadAttachment = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        console.log("framework: uploadAttachment");
        res.send(200, {});
        return next();
    }
}
