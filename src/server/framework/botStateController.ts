import * as Restify from 'restify';
import * as HttpStatus from "http-status-codes";
import * as ResponseTypes from '../../types/responseTypes';
import { ErrorCodes, IResourceResponse, IErrorResponse } from '../../types/responseTypes';


interface IBotData {
    eTag: string;
    data: any;
}

export class BotStateController {

    private botDataStore: { [key: string]: IBotData } = {};

    private botDataKey(channelId: string, conversationId: string, userId: string) {
        return `${channelId || '*'}!${conversationId || '*'}!${userId || '*'}`;
    }

    private getBotData(channelId: string, conversationId: string, userId: string): IBotData {
        const key = this.botDataKey(channelId, conversationId, userId);
        return this.botDataStore[key] || {
            data: null, eTag: 'empty'
        };
    }

    private setBotData(channelId: string, conversationId: string, userId: string, incomingData: IBotData): IBotData {
        const key = this.botDataKey(channelId, conversationId, userId);
        let oldData = this.botDataStore[key];
        if ((oldData && incomingData.eTag != "*") && oldData.eTag != incomingData.eTag) {
            throw ResponseTypes.createAPIException(HttpStatus.PRECONDITION_FAILED, ErrorCodes.BadArgument, "The data is changed");
        }
        let newData = {} as IBotData;
        newData.eTag = new Date().getTime().toString();
        newData.data = incomingData.data;
        this.botDataStore[key] = newData;
        return newData;
    }

    public static registerRoutes(server: Restify.Server) {
        let controller = new BotStateController();
        server.get('/v3/botstate/:channelId/users/:userId', (req, resp, next) => controller.getUserData(req, resp, next));
        server.get('/v3/botstate/:channelId/conversations/:conversationId', (req, resp, next) => controller.getConversationData(req, resp, next));
        server.get('/v3/botstate/:channelId/conversations/:conversationId/users/:userId', (req, resp, next) => controller.getPrivateConversationData(req, resp, next));
        server.post('/v3/botstate/:channelId/users/:userId', (req, resp, next) => controller.setUserData(req, resp, next));
        server.post('/v3/botstate/:channelId/conversations/:conversationId', (req, resp, next) => controller.setConversationData(req, resp, next));
        server.post('/v3/botstate/:channelId/conversations/:conversationId/users/:userId', (req, resp, next) => controller.setPrivateConversationData(req, resp, next));
        server.del('/v3/botstate/:channelId/users/:userId', (req, resp, next) => controller.deleteStateForUser(req, resp, next));
    }

    // Get USER Data
    public getUserData(req: Restify.Request, res: Restify.Response, next: Restify.Next): any {
        try {
            const botData = this.getBotData(req.params.channelId, req.params.conversationId, req.params.userId);
            res.send(HttpStatus.OK, botData);
            res.end();
        } catch (err) {
            ResponseTypes.sendErrorResponse(req, res, next, err);
        }
    }

    // Get Conversation Data
    public getConversationData(req: Restify.Request, res: Restify.Response, next: Restify.Next): any {
        try {
            const botData = this.getBotData(req.params.channelId, req.params.conversationId, req.params.userId);
            res.send(HttpStatus.OK, botData);
            res.end();
        } catch (err) {
            ResponseTypes.sendErrorResponse(req, res, next, err);
        }
    }

    // Get PrivateConversation Data
    public getPrivateConversationData(req: Restify.Request, res: Restify.Response, next: Restify.Next): any {
        try {
            const botData = this.getBotData(req.params.channelId, req.params.conversationId, req.params.userId);
            res.send(HttpStatus.OK, botData);
            res.end();
        } catch (err) {
            ResponseTypes.sendErrorResponse(req, res, next, err);
        }
    }

    // Set User Data
    public setUserData(req: Restify.Request, res: Restify.Response, next: Restify.Next): any {
        try {
            let newBotData = this.setBotData(req.params.channelId, req.params.conversationId, req.params.userId, req.body as IBotData);
            res.send(HttpStatus.OK, newBotData);
            res.end();
        } catch (err) {
            ResponseTypes.sendErrorResponse(req, res, next, err);
        }
    }

    // set conversation data
    public setConversationData(req: Restify.Request, res: Restify.Response, next: Restify.Next): any {
        try {
            let newBotData = this.setBotData(req.params.channelId, req.params.conversationId, req.params.userId, req.body);
            res.send(HttpStatus.OK, newBotData);
            res.end();
        } catch (err) {
            ResponseTypes.sendErrorResponse(req, res, next, err);
        }
    }

    // set private conversation data
    public setPrivateConversationData(req: Restify.Request, res: Restify.Response, next: Restify.Next): any {
        try {
            let newBotData = this.setBotData(req.params.channelId, req.params.conversationId, req.params.userId, req.body);
            res.send(HttpStatus.OK, newBotData);
            res.end();
        } catch (err) {
            ResponseTypes.sendErrorResponse(req, res, next, err);
        }
    }

    // delete state for user
    public deleteStateForUser(req: Restify.Request, res: Restify.Response, next: Restify.Next): any {
        try {
            let keys = Object.keys(this.botDataStore);
            let userPostfix = `!${req.params.userId}`;
            for (let i = 0; i < keys.length; i++) {
                let key = keys[i];
                if (key.endsWith(userPostfix)) {
                    delete this.botDataStore[key];
                }
            }
            res.send(HttpStatus.OK);
            res.end();
        } catch (err) {
            ResponseTypes.sendErrorResponse(req, res, next, err);
        }
    }
}
