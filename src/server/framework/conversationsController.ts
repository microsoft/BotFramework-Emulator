import * as Restify from 'restify';
import { IGenericActivity, IConversationParameters } from '../../types/activityTypes';
import { IUser } from '../../types/userTypes';
import { getSettings, getStore } from '../settings';
import { emulator } from '../emulator';
import { uniqueId } from '../../utils';
import * as HttpStatus from "http-status-codes";
import * as ResponseTypes from '../../types/responseTypes';
import { ErrorCodes, IResourceResponse, IErrorResponse } from '../../types/responseTypes';
import { IAttachmentData, IAttachmentInfo, IAttachmentView } from '../../types/attachmentTypes';
import { AttachmentsController } from './attachmentsController';
import * as log from '../log';
import { RestServer } from '../restServer';
import { BotFrameworkAuthentication } from '../botFrameworkAuthentication';
import { error } from '../log';


interface IConversationAPIPathParameters {
    conversationId: string;
    activityId: string;
}

export class ConversationsController {

    public static registerRoutes(server: RestServer, auth: BotFrameworkAuthentication) {
        server.router.post('/v3/conversations', auth.verifyBotFramework, this.createConversation);
        server.router.post('/v3/conversations/:conversationId/activities', auth.verifyBotFramework, this.sendToConversation);
        server.router.post('/v3/conversations/:conversationId/activities/:activityId', auth.verifyBotFramework, this.replyToActivity);
        server.router.put('/v3/conversations/:conversationId/activities/:activityId', auth.verifyBotFramework, this.updateActivity);
        server.router.del('/v3/conversations/:conversationId/activities/:activityId', auth.verifyBotFramework, this.deleteActivity);
        server.router.get('/v3/conversations/:conversationId/members', auth.verifyBotFramework, this.getConversationMembers);
        server.router.get('/v3/conversations/:conversationId/activities/:activityId/members', auth.verifyBotFramework, this.getActivityMembers);
        server.router.post('/v3/conversations/:conversationId/attachments', auth.verifyBotFramework, this.uploadAttachment);
    }

    // Create conversation API
    public static createConversation = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        let conversationParameters = <IConversationParameters>req.body;
        try {
            console.log("framework: newConversation");

            // look up bot
            const activeBot = getSettings().getActiveBot();
            if (!activeBot)
                throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "bot not found");

            const users = getSettings().users;
            if (conversationParameters.members == null)
                throw ResponseTypes.createAPIException(HttpStatus.BAD_REQUEST, ErrorCodes.MissingProperty, "members missing");

            if (conversationParameters.members.length != 1)
                throw ResponseTypes.createAPIException(HttpStatus.BAD_REQUEST, ErrorCodes.BadSyntax, "Emulator only supports creating conversation with 1 user");

            if (conversationParameters.bot == null)
                throw ResponseTypes.createAPIException(HttpStatus.BAD_REQUEST, ErrorCodes.MissingProperty, "missing Bot property");

            if (conversationParameters.bot.id != activeBot.botId)
                throw ResponseTypes.createAPIException(HttpStatus.BAD_REQUEST, ErrorCodes.BadArgument, "conversationParameters.bot.id doesn't match security bot id");

            let newUsers: IUser[] = [];

            // merge users in
            for (let key in conversationParameters.members) {
                newUsers.push({
                    id: conversationParameters.members[key].id,
                    name: conversationParameters.members[key].name
                });
            }
            getStore().dispatch({
                type: "Users_AddUsers",
                state: { users: newUsers }
            });


            let newConversation = emulator.conversations.newConversation(activeBot.botId, users.usersById[conversationParameters.members[0].id]);
            let activityId: string = null;
            if (conversationParameters.activity != null) {
                // set routing information for new conversation
                conversationParameters.activity.conversation = { id: newConversation.conversationId };
                conversationParameters.activity.from = { id: activeBot.botId };
                conversationParameters.activity.recipient = { id: conversationParameters.members[0].id };

                let response: IResourceResponse = newConversation.postActivityToUser(conversationParameters.activity);
                activityId = response.id;
            }

