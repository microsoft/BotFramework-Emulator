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
import { IGenericActivity, IConversationParameters, IUser, ErrorCodes, IResourceResponse, IAttachmentData } from 'botframework-emulator-shared';
import * as HttpStatus from 'http-status-codes';
import * as ResponseTypes from 'botframework-emulator-shared';
import { getSettings, getStore } from '../../settings';
import { emulator } from '../../emulator';
import { AttachmentsController } from './attachmentsController';
import { RestServer } from '../../restServer';
import { BotFrameworkAuthentication } from '../../botFrameworkAuthentication';
import { jsonBodyParser } from '../../jsonBodyParser';
import { VersionManager } from '../../versionManager';
import { sendErrorResponse } from '../../utils';
import { logRequest, logResponse } from '../../logHelpers';
import { getActiveBot } from '../../botHelpers';
import { getActivityText, getErrorText } from '../../activityHelpers';

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
    logRequest(conversationParameters.conversationId, "bot", req);
    try {
      const settings = getSettings();
      // look up bot
      const activeBot = getActiveBot();
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

      if (conversationParameters.bot.id != activeBot.id)
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
        newConversation = emulator.conversations.conversationById(activeBot.id, conversationParameters.conversationId);
      }
      if (!newConversation) {
        newConversation = emulator.conversations.newConversation(activeBot.id, users.usersById[conversationParameters.members[0].id], conversationParameters.conversationId);
      }
      let activityId: string = null;
      if (conversationParameters.activity != null) {
        // set routing information for new conversation
        conversationParameters.activity.conversation = { id: newConversation.conversationId };
        conversationParameters.activity.from = { id: activeBot.id };
        conversationParameters.activity.recipient = { id: conversationParameters.members[0].id };

        let response: IResourceResponse = newConversation.postActivityToUser(conversationParameters.activity);
        activityId = response.id;
      }

      var response = ResponseTypes.createConversationResponse(newConversation.conversationId, activityId);
      res.send(HttpStatus.OK, response);
      res.end();
      //logNetwork(newConversation.conversationId, req, res, getActivityText(conversationParameters.activity));
    } catch (err) {
      sendErrorResponse(req, res, next, err);
      //logNetwork(conversationParameters.conversationId, req, res, getErrorText(err));
    }
    logResponse(conversationParameters.conversationId, "bot", res);
  }

  // SendToConversation
  public static sendToConversation = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
    let activity = <IGenericActivity>req.body;
    const conversationParameters: IConversationAPIPathParameters = req.params;
    logRequest(conversationParameters.conversationId, "bot", req);
    try {
      // look up bot
      const activeBot = getActiveBot();
      if (!activeBot)
        throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "bot not found");

      activity.id = null;
      activity.replyToId = req.params.activityId;

      // look up conversation
      const conversation = emulator.conversations.conversationById(activeBot.id, conversationParameters.conversationId);
      if (!conversation)
        throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "conversation not found");

      // post activity
      let response: IResourceResponse = conversation.postActivityToUser(activity);
      res.send(HttpStatus.OK, response);
      res.end();
      //logNetwork(parms.conversationId, req, res, getActivityText(activity));
    } catch (err) {
      sendErrorResponse(req, res, next, err);
      //logNetwork(parms.conversationId, req, res, getErrorText(err));
    }
    logResponse(conversationParameters.conversationId, "bot", res);
  }

  // replyToActivity
  public static replyToActivity = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
    let activity = <IGenericActivity>req.body;
    const conversationParameters: IConversationAPIPathParameters = req.params;
    logRequest(conversationParameters.conversationId, "bot", req);
    try {
      // look up bot
      const activeBot = getActiveBot();
      if (!activeBot)
        throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "bot not found");

      VersionManager.checkVersion(req.header("User-agent"));

      activity.id = null;
      activity.replyToId = req.params.activityId;

      // look up conversation
      const conversation = emulator.conversations.conversationById(activeBot.id, conversationParameters.conversationId);
      if (!conversation)
        throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "conversation not found");

      // if we found the activity to reply to
      //if (!conversation.activities.find((existingActivity, index, obj) => existingActivity.id == activity.replyToId))
      //    throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "replyToId is not a known activity id");

      // post activity
      let response: IResourceResponse = conversation.postActivityToUser(activity);
      res.send(HttpStatus.OK, response);
      res.end();
      //logNetwork(parms.conversationId, req, res, getActivityText(activity));
    } catch (err) {
      sendErrorResponse(req, res, next, err);
      //logNetwork(parms.conversationId, req, res, getErrorText(err));
    }
    logResponse(conversationParameters.conversationId, "bot", res);
  }

  // updateActivity
  public static updateActivity = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
    let activity = <IGenericActivity>req.body;
    const conversationParameters: IConversationAPIPathParameters = req.params;
    logRequest(conversationParameters.conversationId, "bot", req);
    try {
      // look up bot
      const activeBot = getActiveBot();
      if (!activeBot)
        throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "bot not found");

      activity.replyToId = req.params.activityId;

      if (activity.id != conversationParameters.activityId)
        throw ResponseTypes.createAPIException(HttpStatus.BAD_REQUEST, ErrorCodes.BadArgument, "uri activity id does not match payload activity id");

      // look up conversation
      const conversation = emulator.conversations.conversationById(activeBot.id, conversationParameters.conversationId);
      if (!conversation)
        throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "conversation not found");

      // post activity
      let response: IResourceResponse = conversation.updateActivity(activity);
      res.send(HttpStatus.OK, response);
      res.end();
      //logNetwork(parms.conversationId, req, res, activity, getActivityText(activity));
    } catch (err) {
      sendErrorResponse(req, res, next, err);
      //logNetwork(parms.conversationId, req, res, activity, getErrorText(err));
    }
    logResponse(conversationParameters.conversationId, "bot", res);
  }

  // deleteActivity
  public static deleteActivity = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
    const conversationParameters: IConversationAPIPathParameters = req.params;
    logRequest(conversationParameters.conversationId, "bot", req);
    try {
      // look up bot
      const activeBot = getActiveBot();
      if (!activeBot)
        throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "bot not found");

      // look up conversation
      const conversation = emulator.conversations.conversationById(activeBot.id, conversationParameters.conversationId);
      if (!conversation)
        throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "conversation not found");

      conversation.deleteActivity(conversationParameters.activityId);

      res.send(HttpStatus.OK);
      res.end();
      //logNetwork(parms.conversationId, req, res);
    } catch (err) {
      sendErrorResponse(req, res, next, err);
      //logNetwork(parms.conversationId, req, res, getErrorText(error));
    }
    logResponse(conversationParameters.conversationId, "bot", res);
  }

  // get members of a conversation
  public static getConversationMembers = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
    const conversationParameters: IConversationAPIPathParameters = req.params;
    logRequest(conversationParameters.conversationId, "bot", req);
    try {
      // look up bot
      const activeBot = getActiveBot();
      if (!activeBot)
        throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "bot not found");

      // look up conversation
      const conversation = emulator.conversations.conversationById(activeBot.id, conversationParameters.conversationId);
      if (!conversation)
        throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "conversation not found");

      res.send(HttpStatus.OK, conversation.members);
      res.end();
      //logNetwork(parms.conversationId, req, res, conversation.members);
    } catch (err) {
      sendErrorResponse(req, res, next, err);
      //logNetwork(parms.conversationId, req, res, null, getErrorText(err));
    }
    logResponse(conversationParameters.conversationId, "bot", res);
  }

  // get members of an activity
  public static getActivityMembers = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
    const conversationParameters: IConversationAPIPathParameters = req.params;
    logRequest(conversationParameters.conversationId, "bot", req);
    try {
      // look up bot
      const activeBot = getActiveBot();
      if (!activeBot)
        throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "bot not found");

      // look up conversation
      const conversation = emulator.conversations.conversationById(activeBot.id, conversationParameters.conversationId);
      if (!conversation)
        throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "conversation not found");

      res.send(HttpStatus.OK, conversation.members);
      res.end();
      //logNetwork(parms.conversationId, req, res, conversation.members);
    } catch (err) {
      sendErrorResponse(req, res, next, err);
      //logNetwork(parms.conversationId, req, res, getErrorText(err));
    }
    logResponse(conversationParameters.conversationId, "bot", res);
  }

  // upload attachment
  public static uploadAttachment = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
    let attachmentData = <IAttachmentData>req.body;
    const conversationParameters: IConversationAPIPathParameters = req.params;
    logRequest(conversationParameters.conversationId, "bot", req);
    try {
      // look up bot
      const activeBot = getActiveBot();
      if (!activeBot)
        throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "bot not found");

      // look up conversation
      const conversation = emulator.conversations.conversationById(activeBot.id, conversationParameters.conversationId);
      if (!conversation)
        throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "conversation not found");

      let resourceId = AttachmentsController.uploadAttachment(attachmentData);
      let resourceResponse: IResourceResponse = { id: resourceId };
      res.send(HttpStatus.OK, resourceResponse);
      res.end();
      //logNetwork(parms.conversationId, req, res, attachmentData.name);
    } catch (err) {
      sendErrorResponse(req, res, next, err);
      //logNetwork(parms.conversationId, req, res, getErrorText(err));
    }
    logResponse(conversationParameters.conversationId, "bot", res);
  }
}
