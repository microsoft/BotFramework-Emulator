import * as Restify from 'restify';
import { IGenericActivity } from '../../types/activityTypes';
import { getSettings } from '../settings';
import { emulator } from '../emulator';
import { uniqueId } from '../../utils';
import * as HttpStatus from "http-status-codes";
import * as ResponseTypes from '../../types/responseTypes';
import { ErrorCodes, IResourceResponse, IErrorResponse } from '../../types/responseTypes';
import { IAttachmentData, IAttachmentInfo, IAttachmentView } from '../../types/attachmentTypes';
import { AttachmentsController } from './attachmentsController';

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
        server.put('/v3/conversations/:conversationId/activities/:activityId', (req, res, next) => controller.updateActivity(req, res, next));
        server.del('/v3/conversations/:conversationId/activities/:activityId', (req, res, next) => controller.deleteActivity(req, res, next));
        server.get('/v3/conversations/:conversationId/members', (req, res, next) => controller.getConversationMembers(req, res, next));
        server.get('/v3/conversations/:conversationId/activities/:activityId/members', (req, res, next) => controller.getActivityMembers(req, res, next));
        server.post('/v3/:conversation_id/attachments', (req, res, next) => controller.uploadAttachment(req, res, next));
    }

    // Create conversation API
    public createConversation(req: Restify.Request, res: Restify.Response, next: Restify.Next): any {
        try {
            console.log("framework: newConversation");

            // look up bot
            const activeBot = getSettings().getActiveBot();
            if (!activeBot)
                throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "bot not found");

            const users = getSettings().users;
            const currentUser = users.usersById[users.currentUserId];

            var newConversation = emulator.conversations.newConversation(activeBot.botId, currentUser);
            res.send(HttpStatus.OK, ResponseTypes.createResourceResponse(newConversation.conversationId));
            res.end();
        } catch (err) {
            ResponseTypes.sendErrorResponse(req, res, next, err);
        }
    }

    // SendToConversation
    public sendToConversation(req: Restify.Request, res: Restify.Response, next: Restify.Next): any {
        try {
            let activity = <IGenericActivity>req.body;
            const parms: IConversationParams = req.params;
            console.log("framework: sendToConversation", JSON.stringify(activity));

            // look up bot
            const activeBot = getSettings().getActiveBot();
            if (!activeBot)
                throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "bot not found");

            activity.replyToId = req.params.activityId;

            // validate conversation
            if (activity.conversation.id != parms.conversationId)
                throw ResponseTypes.createAPIException(HttpStatus.BAD_REQUEST, ErrorCodes.BadArgument, "uri conversation id does not match payload");

            // look up conversation
            const conversation = emulator.conversations.conversationById(activeBot.botId, parms.conversationId);
            if (!conversation)
                throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "conversation not found");

            // post activity
            var response: IResourceResponse = conversation.postActivityToUser(activity);
            res.send(HttpStatus.OK, response);
            res.end();
            return;
        } catch (err) {
            ResponseTypes.sendErrorResponse(req, res, next, err);
        }
    }

    // replyToActivity
    public replyToActivity(req: Restify.Request, res: Restify.Response, next: Restify.Next): any {
        try {
            let activity = <IGenericActivity>req.body;
            const parms: IConversationParams = req.params;
            console.log("framework: replyToActivity", JSON.stringify(activity));

            // look up bot
            const activeBot = getSettings().getActiveBot();
            if (!activeBot)
                throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "bot not found");

            activity.replyToId = req.params.activityId;

            // validate conversation
            if (activity.conversation.id != parms.conversationId)
                throw ResponseTypes.createAPIException(HttpStatus.BAD_REQUEST, ErrorCodes.BadArgument, "uri conversation id does not match payload");

            // look up conversation
            const conversation = emulator.conversations.conversationById(activeBot.botId, parms.conversationId);
            if (!conversation)
                throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "conversation not found");

            // if we found the activity to reply to
            if (!conversation.activities.find((existingActivity, index, obj) => existingActivity.id == activity.replyToId))
                throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "replyToId is not a known activity id");

            // post activity
            var response: IResourceResponse = conversation.postActivityToUser(activity);
            res.send(HttpStatus.OK, response);
            res.end();
            return;
        } catch (err) {
            ResponseTypes.sendErrorResponse(req, res, next, err);
        }
    }

    // updateActivity
    public updateActivity(req: Restify.Request, res: Restify.Response, next: Restify.Next): any {
        try {
            let activity = <IGenericActivity>req.body;
            const parms: IConversationParams = req.params;
            console.log("framework: updateActivity", JSON.stringify(activity));

            // look up bot
            const activeBot = getSettings().getActiveBot();
            if (!activeBot)
                throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "bot not found");

            activity.replyToId = req.params.activityId;

            // validate conversation
            if (activity.conversation.id != parms.conversationId)
                throw ResponseTypes.createAPIException(HttpStatus.BAD_REQUEST, ErrorCodes.BadArgument, "uri conversation id does not match payload conversation id");

            if (activity.id != parms.activityId)
                throw ResponseTypes.createAPIException(HttpStatus.BAD_REQUEST, ErrorCodes.BadArgument, "uri activity id does not match payload activity id");

            // look up conversation
            const conversation = emulator.conversations.conversationById(activeBot.botId, parms.conversationId);
            if (!conversation)
                throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "conversation not found");

            // post activity
            var response: IResourceResponse = conversation.updateActivity(activity);
            res.send(HttpStatus.OK, response);
            res.end();
            return;
        } catch (err) {
            ResponseTypes.sendErrorResponse(req, res, next, err);
        }
    }

    // deleteActivity
    public deleteActivity(req: Restify.Request, res: Restify.Response, next: Restify.Next): any {
        try {
            const parms: IConversationParams = req.params;
            console.log("framework: deleteActivity", JSON.stringify(parms));

            // look up bot
            const activeBot = getSettings().getActiveBot();
            if (!activeBot)
                throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "bot not found");

            // look up conversation
            const conversation = emulator.conversations.conversationById(activeBot.botId, parms.conversationId);
            if (!conversation)
                throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "conversation not found");

            conversation.deleteActivity(parms.activityId);

            res.send(HttpStatus.OK);
            res.end();
            return;
        } catch (err) {
            ResponseTypes.sendErrorResponse(req, res, next, err);
        }
    }

    // get members of a conversation
    public getConversationMembers(req: Restify.Request, res: Restify.Response, next: Restify.Next): any {
        console.log("framework: getConversationMembers");
        try {
            // look up bot
            const activeBot = getSettings().getActiveBot();
            if (!activeBot)
                throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "bot not found");

            let activity = <IGenericActivity>req.body;
            const parms: IConversationParams = req.params;

            // look up conversation
            const conversation = emulator.conversations.conversationById(activeBot.botId, parms.conversationId);
            if (!conversation)
                throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "conversation not found");

            res.send(HttpStatus.OK, conversation.members);
            res.end();
        } catch (err) {
            ResponseTypes.sendErrorResponse(req, res, next, err);
        }
    }

    // get members of an activity
    public getActivityMembers(req: Restify.Request, res: Restify.Response, next: Restify.Next): any {
        console.log("framework: getActivityMembers");
        try {
            // look up bot
            const activeBot = getSettings().getActiveBot();
            if (!activeBot)
                throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "bot not found");

            let activity = <IGenericActivity>req.body;
            const parms: IConversationParams = req.params;

            // look up conversation
            const conversation = emulator.conversations.conversationById(activeBot.botId, parms.conversationId);
            if (!conversation)
                throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "conversation not found");

            res.send(HttpStatus.OK, conversation.members);
            res.end();
        } catch (err) {
            ResponseTypes.sendErrorResponse(req, res, next, err);
        }
    }

    // upload attachment
    public uploadAttachment(req: Restify.Request, res: Restify.Response, next: Restify.Next): any {
        console.log("framework: uploadAttachment");
        try {
            // look up bot
            const activeBot = getSettings().getActiveBot();
            if (!activeBot)
                throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "bot not found");

            let attachmentData = <IAttachmentData>req.body;
            const parms: IConversationParams = req.params;

            // look up conversation
            const conversation = emulator.conversations.conversationById(activeBot.botId, parms.conversationId);
            if (!conversation)
                throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "conversation not found");

            var resourceId = AttachmentsController.uploadAttachment(attachmentData);
            var resourceResponse : IResourceResponse = { id : resourceId };
            res.send(HttpStatus.OK, resourceResponse);
            res.end();
        } catch (err) {
            ResponseTypes.sendErrorResponse(req, res, next, err);
        }
    }
}
