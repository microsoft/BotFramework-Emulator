import * as Restify from 'restify';


export class BotStateController {

    static botData: { [key: string]: any } = {};

    static botDataKey = (channelId: string, conversationId: string, userId: string) => `${channelId || '*'}!${conversationId || '*'}!${userId || '*'}`;

    static getBotData(channelId: string, conversationId: string, userId: string) {
        const key = BotStateController.botDataKey(channelId, conversationId, userId);
        return BotStateController.botData[key] || {};
    }

    static setBotData(channelId: string, conversationId: string, userId: string, data: any) {
        const key = BotStateController.botDataKey(channelId, conversationId, userId);
        BotStateController.botData[key] = data;
    }

    static registerRoutes(server: Restify.Server) {
        server.get('/v3/botstate/:channelId/users/:userId', BotStateController.getUserData);
        server.get('/v3/botstate/:channelId/conversations/:conversationId', BotStateController.getConversationData);
        server.get('/v3/botstate/:channelId/conversations/:conversationId/users/:userId', BotStateController.getPrivateConversationData);
        server.post('/v3/botstate/:channelId/users/:userId', BotStateController.setUserData);
        server.post('/v3/botstate/:channelId/conversations/:conversationId', BotStateController.setConversationData);
        server.post('/v3/botstate/:channelId/conversations/:conversationId/users/:userId', BotStateController.setPrivateConversationData);
        server.del('/v3/botstate/:channelId/users/:userId', BotStateController.deleteStateForUser);
    }

    static getUserData(req: Restify.Request, res: Restify.Response, next: Restify.Next): any {
        const data = BotStateController.getBotData(req.params.channelId, req.params.conversationId, req.params.userId);
        res.send(200, data);
        res.end();
    }

    static getConversationData(req: Restify.Request, res: Restify.Response, next: Restify.Next): any {
        const data = BotStateController.getBotData(req.params.channelId, req.params.conversationId, req.params.userId);
        res.send(200, data);
        res.end();
    }

    static getPrivateConversationData(req: Restify.Request, res: Restify.Response, next: Restify.Next): any {
        const data = BotStateController.getBotData(req.params.channelId, req.params.conversationId, req.params.userId);
        res.send(200, data);
        res.end();
    }

    static setUserData(req: Restify.Request, res: Restify.Response, next: Restify.Next): any {
        BotStateController.setBotData(req.params.channelId, req.params.conversationId, req.params.userId, req.body);
        res.send(204);
        res.end();
    }

    static setConversationData(req: Restify.Request, res: Restify.Response, next: Restify.Next): any {
        BotStateController.setBotData(req.params.channelId, req.params.conversationId, req.params.userId, req.body);
        res.send(204);
        res.end();
    }

    static setPrivateConversationData(req: Restify.Request, res: Restify.Response, next: Restify.Next): any {
        BotStateController.setBotData(req.params.channelId, req.params.conversationId, req.params.userId, req.body);
        res.send(204);
        res.end();
    }

    static deleteStateForUser(req: Restify.Request, res: Restify.Response, next: Restify.Next): any {
        // TODO: Implement me.
        res.send(204);
        res.end();
    }
}
