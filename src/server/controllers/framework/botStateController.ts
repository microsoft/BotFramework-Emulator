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
import * as HttpStatus from "http-status-codes";
import * as ResponseTypes from '../../../types/responseTypes';
import { ErrorCodes, IResourceResponse, IErrorResponse } from '../../../types/responseTypes';
import { RestServer } from '../../restServer';
import { BotFrameworkAuthentication } from '../../botFrameworkAuthentication';
import { jsonBodyParser } from '../../jsonBodyParser';


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
        try {
            const botData = this.getBotData(req.params.channelId, req.params.conversationId, req.params.userId);
            res.send(HttpStatus.OK, botData);
            res.end();
        } catch (err) {
            ResponseTypes.sendErrorResponse(req, res, next, err);
        }
    }

    // Get Conversation Data
    public getConversationData = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        try {
            const botData = this.getBotData(req.params.channelId, req.params.conversationId, req.params.userId);
            res.send(HttpStatus.OK, botData);
            res.end();
        } catch (err) {
            ResponseTypes.sendErrorResponse(req, res, next, err);
        }
    }

    // Get PrivateConversation Data
    public getPrivateConversationData = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        try {
            const botData = this.getBotData(req.params.channelId, req.params.conversationId, req.params.userId);
            res.send(HttpStatus.OK, botData);
            res.end();
        } catch (err) {
            ResponseTypes.sendErrorResponse(req, res, next, err);
        }
    }

    // Set User Data
    public setUserData = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        try {
            let newBotData = this.setBotData(req.params.channelId, req.params.conversationId, req.params.userId, req.body as IBotData);
            res.send(HttpStatus.OK, newBotData);
            res.end();
        } catch (err) {
            ResponseTypes.sendErrorResponse(req, res, next, err);
        }
    }

    // set conversation data
    public setConversationData = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        try {
            let newBotData = this.setBotData(req.params.channelId, req.params.conversationId, req.params.userId, req.body);
            res.send(HttpStatus.OK, newBotData);
            res.end();
        } catch (err) {
            ResponseTypes.sendErrorResponse(req, res, next, err);
        }
    }

    // set private conversation data
    public setPrivateConversationData = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        try {
            let newBotData = this.setBotData(req.params.channelId, req.params.conversationId, req.params.userId, req.body);
            res.send(HttpStatus.OK, newBotData);
            res.end();
        } catch (err) {
            ResponseTypes.sendErrorResponse(req, res, next, err);
        }
    }

    // delete state for user
    public deleteStateForUser = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
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