            var response = ResponseTypes.createConversationResponse(newConversation.conversationId, activityId);
            res.send(HttpStatus.OK, response);
            res.end();
            log.api('createConversation', req, res, conversationParameters, response, getActivityText(conversationParameters.activity));
        } catch (err) {
            var error = ResponseTypes.sendErrorResponse(req, res, next, err);
            log.api('createConversation', req, res, conversationParameters, error, getActivityText(conversationParameters.activity));
        }
    }

    // SendToConversation
    public static sendToConversation = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        let activity = <IGenericActivity>req.body;
        try {
            const parms: IConversationAPIPathParameters = req.params;
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
            let response: IResourceResponse = conversation.postActivityToUser(activity);
            res.send(HttpStatus.OK, response);
            res.end();
            log.api('sendToConversation', req, res, activity, response, getActivityText(activity));
            return;
        } catch (err) {
            let error = ResponseTypes.sendErrorResponse(req, res, next, err);
            log.api('sendToConversation', req, res, activity, error, getActivityText(activity));
        }
    }

    // replyToActivity
    public static replyToActivity = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        let activity = <IGenericActivity>req.body;
        try {
            const parms: IConversationAPIPathParameters = req.params;
            console.log("framework: replyToActivity", JSON.stringify(activity));

            // look up bot
            const activeBot = getSettings().getActiveBot();
            if (!activeBot)
                throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "bot not found");

            activity.replyToId = req.params.activityId;

            // validate conversation
            //if (activity.conversation.id != parms.conversationId)
            //    throw ResponseTypes.createAPIException(HttpStatus.BAD_REQUEST, ErrorCodes.BadArgument, "uri conversation id does not match payload");

            // look up conversation
            const conversation = emulator.conversations.conversationById(activeBot.botId, parms.conversationId);
            if (!conversation)
                throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "conversation not found");

            // if we found the activity to reply to
            //if (!conversation.activities.find((existingActivity, index, obj) => existingActivity.id == activity.replyToId))
            //    throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "replyToId is not a known activity id");

            // post activity
            let response: IResourceResponse = conversation.postActivityToUser(activity);
            res.send(HttpStatus.OK, response);
            res.end();
            log.api('replyToActivity', req, res, activity, response, getActivityText(activity));
            return;
        } catch (err) {
            let error = ResponseTypes.sendErrorResponse(req, res, next, err);
            log.api('replyToActivity', req, res, activity, error, getActivityText(activity));
        }
    }

    // updateActivity
    public static updateActivity = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        let activity = <IGenericActivity>req.body;
        try {
            const parms: IConversationAPIPathParameters = req.params;
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
            let response: IResourceResponse = conversation.updateActivity(activity);
            res.send(HttpStatus.OK, response);
            res.end();
            log.api('updateActivity', req, res, activity, response, getActivityText(activity));
            return;
        } catch (err) {
            let error = ResponseTypes.sendErrorResponse(req, res, next, err);
            log.api('updateActivity', req, res, activity, error, getActivityText(activity));
        }
    }

    // deleteActivity
    public static deleteActivity = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        try {
            const parms: IConversationAPIPathParameters = req.params;
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
            log.api('deleteActivity', req, res);
            return;
        } catch (err) {
            let error = ResponseTypes.sendErrorResponse(req, res, next, err);
            log.api('deleteActivity', req, res, null, error);
        }
    }

    // get members of a conversation
    public static getConversationMembers = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        console.log("framework: getConversationMembers");
        try {
            // look up bot
            const activeBot = getSettings().getActiveBot();
            if (!activeBot)
                throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "bot not found");

            const parms: IConversationAPIPathParameters = req.params;

            // look up conversation
            const conversation = emulator.conversations.conversationById(activeBot.botId, parms.conversationId);
            if (!conversation)
                throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "conversation not found");

            res.send(HttpStatus.OK, conversation.members);
            res.end();
            log.api('getConversationMembers', req, res, null, conversation.members);
        } catch (err) {
            ResponseTypes.sendErrorResponse(req, res, next, err);
            log.api('getConversationMembers', req, res, null, error);
        }
    }

    // get members of an activity
    public static getActivityMembers = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        console.log("framework: getActivityMembers");
        try {
            // look up bot
            const activeBot = getSettings().getActiveBot();
            if (!activeBot)
                throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "bot not found");

            let activity = <IGenericActivity>req.body;
            const parms: IConversationAPIPathParameters = req.params;

            // look up conversation
            const conversation = emulator.conversations.conversationById(activeBot.botId, parms.conversationId);
            if (!conversation)
                throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "conversation not found");

            res.send(HttpStatus.OK, conversation.members);
            res.end();
            log.api('getActivityMembers', req, res, null, conversation.members);
        } catch (err) {
            log.error("BotFramework: getActivityMembers failed: " + err);
            ResponseTypes.sendErrorResponse(req, res, next, err);
        }
    }

    // upload attachment
    public static uploadAttachment = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        console.log("framework: uploadAttachment");
        let attachmentData = <IAttachmentData>req.body;
        try {
            // look up bot
            const activeBot = getSettings().getActiveBot();
            if (!activeBot)
                throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "bot not found");

            const parms: IConversationAPIPathParameters = req.params;

            // look up conversation
            const conversation = emulator.conversations.conversationById(activeBot.botId, parms.conversationId);
            if (!conversation)
                throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "conversation not found");

            let resourceId = AttachmentsController.uploadAttachment(attachmentData);
            let resourceResponse: IResourceResponse = { id: resourceId };
            res.send(HttpStatus.OK, resourceResponse);
            res.end();
            log.api('uploadAttachment', req, res, attachmentData, resourceResponse, attachmentData.name);
        } catch (err) {
            let error = ResponseTypes.sendErrorResponse(req, res, next, err);
            log.api('uploadAttachment', req, res, attachmentData, error, attachmentData.name);
        }
    }
}

function getActivityText(activity: IGenericActivity): string {
    if (activity) {
        if (activity.text.length > 50)
            return activity.text.substring(0, 50) + '...';
        return activity.text;
    }
    return '';
}
