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

import * as request from 'request';
import * as http from 'http';
import * as ngrok from './ngrok';
import { IUser } from '../types/userTypes';
import { IConversationAccount } from '../types/accountTypes';
import { IActivity, IConversationUpdateActivity, IMessageActivity, IContactRelationUpdateActivity, ITypingActivity } from '../types/activityTypes';
import { uniqueId } from '../utils';
import { dispatch, getSettings, authenticationSettings, v30AuthenticationSettings, addSettingsListener } from './settings';
import { Settings } from '../types/serverSettingsTypes';
import * as jwt from 'jsonwebtoken';
import * as oid from './OpenIdMetadata';
import * as HttpStatus from "http-status-codes";
import * as ResponseTypes from '../types/responseTypes';
import { ErrorCodes, IResourceResponse, IErrorResponse } from '../types/responseTypes';
import { emulator } from './emulator';
import * as log from './log';
import * as utils from '../utils';
import { usersDefault } from '../types/serverSettingsTypes';
import * as moment from 'moment';

/**
 * Stores and propagates conversation messages.
 */
export class Conversation {
    private accessToken: string;
    private accessTokenExpires: number;

    constructor(botId: string, conversationId: string, user: IUser) {
        this.botId = botId;
        this.conversationId = conversationId;
        this.members.push({ id: botId, name: "Bot" });
        this.members.push({ id: user.id, name: user.name });
    }

    // the botId this conversation is with
    public botId: string;

    // the id for this conversation
    public conversationId: string;

    // the list of activities in this conversation
    public activities: IActivity[] = [];

    public members: IUser[] = [];

    getCurrentUser() {
        const users = getSettings().users;
        let currentUser = users.usersById[users.currentUserId];
        // TODO: This is a band-aid until state system cleanup
        if (!currentUser) {
            currentUser = usersDefault.usersById['default-user'];
            dispatch({
                type: 'Users_SetCurrentUser',
                state: {
                    user: currentUser
                }
            })
        }
        return currentUser;
    }

    private postage(recipientId: string, activity: IActivity) {
        const date = moment();
        activity.id = activity.id || uniqueId();
        activity.channelId = 'emulator';
        activity.timestamp = date.toISOString();
        activity.localTimestamp = date.format();
        activity.recipient = { id: recipientId };
        activity.conversation = { id: this.conversationId };
    }


    /**
     * Sends the activity to the conversation's bot.
     */
    postActivityToBot(activity: IActivity, recordInConversation: boolean, cb?) {
        // Do not make a shallow copy here before modifying
        this.postage(this.botId, activity);
        activity.from = this.getCurrentUser();
        if (!activity.recipient.name) {
            activity.recipient.name = "Bot";
        }
        const bot = getSettings().botById(this.botId);
        if (bot) {
            // bypass ngrok url for localhost because ngrok will rate limit
            if (utils.isLocalhostUrl(bot.botUrl))
                activity.serviceUrl = emulator.framework.localhostServiceUrl;
            else
                activity.serviceUrl = emulator.framework.serviceUrl;

            let options: request.OptionsWithUrl = {
                url: bot.botUrl,
                method: "POST",
                json: activity,
                agent: emulator.proxyAgent
            };

            let responseCallback = (err, resp: http.IncomingMessage, body) => {
                let messageActivity: IMessageActivity = activity;
                let text = messageActivity.text || '';
                if (text && text.length > 50)
                    text = text.substring(0, 50);

                if (err) {
                    log.error(
                        '->',
                        log.makeInspectorLink("POST", activity),
                        err.message);
                } else if (resp) {
                    if (!/^2\d\d$/.test(`${resp.statusCode}`)) {
                        log.error(
                            '->',
                            log.makeInspectorLink("POST", activity),
                            log.makeInspectorLink(`${resp.statusCode}`, body, `(${resp.statusMessage})`),
                            `[${activity.type}]`,
                            text);
                        if(Number(resp.statusCode) == 401 || Number(resp.statusCode) == 402) {
                            log.error("Error: The bot's MSA appId or passsword is incorrect.");
                            log.error(log.botCredsConfigurationLink('Click here'), "to edit your bot's MSA info.");
                        }
                        cb(err, resp ? resp.statusCode : undefined);
                    } else {
                        log.info(
                            '->',
                            log.makeInspectorLink("POST", activity),
                            log.makeInspectorLink(`${resp.statusCode}`, body, `(${resp.statusMessage})`),
                            `[${activity.type}]`,
                            text);
                        if (recordInConversation) {
                            this.activities.push(Object.assign({}, activity));
                        }
                        cb(null, resp.statusCode, activity.id);
                    }
                }
            }

            if (!utils.isLocalhostUrl(bot.botUrl) && utils.isLocalhostUrl(emulator.framework.serviceUrl)) {
                log.error('Error: The bot is remote, but the callback URL is localhost. Without tunneling software you will not receive replies.');
                log.error("Fix it:", log.ngrokConfigurationLink('Configure ngrok'));
                log.error('Learn more:', log.makeLinkMessage('Connecting to bots hosted remotely', 'https://github.com/Microsoft/BotFramework-Emulator/wiki/Getting-Started#connect-to-a-bot-hosted-remotely'));
            }

            if (bot.msaAppId && bot.msaPassword) {
                this.authenticatedRequest(options, responseCallback);
            } else {
                request(options, responseCallback);
            }
        } else {
            cb("bot not found");
        }
    }

