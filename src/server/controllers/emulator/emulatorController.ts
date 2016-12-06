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
import { getSettings, getStore } from '../../settings';
import { emulator } from '../../emulator';
import { RestServer } from '../../restServer';
import { jsonBodyParser } from '../../jsonBodyParser';
import * as ResponseTypes from '../../../types/responseTypes';
import { ErrorCodes, IResourceResponse, IErrorResponse } from '../../../types/responseTypes';
import { IChannelAccount } from '../../../types/accountTypes';
import { IBot } from '../../../types/botTypes';
import { Conversation } from '../../conversationManager';


function getConversation(conversationId: string): Conversation {
    const settings = getSettings();
    const activeBot = settings.getActiveBot();
    if (!activeBot) {
        throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "bot not found");
    }
    const conversation = emulator.conversations.conversationById(activeBot.botId, conversationId);
    if (!conversation) {
        throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "conversation not found");
    }
    return conversation;
}


export class EmulatorController {
    public static registerRoutes(server: RestServer) {
        server.router.get('/emulator/:conversationId/users', this.getUsers);
        server.router.post('/emulator/:conversationId/users', jsonBodyParser(), this.addUsers);
        server.router.del('/emulator/:conversationId/users', this.removeUsers);
        server.router.post('/emulator/:conversationId/contacts', this.contactAdded);
        server.router.del('/emulator/:conversationId/contacts', this.contactRemoved);
        server.router.post('/emulator/:conversationId/typing', this.typing);
        server.router.post('/emulator/:conversationId/ping', this.ping);
        server.router.del('/emulator/:conversationId/userdata', this.deleteUserData);
    }

    static getUsers = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        try {
            const conversation = getConversation(req.params.conversationId);
            res.json(HttpStatus.OK, conversation.members);
            res.end();
        } catch (err) {
            ResponseTypes.sendErrorResponse(req, res, next, err);
        }
    }

    static addUsers = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        try {
            const conversation = getConversation(req.params.conversationId);
            const members: IChannelAccount[] = req.body;
            members.forEach((member) => {
                conversation.addMember(member.id, member.name);
            });
            res.send(HttpStatus.OK);
            res.end();
        } catch (err) {
            ResponseTypes.sendErrorResponse(req, res, next, err);
        }
    }

    static removeUsers = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        try {
            let conversation = getConversation(req.params.conversationId);
            let members: IChannelAccount[] = req.body;
            if (!members) {
                let settings = getSettings();
                members = [...conversation.members];
                members = members.filter(member => member.id != settings.users.currentUserId && member.id != conversation.botId);
                members = members.slice(0);
            }
            members.forEach((member) => {
                conversation.removeMember(member.id);
            });
            res.send(HttpStatus.OK);
            res.end();
        } catch (err) {
            ResponseTypes.sendErrorResponse(req, res, next, err);
        }
    }

    static contactAdded = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        try {
            const conversation = getConversation(req.params.conversationId);
            conversation.sendContactAdded();
            res.send(HttpStatus.OK);
            res.end();
        } catch (err) {
            ResponseTypes.sendErrorResponse(req, res, next, err);
        }
    }

    static contactRemoved = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        try {
            const conversation = getConversation(req.params.conversationId);
            conversation.sendContactRemoved();
            res.send(HttpStatus.OK);
            res.end();
        } catch (err) {
            ResponseTypes.sendErrorResponse(req, res, next, err);
        }
    }

    static typing = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        try {
            const conversation = getConversation(req.params.conversationId);
            conversation.sendTyping();
            res.send(HttpStatus.OK);
            res.end();
        } catch (err) {
            ResponseTypes.sendErrorResponse(req, res, next, err);
        }
    }

    static ping = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        try {
            const conversation = getConversation(req.params.conversationId);
            conversation.sendPing();
            res.send(HttpStatus.OK);
            res.end();
        } catch (err) {
            ResponseTypes.sendErrorResponse(req, res, next, err);
        }
    }

    static deleteUserData = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        try {
            const conversation = getConversation(req.params.conversationId);
            conversation.sendDeleteUserData();
            res.send(HttpStatus.OK);
            res.end();
        } catch (err) {
            ResponseTypes.sendErrorResponse(req, res, next, err);
        }
    }
}
