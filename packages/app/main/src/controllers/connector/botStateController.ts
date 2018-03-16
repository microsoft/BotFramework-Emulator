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
import * as HttpStatus from 'http-status-codes';
import * as ResponseTypes from '@bfemulator/app-shared';
import { ErrorCodes, approximateObjectSize } from '@bfemulator/app-shared';
import { RestServer } from '../../restServer';
import { BotFrameworkAuthentication } from '../../botFrameworkAuthentication';
import { jsonBodyParser } from '../../jsonBodyParser';
import { getSettings } from '../../settings';
import { emulator } from '../../emulator';
import { Conversation } from '../../conversationManager';
//import { sendErrorResponse } from '../../utils';
import { getActiveBot } from '../../botHelpers';
import { logRequest, logResponse } from '../../logHelpers';
import * as log from '../../logHelpers';


interface IBotData {
  eTag: string;
  data: any;
}

export class BotStateController {

  private botDataStore: { [key: string]: IBotData } = {};

  private botDataKey(idOfBotRecord: string, channelId: string, conversationId: string, userId: string) {
    return `${idOfBotRecord || '*'}!${channelId || '*'}!${conversationId || '*'}!${userId || '*'}`;
  }

  private logBotStateApiDeprecationWarning(idOfBotRecord: string, conversationId: string) {
    const conversation: Conversation = emulator.conversations.conversationById(idOfBotRecord, conversationId);
    if (conversation && !conversation.stateApiDeprecationWarningShown) {
      conversation.stateApiDeprecationWarningShown = true;
      log.logWarning('Warning: The Bot Framework State API is not recommended for production environments, and may be deprecated in a future release.',
        log.makeExternalLink('Learn how to implement your own storage adapter.', 'https://aka.ms/botframework-state-service'));
    }
  }

  private getBotData(idOfBotRecord: string, channelId: string, conversationId: string, userId: string): IBotData {
    this.logBotStateApiDeprecationWarning(idOfBotRecord, conversationId);
    const key = this.botDataKey(idOfBotRecord, channelId, conversationId, userId);
    return this.botDataStore[key] || {
      data: null, eTag: '*'
    };
  }

  private setBotData(idOfBotRecord: string, channelId: string, conversationId: string, userId: string, incomingData: IBotData): IBotData {
    this.logBotStateApiDeprecationWarning(idOfBotRecord, conversationId);
    const key = this.botDataKey(idOfBotRecord, channelId, conversationId, userId);
    let oldData = this.botDataStore[key];
    if (oldData && oldData.eTag && (oldData.eTag.length > 0) && (incomingData.eTag != '*') && (oldData.eTag != incomingData.eTag)) {
      throw ResponseTypes.createAPIException(HttpStatus.PRECONDITION_FAILED, ErrorCodes.BadArgument, "The data is changed");
    }
    let stateSizeLimit = getSettings().framework.stateSizeLimit;
    if ((stateSizeLimit > 0) && (approximateObjectSize(incomingData) > stateSizeLimit * 1024)) {
      throw ResponseTypes.createAPIException(HttpStatus.BAD_REQUEST, ErrorCodes.MessageSizeTooBig, "State size exceeded configured limit.");
    }
    let newData: IBotData = {
      eTag: new Date().getTime().toString(),
      data: incomingData.data
    };
    if (!incomingData.data) {
      delete this.botDataStore[key];
      newData.eTag = '*';
    } else {
      this.botDataStore[key] = newData;
    }
    return newData;
  }

  public static registerRoutes(server: RestServer, auth: BotFrameworkAuthentication) {
    let controller = new BotStateController();
    server.router.get('/v3/botstate/:channelId/users/:userId', auth.verifyBotFramework, controller.getUserData);
    server.router.get('/v3/botstate/:channelId/conversations/:conversationId', auth.verifyBotFramework, controller.getConversationData);
    server.router.get('/v3/botstate/:channelId/conversations/:conversationId/users/:userId', auth.verifyBotFramework, controller.getPrivateConversationData);
    server.router.post('/v3/botstate/:channelId/users/:userId', [auth.verifyBotFramework], jsonBodyParser(), [controller.setUserData]);
    server.router.post('/v3/botstate/:channelId/conversations/:conversationId', [auth.verifyBotFramework], jsonBodyParser(), [controller.setConversationData]);
    server.router.post('/v3/botstate/:channelId/conversations/:conversationId/users/:userId', [auth.verifyBotFramework], jsonBodyParser(), [controller.setPrivateConversationData]);
    server.router.del('/v3/botstate/:channelId/users/:userId', auth.verifyBotFramework, controller.deleteStateForUser);
  }