    sendConversationUpdate(membersAdded: IUser[], membersRemoved: IUser[]) {
        const activity: IConversationUpdateActivity = {
            type: 'conversationUpdate',
            membersAdded,
            membersRemoved
        }
        this.postActivityToBot(activity, false, () => {});
    }

    /**
     * Queues activity for delivery to user.
     */
    public postActivityToUser(activity: IActivity): IResourceResponse {
        const settings = getSettings();
        // Make a shallow copy before modifying & queuing
        activity = Object.assign({}, activity);
        this.postage(settings.users.currentUserId, activity);
        const botId = activity.from.id;
        if (!activity.from.name) {
            activity.from.name = "Bot";
        }
        this.activities.push(activity);
        return ResponseTypes.createResourceResponse(activity.id);
    }

    // updateActivity with replacement
    public updateActivity(updatedActivity: IActivity): IResourceResponse {
        // if we found the activity to reply to
        let oldActivity = this.activities.find((val) => val.id == updatedActivity.id);
        if (oldActivity) {
            Object.assign(oldActivity, updatedActivity);
            return ResponseTypes.createResourceResponse(updatedActivity.id);
        }

        throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "not a known activity id");
    }

    public deleteActivity(id: string) {
        // if we found the activity to reply to
        let index = this.activities.findIndex((val) => val.id == id);
        if (index >= 0) {
            this.activities.splice(index, 1);
            return;
        }
        throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "The activity id was not found");
    }

    // add member
    public addMember(id: string, name: string): IUser {
        name = name || `user-${uniqueId(4)}`;
        id = id || uniqueId();
        let user = {name, id};
        this.members.push(user);
        this.sendConversationUpdate([user], undefined);
        return user;
    }

    public removeMember(id: string) {
        let index = this.members.findIndex((val) => val.id == id);
        if (index >= 0) {
            this.members.splice(index, 1);
        }
        this.sendConversationUpdate(undefined, [{id, name: undefined}]);
    }

    public sendContactAdded() {
        const activity: IContactRelationUpdateActivity = {
            type: 'contactRelationUpdate',
            action: 'add'
        }
        this.postActivityToBot(activity, false, () => {});
    }

    public sendContactRemoved() {
        const activity: IContactRelationUpdateActivity = {
            type: 'contactRelationUpdate',
            action: 'remove'
        }
        this.postActivityToBot(activity, false, () => {});
    }

    public sendTyping() {
        const activity: IActivity = {
            type: 'typing'
        }
        this.postActivityToBot(activity, false, () => {});
    }

    public sendPing() {
        const activity: IActivity = {
            type: 'ping'
        }
        this.postActivityToBot(activity, false, () => {});
    }

    public sendDeleteUserData() {
        const activity: IActivity = {
            type: 'deleteUserData'
        }
        this.postActivityToBot(activity, false, () => {});
    }

    /**
     * Returns activities since the watermark.
     */
    getActivitiesSince(watermark: number): IActivity[] {
        return this.activities.slice(watermark);
    }

    private authenticatedRequest(options: request.OptionsWithUrl, callback: (error: any, response: http.IncomingMessage, body: any) => void, refresh = false): void {
        if (refresh) {
            this.accessToken = null;
        }
        this.addAccessToken(options, (err) => {
            if (!err) {
                request(options, (err, response, body) => {
                    if (!err) {
                        switch (response.statusCode) {
                            case HttpStatus.UNAUTHORIZED:
                            case HttpStatus.FORBIDDEN:
                                if (!refresh) {
                                    this.authenticatedRequest(options, callback, true);
                                } else {
                                    callback(null, response, body);
                                }
                                break;
                            default:
                                if (response.statusCode < 400) {
                                    callback(null, response, body);
                                } else {
                                    let txt = "Request to '" + options.url + "' failed: [" + response.statusCode + "] " + response.statusMessage;
                                    callback(new Error(txt), response, null);
                                }
                                break;
                        }
                    } else {
                        callback(err, null, null);
                    }
                });
            } else {
                callback(err, null, null);
            }
        });
    }

    public getAccessToken(cb: (err: Error, accessToken: string) => void): void {
        if (!this.accessToken || new Date().getTime() >= this.accessTokenExpires) {
            const bot = getSettings().botById(this.botId);
            // Refresh access token
            let opt: request.OptionsWithUrl = {
                method: 'POST',
                url: v30AuthenticationSettings.tokenEndpoint,
                form: {
                    grant_type: 'client_credentials',
                    client_id: bot.msaAppId,
                    client_secret: bot.msaPassword,
                    scope: v30AuthenticationSettings.tokenScope
                },
                agent: emulator.proxyAgent
            };

            request(opt, (err, response, body) => {
                if (!err) {
                    if (body && response.statusCode < 300) {
                        // Subtract 5 minutes from expires_in so they'll we'll get a
                        // new token before it expires.
                        let oauthResponse = JSON.parse(body);
                        this.accessToken = oauthResponse.access_token;
                        this.accessTokenExpires = new Date().getTime() + ((oauthResponse.expires_in - 300) * 1000);
                        cb(null, this.accessToken);
                    } else {
                        cb(new Error('Refresh access token failed with status code: ' + response.statusCode), null);
                    }
                } else {
                    cb(err, null);
                }
            });
        } else {
            cb(null, this.accessToken);
        }
    }

    private addAccessToken(options: request.Options, cb: (err: Error) => void): void {
        const bot = getSettings().botById(this.botId);

        if (bot.msaAppId && bot.msaPassword) {
            this.getAccessToken((err, token) => {
                if (!err && token) {
                    options.headers = {
                        'Authorization': 'Bearer ' + token
                    };
                    cb(null);
                } else {
                    cb(err);
                }
            });
        } else {
            cb(null);
        }
    }
}

