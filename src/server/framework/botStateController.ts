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
        var oldData = this.botDataStore[key];
        if (oldData && oldData.eTag != incomingData.eTag)
            throw ResponseTypes.CreateAPIException(HttpStatus.PRECONDITION_FAILED, ErrorCodes.BadArgument, "The data is changed");

        var newData = {} as IBotData;
        newData.eTag = new Date().getTime().toString();
        newData.data = incomingData.data;
        this.botDataStore[key] = newData;
        return newData;
    }

    public static registerRoutes(server: Restify.Server) {
        var controller = new BotStateController();
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
            var apiException: ResponseTypes.APIException = err;
            if (apiException.error)
                res.send(apiException.statusCode, apiException.error);
            else
                res.send(HttpStatus.BAD_REQUEST, ResponseTypes.CreateErrorResponse(ErrorCodes.ServiceError, err));
            res.end();
        }
    }

    // Get Conversation Data
    public getConversationData(req: Restify.Request, res: Restify.Response, next: Restify.Next): any {
        try {
            const botData = this.getBotData(req.params.channelId, req.params.conversationId, req.params.userId);
            res.send(HttpStatus.OK, botData);
            res.end();
        } catch (err) {
            var apiException: ResponseTypes.APIException = err;
            if (apiException.error)
                res.send(apiException.statusCode, apiException.error);
            else
                res.send(HttpStatus.BAD_REQUEST, ResponseTypes.CreateErrorResponse(ErrorCodes.ServiceError, err));
            res.end();
        }
    }

    // Get PrivateConversation Data
    public getPrivateConversationData(req: Restify.Request, res: Restify.Response, next: Restify.Next): any {
        try {
            const botData = this.getBotData(req.params.channelId, req.params.conversationId, req.params.userId);
            res.send(HttpStatus.OK, botData);
            res.end();
        } catch (err) {
            var apiException: ResponseTypes.APIException = err;
            if (apiException.error)
                res.send(apiException.statusCode, apiException.error);
            else
                res.send(HttpStatus.BAD_REQUEST, ResponseTypes.CreateErrorResponse(ErrorCodes.ServiceError, err));
            res.end();
        }
    }

    // Set User Data
    public setUserData(req: Restify.Request, res: Restify.Response, next: Restify.Next): any {
        try {
            var newBotData = this.setBotData(req.params.channelId, req.params.conversationId, req.params.userId, req.body as IBotData);
            res.send(HttpStatus.OK, newBotData);
            res.end();
        } catch (err) {
            var apiException: ResponseTypes.APIException = err;
            if (apiException.error)
                res.send(apiException.statusCode, apiException.error);
            else
                res.send(HttpStatus.BAD_REQUEST, ResponseTypes.CreateErrorResponse(ErrorCodes.ServiceError, err));
            res.end();
        }
    }

    // set conversation data
    public setConversationData(req: Restify.Request, res: Restify.Response, next: Restify.Next): any {
        try {
            var newBotData = this.setBotData(req.params.channelId, req.params.conversationId, req.params.userId, req.body);
            res.send(HttpStatus.OK, newBotData);
            res.end();
        } catch (err) {
            var apiException: ResponseTypes.APIException = err;
            if (apiException.error)
                res.send(apiException.statusCode, apiException.error);
            else
                res.send(HttpStatus.BAD_REQUEST, ResponseTypes.CreateErrorResponse(ErrorCodes.ServiceError, err));
            res.end();
        }
    }

    // set private conversation data
    public setPrivateConversationData(req: Restify.Request, res: Restify.Response, next: Restify.Next): any {
        try {
            var newBotData = this.setBotData(req.params.channelId, req.params.conversationId, req.params.userId, req.body);
            res.send(HttpStatus.OK, newBotData);
            res.end();
        } catch (err) {
            var apiException: ResponseTypes.APIException = err;
            if (apiException.error)
                res.send(apiException.statusCode, apiException.error);
            else
                res.send(HttpStatus.BAD_REQUEST, ResponseTypes.CreateErrorResponse(ErrorCodes.ServiceError, err));
            res.end();
        }
    }

    // delete state for user
    public deleteStateForUser(req: Restify.Request, res: Restify.Response, next: Restify.Next): any {
        try {
            // TODO: Implement me.
            throw ResponseTypes.CreateAPIException(HttpStatus.NOT_IMPLEMENTED, ErrorCodes.BadArgument, "Delete is not implemnted yet");
            // res.send(HttpStatus.NO_CONTENT);
            // res.end();
        } catch (err) {
            var apiException: ResponseTypes.APIException = err;
            if (apiException.error)
                res.send(apiException.statusCode, apiException.error);
            else
                res.send(HttpStatus.BAD_REQUEST, ResponseTypes.CreateErrorResponse(ErrorCodes.ServiceError, err));
            res.end();
        }
    }
}