  // Get USER Data
  public getUserData = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
    logRequest(req.params.conversationId, "bot", req, "getUserData");
    try {
      // FIX: This is not going to work for multiple bots!
      const activeBot = getActiveBot();
      if (!activeBot) {
        throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "bot not found");
      }
      const botData = this.getBotData(activeBot.id, req.params.channelId, req.params.conversationId, req.params.userId);
      res.send(HttpStatus.OK, botData);
      res.end();
      //log.api('getUserData', req, res, req.params, botData);
    } catch (err) {
      //var error = sendErrorResponse(req, res, next, err);
      //log.api('getUserData', req, res, req.params, error);
    }
    logResponse(req.params.conversationId, "bot", res, "getUserData");
  }

  // Get Conversation Data
  public getConversationData = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
    logRequest(req.params.conversationId, "bot", req, "getConversationData");
    try {
      const activeBot = getActiveBot();
      if (!activeBot) {
        throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "bot not found");
      }
      const botData = this.getBotData(activeBot.id, req.params.channelId, req.params.conversationId, req.params.userId);
      res.send(HttpStatus.OK, botData);
      res.end();
      //log.api('getConversationData', req, res, req.params, botData);
    } catch (err) {
     // var error = sendErrorResponse(req, res, next, err);
      //log.api('getConversationData', req, res, req.params, error);
    }
    logResponse(req.params.conversationId, "bot", res, "getConversationData");
  }

  // Get PrivateConversation Data
  public getPrivateConversationData = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
    logRequest(req.params.conversationId, "bot", req, "getPrivateConversationData");
    try {
      const activeBot = getActiveBot();
      if (!activeBot) {
        throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "bot not found");
      }
      const botData = this.getBotData(activeBot.id, req.params.channelId, req.params.conversationId, req.params.userId);
      res.send(HttpStatus.OK, botData);
      res.end();
      //log.api('getPrivateConversationData', req, res, req.params, botData);
    } catch (err) {
      //var error = sendErrorResponse(req, res, next, err);
      //log.api('getPrivateConversationData', req, res, req.params, error);
    }
    logResponse(req.params.conversationId, "bot", res, "getPrivateConversationData");
  }

  // Set User Data
  public setUserData = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
    logRequest(req.params.conversationId, "bot", req, "setUserData");
    let botData;
    try {
      const activeBot = getActiveBot();
      if (!activeBot) {
        throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "bot not found");
      }
      botData = this.setBotData(activeBot.id, req.params.channelId, req.params.conversationId, req.params.userId, req.body as IBotData);
      res.send(HttpStatus.OK, botData);
      res.end();
      //log.api('setUserData', req, res, { key: req.params, state: req.body }, botData);
    } catch (err) {
      //var error = sendErrorResponse(req, res, next, err);
      //log.api('setUserData', req, res, { key: req.params, state: req.body }, error);
    }
    logResponse(req.params.conversationId, "bot", res, "setUserData");
  }

  // set conversation data
  public setConversationData = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
    logRequest(req.params.conversationId, "bot", req, "setConversationData");
    try {
      const activeBot = getActiveBot();
      if (!activeBot) {
        throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "bot not found");
      }
      const botData = this.setBotData(activeBot.id, req.params.channelId, req.params.conversationId, req.params.userId, req.body);
      res.send(HttpStatus.OK, botData);
      res.end();
      //log.api('setConversationData', req, res, { key: req.params, state: req.body }, botData);
    } catch (err) {
      //var error = sendErrorResponse(req, res, next, err);
      //log.api('setConversationData', req, res, { key: req.params, state: req.body }, error);
    }
    logResponse(req.params.conversationId, "bot", res, "setConversationData");
  }

  // set private conversation data
  public setPrivateConversationData = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
    logRequest(req.params.conversationId, "bot", req, "setPrivateConversationData");
    try {
      const activeBot = getActiveBot();
      if (!activeBot) {
        throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "bot not found");
      }
      const botData = this.setBotData(activeBot.id, req.params.channelId, req.params.conversationId, req.params.userId, req.body);
      res.send(HttpStatus.OK, botData);
      res.end();
      //log.api('setPrivateConversationData', req, res, { key: req.params, state: req.body }, botData);
    } catch (err) {
      //var error = sendErrorResponse(req, res, next, err);
      //log.api('setPrivateConversationData', req, res, { key: req.params, state: req.body }, error);
    }
    logResponse(req.params.conversationId, "bot", res, "setPrivateConversationData");
  }

  // delete state for user
  public deleteStateForUser = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
    logRequest(req.params.conversationId, "bot", req, "deleteStateForUser");
    try {
      const activeBot = getActiveBot();
      if (!activeBot) {
        throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "bot not found");
      }

      let keys = Object.keys(this.botDataStore);
      for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        if (key.startsWith(`${activeBot.id}!`) && key.endsWith(`!${req.params.userId}`)) {
          delete this.botDataStore[key];
        }
      }
      res.send(HttpStatus.OK);
      res.end();
      //log.api('deleteStateForUser', req, res, req.params, null);
    } catch (err) {
     // var error = sendErrorResponse(req, res, next, err);
      //log.api('deleteStateForUser', req, res, req.params, error);
    }
    logResponse(req.params.conversationId, "bot", res, "deleteStateForUser");
  }
}
