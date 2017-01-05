//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

import * as Restify from 'restify';
import { IGenericActivity, IConversationParameters } from '../../../types/activityTypes';
import { IUser } from '../../../types/userTypes';
import { getSettings, getStore } from '../../settings';
import { Emulator, emulator } from '../../emulator';
import { uniqueId } from '../../../utils';
import * as HttpStatus from "http-status-codes";
import * as ResponseTypes from '../../../types/responseTypes';
import { ErrorCodes, IResourceResponse, IErrorResponse } from '../../../types/responseTypes';
import { IAttachmentData, IAttachmentInfo, IAttachmentView } from '../../../types/attachmentTypes';
import { AttachmentsController } from './attachmentsController';
import * as log from '../../log';
import { RestServer } from '../../restServer';
import { BotFrameworkAuthentication } from '../../botFrameworkAuthentication';
import { error } from '../../log';
import { jsonBodyParser } from '../../jsonBodyParser';


interface IConversationAPIPathParameters {
    conversationId: string;
    activityId: string;
}

export class ConversationsController {

    public static registerRoutes(server: RestServer, auth: BotFrameworkAuthentication) {
        server.router.post('/v3/conversations', [auth.verifyBotFramework], jsonBodyParser(), [this.createConversation]);
        server.router.post('/v3/conversations/:conversationId/activities', [auth.verifyBotFramework], jsonBodyParser(), [this.sendToConversation]);
        server.router.post('/v3/conversations/:conversationId/activities/:activityId', [auth.verifyBotFramework], jsonBodyParser(), [this.replyToActivity]);
        server.router.put('/v3/conversations/:conversationId/activities/:activityId', [auth.verifyBotFramework], jsonBodyParser(), [this.updateActivity]);
        server.router.del('/v3/conversations/:conversationId/activities/:activityId', auth.verifyBotFramework, this.deleteActivity);
        server.router.get('/v3/conversations/:conversationId/members', auth.verifyBotFramework, this.getConversationMembers);
        server.router.get('/v3/conversations/:conversationId/activities/:activityId/members', auth.verifyBotFramework, this.getActivityMembers);
        server.router.post('/v3/conversations/:conversationId/attachments', [auth.verifyBotFramework], jsonBodyParser(), [this.uploadAttachment]);
    }

    // Create conversation API
    public static createConversation = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        let conversationParameters = <IConversationParameters>req.body;
        try {
            console.log("framework: newConversation");

            const settings = getSettings();
            // look up bot
            const activeBot = settings.getActiveBot();
            if (!activeBot)
                throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "bot not found");

            const users = settings.users;
            if (conversationParameters.members == null)
                throw ResponseTypes.createAPIException(HttpStatus.BAD_REQUEST, ErrorCodes.MissingProperty, "members missing");

            if (conversationParameters.members.length != 1)
                throw ResponseTypes.createAPIException(HttpStatus.BAD_REQUEST, ErrorCodes.BadSyntax, "Emulator only supports creating conversation with 1 user");

            if (conversationParameters.members[0].id !== settings.users.currentUserId)
                throw ResponseTypes.createAPIException(HttpStatus.BAD_REQUEST, ErrorCodes.BadSyntax, "Emulator only supports creating conversation with the current user");

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

            let newConversation;
            if (conversationParameters.conversationId) {
                newConversation = emulator.conversations.conversationById(activeBot.botId, conversationParameters.conversationId);
            }
            if (!newConversation) {
                newConversation = emulator.conversations.newConversation(activeBot.botId, users.usersById[conversationParameters.members[0].id], conversationParameters.conversationId);
            }
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

            // Tell the client side to start a new conversation.
            Emulator.send('new-conversation', newConversation.conversationId);
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

            // look up conversation
            const conversation = emulator.conversations.conversationById(activeBot.botId, parms.conversationId);
            if (!conversation)
                throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "conversation not found");

            // post activity
            let response: IResourceResponse = conversation.postActivityToUser(activity);
            res.send(HttpStatus.OK, response);
            res.end();
            log.api(`Send[${activity.type}]`, req, res, activity, response, getActivityText(activity));
        } catch (err) {
            let error = ResponseTypes.sendErrorResponse(req, res, next, err);
            log.api(`Send[${activity.type}]`, req, res, activity, error, getActivityText(activity));
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
            log.api(`Reply[${activity.type}]`, req, res, activity, response, getActivityText(activity));
        } catch (err) {
            let error = ResponseTypes.sendErrorResponse(req, res, next, err);
            log.api(`Reply[${activity.type}]`, req, res, activity, error, getActivityText(activity));
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
            log.api(`Update[${activity.id}]`, req, res, activity, response, getActivityText(activity));
        } catch (err) {
            let error = ResponseTypes.sendErrorResponse(req, res, next, err);
            log.api(`Update[${activity.id}]`, req, res, activity, error, getActivityText(activity));
        }
    }

    // deleteActivity
    public static deleteActivity = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        const parms: IConversationAPIPathParameters = req.params;
        try {
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
            log.api(`DeleteActivity(${parms.activityId})`, req, res);
        } catch (err) {
            let error = ResponseTypes.sendErrorResponse(req, res, next, err);
            log.api(`DeleteActivity(${parms.activityId})`, req, res, null, error);
        }
    }

    // get members of a conversation
    public static getConversationMembers = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        console.log("framework: getConversationMembers");
        const parms: IConversationAPIPathParameters = req.params;
        try {
            // look up bot
            const activeBot = getSettings().getActiveBot();
            if (!activeBot)
                throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "bot not found");


            // look up conversation
            const conversation = emulator.conversations.conversationById(activeBot.botId, parms.conversationId);
            if (!conversation)
                throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "conversation not found");

            res.send(HttpStatus.OK, conversation.members);
            res.end();
            log.api(`GetConversationMembers(${parms.conversationId})`, req, res, null, conversation.members);
        } catch (err) {
            ResponseTypes.sendErrorResponse(req, res, next, err);
            log.api(`GetConversationMembers(${parms.conversationId})`, req, res, null, error);
        }
    }

    // get members of an activity
    public static getActivityMembers = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        console.log("framework: getActivityMembers");
        const parms: IConversationAPIPathParameters = req.params;
        try {
            // look up bot
            const activeBot = getSettings().getActiveBot();
            if (!activeBot)
                throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "bot not found");

            let activity = <IGenericActivity>req.body;

            // look up conversation
            const conversation = emulator.conversations.conversationById(activeBot.botId, parms.conversationId);
            if (!conversation)
                throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "conversation not found");

            res.send(HttpStatus.OK, conversation.members);
            res.end();
            log.api(`GetActivityMembers(${parms.activityId})`, req, res, null, conversation.members);
        } catch (err) {
            let error = ResponseTypes.sendErrorResponse(req, res, next, err);
            log.error(`GetActivityMembers(${parms.activityId})`, req, res, null, error);
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
            log.api('UploadAttachment()', req, res, attachmentData, resourceResponse, attachmentData.name);
        } catch (err) {
            let error = ResponseTypes.sendErrorResponse(req, res, next, err);
            log.api('UploadAttachment()', req, res, attachmentData, error, attachmentData.name);
        }
    }
}

function getActivityText(activity: IGenericActivity): string {
    if (activity) {
        if (activity.attachments && activity.attachments.length > 0)
            return activity.attachments[0].contentType;
        else {
            if (activity.text.length > 50)
                return activity.text.substring(0, 50) + '...';

            return activity.text;
        }
    }
    return '';
}
