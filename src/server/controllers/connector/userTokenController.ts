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
import * as log from '../../log';
import { ErrorCodes } from '../../../types/responseTypes';
import { RestServer } from '../../restServer';
import { BotFrameworkAuthentication } from '../../botFrameworkAuthentication';
import { getSettings } from '../../settings';
import { OAuthLinkEncoder } from '../../../shared/oauthLinkEncoder'
import { getConversation } from '../emulator/emulatorController';
import { jsonBodyParser } from '../../jsonBodyParser';
//import { uniqueId } from '../../../shared/utils';
//var shajs = require('sha.js');

interface ITokenResponse {
    token: string;
    connectionName: string;
}

interface ITokenParams {
    userId: string;
    connectionName: string;
}

interface IGetTokenParams extends ITokenParams {
    code: string;
}

export class UserTokenController {
    private static tokenStore: { [key: string]: ITokenResponse } = {};

    public static registerRoutes(server: RestServer, auth: BotFrameworkAuthentication) {
        let controller = new UserTokenController();
        server.router.get('/api/usertoken/GetToken', auth.verifyBotFramework, controller.getToken);
        server.router.post('/api/usertoken/emulateOAuthCards', auth.verifyBotFramework, controller.emulateOAuthCards);
        server.router.del('/api/usertoken/SignOut', auth.verifyBotFramework, controller.signOut);
        server.router.post('/api/usertoken/tokenResponse', jsonBodyParser(), controller.tokenResponse);
    }

    public getToken = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        try {
            const activeBot = getSettings().getActiveBot();
            if (!activeBot) {
                throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "bot not found");
            }

            let params: IGetTokenParams = req.params;

            let tokenResponse: ITokenResponse = UserTokenController.getTokenFromCache(activeBot.botId, params.userId, params.connectionName);
            if (tokenResponse) {
                res.send(HttpStatus.OK, tokenResponse);
            } else {
                res.send(HttpStatus.NOT_FOUND); 
            }

            res.end();
            log.api('getToken', req, res, req.params, tokenResponse);
        } catch (err) {
            var error = ResponseTypes.sendErrorResponse(req, res, next, err);
            log.api('getToken', req, res, req.params, error);
        }
    }

    public emulateOAuthCards = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        try {
            let emulate: string = req.params['emulate'];
            if (emulate) {
                OAuthLinkEncoder.EmulateOAuthCards = (emulate.toLowerCase() === 'true');
            } else {
                OAuthLinkEncoder.EmulateOAuthCards = false;
            }
            res.send(HttpStatus.OK);
            
            res.end();
            log.api('emulateOAuthCards', req, res, req.params, emulate);
        } catch (err) {
            var error = ResponseTypes.sendErrorResponse(req, res, next, err);
            log.api('emulateOAuthCards', req, res, req.params, error);
        }
    }

    public signOut = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        try {
            const activeBot = getSettings().getActiveBot();
            if (!activeBot) {
                throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "bot not found");
            }

            let params: ITokenParams = req.params;
            UserTokenController.deleteTokenFromCache(activeBot.botId, params.userId, params.connectionName);

            res.send(HttpStatus.OK);
            res.end();
            log.api('deleteToken', req, res, req.params, params);
        } catch (err) {
            var error = ResponseTypes.sendErrorResponse(req, res, next, err);
            log.api('deleteToken', req, res, req.params, error);
        }
    }

    public tokenResponse = (req: Restify.Request, res: Restify.Response, next: Restify.Next): any => {
        try {
            const conversation = getConversation(req.params.conversationId);
            const body: {
                token: string,
                connectionName: string } = req.body;

            conversation.sendTokenResponse(body.connectionName, body.token, (statusCode, body) => {
                if (statusCode === HttpStatus.OK) {
                    res.send(HttpStatus.OK);
                } else {
                    res.send(statusCode);
                }
                res.end();
            }, false);

            log.api('tokenResponse', req, res, req.params, req.body);
        } catch (err) {
            var error = ResponseTypes.sendErrorResponse(req, res, next, err);
            log.api('tokenResponse', req, res, req.params, error);
        }
    }

    public static addTokenToCache(botId: string, userId: string, connectionName: string, token: string) {
        this.tokenStore[this.tokenKey(botId, userId, connectionName)] = {
            connectionName: connectionName,
            token: token
        };
    }

    public static getTokenFromCache(botId: string, userId: string, connectionName: string): ITokenResponse {
        return this.tokenStore[this.tokenKey(botId, userId, connectionName)];
    }

    public static deleteTokenFromCache(botId: string, userId: string, connectionName: string) {
        delete this.tokenStore[this.tokenKey(botId, userId, connectionName)];
    }

    private static tokenKey(botId: string, userId: string, connectionName: string): string {
        return `${botId}_${userId}_${connectionName}`;
    }
}
