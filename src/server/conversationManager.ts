import * as request from 'request';
import * as http from 'http';
import { Settings } from './settings';
import { IChannelAccount, IConversationAccount } from '../types/accountTypes';
import { IActivity, IConversationUpdateActivity } from '../types/activityTypes';
import { uniqueId } from '../utils';
import { getStore, getSettings, authenticationSettings } from './settings';
import * as jwt from 'jsonwebtoken';
import * as oid from './OpenIdMetadata';
import * as HttpStatus from "http-status-codes";
import * as ResponseTypes from '../types/responseTypes';
import { ErrorCodes, IResourceResponse, IErrorResponse } from '../types/responseTypes';


/**
 * Stores and propagates conversation messages.
 */
export class Conversation {
    private accessToken: string;
    private accessTokenExpires: number;

    constructor(botId: string, conversationId: string) {
        this.botId = botId;
        this.conversationId = conversationId;
        this.members.push({ id: botId });
        this.members.push({ id: "1", name: "User1" });
    }

    // the botId this conversation is with
    public botId: string;

    // the id for this conversation
    public conversationId: string;

    // the list of activities in this conversation
    public activities: IActivity[] = [];

    public members: IChannelAccount[] = [];

    private postage(recipientId: string, activity: IActivity) {
        activity.id = uniqueId();
        activity.channelId = 'emulator';
        activity.timestamp = (new Date()).toISOString();
        activity.recipient = { id: recipientId };
        activity.conversation = { id: this.conversationId };
    }

    /**
     * Sends the activity to the conversation's bot.
     */
    postActivityToBot(activity: IActivity, recordInConversation: boolean, cb) {
        this.postage(this.botId, activity);
        if (recordInConversation) {
            this.activities.push(Object.assign({}, activity));
        }
        const bot = getSettings().botById(this.botId);
        if (bot) {
            var statusCode = '';
            var options: request.OptionsWithUrl = { url: bot.botUrl, method: "POST", json: activity };

            var responseCallback = function (err, resp: http.IncomingMessage, body) {
                if (err)
                    cb(err);
                else
                    cb(null, resp.statusCode);
            }

            if (bot.msaAppId && bot.msaPassword)
                this.authenticatedRequest(options, responseCallback);
            else
                request(options, responseCallback);

        } else {
            console.error("Conversation.postToBot: bot not found! How does this conversation exist?", this.botId);
            cb("bot not found");
        }
    }

    sendBotAddedToConversation() {
        const activity: IConversationUpdateActivity = {
            type: 'conversationUpdate',
            channelId: 'emulator',
            from: {
                id: this.conversationId
            },
            membersAdded: [{ id: this.botId }]
        }
        this.postActivityToBot(activity, false, (err, callback) => { });
    }

    /**
     * Queues activity for delivery to user.
     */
    public postActivityToUser(activity: IActivity): IResourceResponse {
        this.postage('', activity);
        this.activities.push(Object.assign({}, activity));
        return ResponseTypes.createResourceResponse(activity.id);
    }

    // updateActivity with replacement
    public updateActivity(updatedActivity: IActivity): IResourceResponse {
        // if we found the activity to reply to
        var oldActivity = this.activities.find((val) => val.id == updatedActivity.id);
        if (oldActivity) {
            Object.assign(oldActivity, updatedActivity);
            return ResponseTypes.createResourceResponse(updatedActivity.id);
        }

        throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "not a known activity id");
    }

    public deleteActivity(id: string) {
        // if we found the activity to reply to
        var index = this.activities.findIndex((val) => val.id == id);
        if (index >= 0) {
            this.activities.splice(index, 1);
            return;
        }
        throw ResponseTypes.createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, "The activity id was not found");
    }

    // add member
    public addMember(id?: string): IChannelAccount {
        var nextId = this.members.length;
        if (!id)
            id = nextId.toString();

        var user: IChannelAccount = {
            id: id,
            name: "user" + nextId
        };
        this.members.push(user);
        return user;
    }

    public removeMember(id: string) {
        // remove last member
        if (this.members.length > 1)
            this.members.splice(-1, 1);
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
                                    var txt = "Request to '" + options.url + "' failed: [" + response.statusCode + "] " + response.statusMessage;
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
            var opt: request.OptionsWithUrl = {
                method: 'POST',
                url: authenticationSettings.refreshEndpoint,
                form: {
                    grant_type: 'client_credentials',
                    client_id: bot.msaAppId,
                    client_secret: bot.msaPassword,
                    scope: authenticationSettings.refreshScope
                }
            };
            request(opt, (err, response, body) => {
                if (!err) {
                    if (body && response.statusCode < 300) {
                        // Subtract 5 minutes from expires_in so they'll we'll get a
                        // new token before it expires.
                        var oauthResponse = JSON.parse(body);
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

    newConversation(members?: IChannelAccount[]): Conversation {
        const conversation = new Conversation(this.botId, uniqueId());
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
        getStore().subscribe(() => {
            this.configure();
        });
        this.configure();
    }

    /**
     * Applies configuration changes.
     */
    private configure() {
        // Remove conversations that reference nonexistent bots.
        const settings = getSettings();
        const deadBotIds = this.conversationSets.filter(set => !settings.bots.find(bot => bot.botId === set.botId)).map(conversation => conversation.botId);
        this.conversationSets = this.conversationSets.filter(set => !deadBotIds.find(botId => set.botId === botId));
    }

    /**
     * Creates a new conversation.
     */
    public newConversation(botId: string): Conversation {
        let conversationSet = this.conversationSets.find(value => value.botId === botId);
        if (!conversationSet) {
            conversationSet = new ConversationSet(botId);
            this.conversationSets.push(conversationSet);
        }
        let conversation = conversationSet.newConversation();
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