/**
 * A set of conversations with a bot.
 */
class ConversationSet {
    botId: string;
    conversations: Conversation[] = [];

    constructor(botId: string) {
        this.botId = botId;
    }

    newConversation(user: IUser, conversationId?: string): Conversation {
        const conversation = new Conversation(this.botId, conversationId || uniqueId(), user);
        this.conversations.push(conversation);
        return conversation;
    }

    conversationById(conversationId: string): Conversation {
        return this.conversations.find(value => value.conversationId === conversationId);
    }
}


/**
 * Container for conversations.
 */
export class ConversationManager {
    conversationSets: ConversationSet[] = [];
    constructor() {
        addSettingsListener((settings: Settings) => {
            this.configure(settings);
        });
        this.configure(getSettings());
    }

    /**
     * Applies configuration changes.
     */
    private configure(settings: Settings) {
        // Remove conversations that reference nonexistent bots.
        const deadBotIds = this.conversationSets.filter(set => !settings.bots.find(bot => bot.botId === set.botId)).map(conversation => conversation.botId);
        this.conversationSets = this.conversationSets.filter(set => !deadBotIds.find(botId => set.botId === botId));
    }

    /**
     * Creates a new conversation.
     */
    public newConversation(botId: string, user: IUser, conversationId?: string): Conversation {
        let conversationSet = this.conversationSets.find(value => value.botId === botId);
        if (!conversationSet) {
            conversationSet = new ConversationSet(botId);
            this.conversationSets.push(conversationSet);
        }
        let conversation = conversationSet.newConversation(user, conversationId);
        return conversation;
    }

    /**
     * Gets the existing conversation, or returns undefined.
     */
    public conversationById(botId: string, conversationId: string): Conversation {
        const set = this.conversationSets.find(set => set.botId === botId);
        if (set) {
            return set.conversationById(conversationId);
        }
    }
}
