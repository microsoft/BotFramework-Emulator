import * as Restify from 'restify';


export class BotStateController {

    public registerRoutes(server: Restify.Server) {
        server.get('/v3/botstate/:channel_id/users/:user_id', this.getUserData);
        server.get('/v3/botstate/:channel_id/conversations/:conversation_id', this.getConversationData);
        server.get('/v3/botstate/:channel_id/conversations/:conversation_id/users/:user_id', this.getPrivateConversationData);
        server.post('/v3/botstate/:channel_id/users/:user_id', this.setUserData);
        server.post('/v3/botstate/:channel_id/conversations/:conversation_id', this.setConversationData);
        server.post('/v3/botstate/:channel_id/conversations/:conversation_id/users/:user_id', this.setPrivateConversationData);
        server.del('/v3/botstate/:channel_id/users/:user_id', this.deleteStateForUser);
    }

    getUserData = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        console.log("framework: getUserData");
        res.send(200, {});
        return next();
    }

    getConversationData = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        console.log("framework: getConversationData");
        res.send(200, {});
        return next();
    }

    getPrivateConversationData = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        console.log("framework: getPrivateConversationData");
        res.send(200, {});
        return next();
    }

    setUserData = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        console.log("framework: setUserData");
        res.send(200, {});
        return next();
    }

    setConversationData = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        console.log("framework: setConversationData");
        res.send(200, {});
        return next();
    }

    setPrivateConversationData = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        console.log("framework: setPrivateConversationData");
        res.send(200, {});
        return next();
    }

    deleteStateForUser = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        console.log("framework: deleteStateForUser");
        res.send(200, {});
        return next();
    }
}
