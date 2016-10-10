import * as Restify from 'restify';
import { emulator } from '../emulator';


export class ConversationsControllerV1 {

    public registerRoutes(server: Restify.Server) {
        server.post('/api/conversations', this.newConversation);
        server.get('/api/conversations/:conversationId/messages', this.getMessages);
        server.post('/api/conversations/:conversationId/messages', this.postMessage);
        server.post('/api/conversations/:conversationId/upload', this.uploadAttachment);
        server.post('/api/conversations/:conversationId/users/:userId/upload', this.uploadAttachment);
        server.get('/api/conversations/:conversationId/messages/:messageId/:kind/:imageIndex', this.getAttachment);
    }

    newConversation = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        let conversation = emulator.conversationStore.newConversation(null);
        res.json(201, {
            conversationId: conversation.conversationId,
            token: conversation.token
        });
        return next();
    }

    getMessages = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        res.json(200, {
            messages: [],
            watermark: ''
        });
        return next();
    }

    postMessage = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
    }

    uploadAttachment = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
    }

    getAttachment = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
    }
}
