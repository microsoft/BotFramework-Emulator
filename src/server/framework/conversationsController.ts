import * as Restify from 'restify';
import { IGenericActivity } from '../../types/activityTypes';
import { getSettings } from '../settings';
import { emulator } from '../emulator';
import { uniqueId } from '../../utils';
import * as HttpStatus from "http-status-codes";
import * as ResponseTypes from '../../types/responseTypes';
import { ErrorCodes, IResourceResponse, IErrorResponse } from '../../types/responseTypes';

interface IConversationParams {
    conversationId: string;
    activityId: string;
}

export class ConversationsController {

    public static registerRoutes(server: Restify.Server) {
        var controller = new ConversationsController();
        server.post('/v3/conversations', (req, res, next) => controller.createConversation(req, res, next));
        server.post('/v3/conversations/:conversationId/activities', (req, res, next) => controller.sendToConversation(req, res, next));
        server.post('/v3/conversations/:conversationId/activities/:activityId', (req, res, next) => controller.replyToActivity(req, res, next));
        server.get('/v3/conversations/:conversationId/members', (req, res, next) => controller.getConversationMembers(req, res, next));
        server.get('/v3/conversations/:conversationId/activities/:activityId/members', (req, res, next) => controller.getActivityMembers(req, res, next));
        server.post('/v3/:conversation_id/attachments', (req, res, next) => controller.uploadAttachment(req, res, next));
    }

    // Create conversation API
    public createConversation(req: Restify.Request, res: Restify.Response, next: Restify.Next): any {
        console.log("framework: newConversation");
        res.send(HttpStatus.OK, ResponseTypes.CreateResourceResponse("123123"));
        res.end();
    }

    // SendToConversation
    public sendToConversation(req: Restify.Request, res: Restify.Response, next: Restify.Next): any {
        try {
            // look up bot
            const activeBot = getSettings().getActiveBot();
            if (!activeBot)
                throw ResponseTypes.CreateAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "bot not found");

            let activity = <IGenericActivity>req.body;
            const parms: IConversationParams = req.params;
            activity.replyToId = req.params.activityId;

            // validate conversation
            if (activity.conversation.id != parms.conversationId)
                throw ResponseTypes.CreateAPIException(HttpStatus.BAD_REQUEST, ErrorCodes.BadArgument, "uri conversation id does not match payload");

            console.log("framework: sendToConversation", JSON.stringify(activity));
            // look up conversation
            const conversation = emulator.conversations.conversationById(activeBot.botId, parms.conversationId);
            if (!conversation)
                throw ResponseTypes.CreateAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "conversation not found");

            // post activity
            var response: IResourceResponse = conversation.postActivityToUser(activity);
            res.send(HttpStatus.OK, response);
            res.end();
            return;
        } catch (err) {
            var apiException: ResponseTypes.APIException = err;
            if (apiException.error)
                res.send(apiException.statusCode, apiException.error);
            else
                res.send(HttpStatus.BAD_REQUEST, ResponseTypes.CreateErrorResponse(ErrorCodes.ServiceError, err));
            res.end();
        }
    }

    // replyToActivity
    public replyToActivity(req: Restify.Request, res: Restify.Response, next: Restify.Next): any {
        try {
            // look up bot
            const activeBot = getSettings().getActiveBot();
            if (!activeBot)
                throw ResponseTypes.CreateAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "bot not found");

            let activity = <IGenericActivity>req.body;
            const parms: IConversationParams = req.params;
            activity.replyToId = req.params.activityId;

            // validate conversation
            if (activity.conversation.id != parms.conversationId)
                throw ResponseTypes.CreateAPIException(HttpStatus.BAD_REQUEST, ErrorCodes.BadArgument, "uri conversation id does not match payload");

            console.log("framework: replyToActivity", JSON.stringify(activity));
            // look up conversation
            const conversation = emulator.conversations.conversationById(activeBot.botId, parms.conversationId);
            if (!conversation)
                throw ResponseTypes.CreateAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "conversation not found");

            // if we found the activity to reply to
            if (!conversation.activities.find((existingActivity, index, obj) => existingActivity.id == activity.replyToId))
                throw ResponseTypes.CreateAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "replyToId is not a known activity id");

            // post activity
            var response: IResourceResponse = conversation.postActivityToUser(activity);
            res.send(HttpStatus.OK, response);
            res.end();
            return;
        } catch (err) {
            var apiException: ResponseTypes.APIException = err;
            if (apiException.error)
                res.send(apiException.statusCode, apiException.error);
            else
                res.send(HttpStatus.BAD_REQUEST, ResponseTypes.CreateErrorResponse(ErrorCodes.ServiceError, err));
            res.end();
        }
    }

    public getConversationMembers(req: Restify.Request, res: Restify.Response, next: Restify.Next): any {
        console.log("framework: getConversationMembers");
        res.send(HttpStatus.OK, {});
        res.end();
    }

    public getActivityMembers(req: Restify.Request, res: Restify.Response, next: Restify.Next): any {
        console.log("framework: getActivityMembers");
        res.send(200, {});
        res.end();
    }

    public uploadAttachment(req: Restify.Request, res: Restify.Response, next: Restify.Next): any {
        console.log("framework: uploadAttachment");
        res.send(200, {});
        res.end();
    }
}
