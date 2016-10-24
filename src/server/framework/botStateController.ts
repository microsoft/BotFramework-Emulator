import * as Restify from 'restify';


export class BotStateController {

    botData: { [key: string]: any } = {};

    botDataKey = (channelId: string, conversationId: string, userId: string) => `${channelId || '*'}!${conversationId || '*'}!${userId || '*'}`;

    getBotData = (channelId: string, conversationId: string, userId: string) => {
        const key = this.botDataKey(channelId, conversationId, userId);
        return this.botData[key] || {};
    }

    setBotData = (channelId: string, conversationId: string, userId: string, data: any) => {
        const key = this.botDataKey(channelId, conversationId, userId);
        this.botData[key] = data;
    }

    registerRoutes = (server: Restify.Server) => {
        server.get('/v3/botstate/:channelId/users/:userId', this.getUserData);
        server.get('/v3/botstate/:channelId/conversations/:conversationId', this.getConversationData);
        server.get('/v3/botstate/:channelId/conversations/:conversationId/users/:userId', this.getPrivateConversationData);
        server.post('/v3/botstate/:channelId/users/:userId', this.setUserData);
        server.post('/v3/botstate/:channelId/conversations/:conversationId', this.setConversationData);
        server.post('/v3/botstate/:channelId/conversations/:conversationId/users/:userId', this.setPrivateConversationData);
        server.del('/v3/botstate/:channelId/users/:userId', this.deleteStateForUser);
    }

    getUserData = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        const data = this.getBotData(req.params.channelId, req.params.conversationId, req.params.userId);
        res.send(200, data);
        res.end();
    }

    getConversationData = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        const data = this.getBotData(req.params.channelId, req.params.conversationId, req.params.userId);
        res.send(200, data);
        res.end();
    }

    getPrivateConversationData = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        const data = this.getBotData(req.params.channelId, req.params.conversationId, req.params.userId);
        res.send(200, data);
        res.end();
    }

    setUserData = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        this.setBotData(req.params.channelId, req.params.conversationId, req.params.userId, req.body);
        res.send(204);
        res.end();
    }

    setConversationData = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        this.setBotData(req.params.channelId, req.params.conversationId, req.params.userId, req.body);
        res.send(204);
        res.end();
    }

    setPrivateConversationData = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        this.setBotData(req.params.channelId, req.params.conversationId, req.params.userId, req.body);
        res.send(204);
        res.end();
    }

    deleteStateForUser = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        // TODO: Implement me.
        res.send(204);
        res.end();
    }
}
