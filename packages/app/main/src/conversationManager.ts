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

import * as got from 'got';
import * as http from 'http';
import * as Payment from '@bfemulator/app-shared';
import { IUser } from '@bfemulator/app-shared';
import { IBot, IActivity, IConversationUpdateActivity, IContactRelationUpdateActivity, IInvokeActivity } from '@bfemulator/app-shared';
import { PaymentEncoder } from '@bfemulator/app-shared';
import { ISpeechTokenInfo } from '@bfemulator/app-shared';
import { uniqueId } from '@bfemulator/app-shared';
import { dispatch, getSettings, authenticationSettings, addSettingsListener, speechSettings } from './settings';
import { Settings } from '@bfemulator/app-shared';
import * as HttpStatus from 'http-status-codes';
import * as ResponseTypes from '@bfemulator/app-shared';
import { ErrorCodes, IResourceResponse } from '@bfemulator/app-shared';
import { emulator } from './emulator';
import { usersDefault } from '@bfemulator/app-shared';
import * as moment from 'moment';
import { isLocalhostUrl } from './utils';
import { getActiveBot } from './botHelpers';
import { logError, logActivity, makeBotSettingsLink, makeAppSettingsLink, makeExternalLink } from './logHelpers';
import { LogService } from './platform/log/logService';
import { mainWindow } from './main';

/**
 * Stores and propagates conversation messages.
 */
export class Conversation {
  private accessToken: string;
  private accessTokenExpires: number;
  private speechToken: ISpeechTokenInfo;

  constructor(public idOfBotRecord: string, conversationId: string, user: IUser) {
    this.conversationId = conversationId;
    this.members.push({ id: idOfBotRecord, name: "Bot" });
    this.members.push({ id: user.id, name: user.name });
  }

  public get bot(): IBot {
    return getActiveBot();
  }

  // the id for this conversation
  public conversationId: string;

  // the list of activities in this conversation
  public activities: IActivity[] = [];

  public members: IUser[] = [];

  // flag indicating if the user has been shown the
  // "please don't use default Bot State API" warning message
  // when they try to write bot state data
  public stateApiDeprecationWarningShown: boolean = false;

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
    activity.conversation = activity.conversation || { id: this.conversationId };
  }

  private addActivityToQueue(activity: IActivity, destination: string) {
    this.activities.push(activity);
    logActivity(this.conversationId, activity, destination);
  }

  /**
   * Sends the activity to the conversation's bot.
   */
  postActivityToBot(activity: IActivity, recordInConversation: boolean, cb?) {
    if (this.conversationId.includes("transcript")) {
      if (recordInConversation) {
        this.addActivityToQueue(Object.assign({}, activity), "bot");
      }
      cb && cb();
      return;
    }

    const bot = this.bot;
    if (bot) {
      // Do not make a shallow copy here before modifying
      this.postage(bot.id, activity);
      activity.from = activity.from || this.getCurrentUser();
      if (!activity.recipient.name) {
        activity.recipient.name = "Bot";
      }
      activity.serviceUrl = emulator.framework.getServiceUrl(bot.botUrl);

      let options = {
        url: bot.botUrl,
        method: "POST",
        body: activity,
        json: true,
        strictSSL: false,
        useElectronNet: true
      };

      let responseCallback = (resp) => {
        if (resp) {
          if (!/^2\d\d$/.test(`${resp.statusCode}`)) {
            if (Number(resp.statusCode) == 401 || Number(resp.statusCode) == 402) {
              logError(this.conversationId, "Error: The bot's MSA appId or password is incorrect.");
              logError(this.conversationId, makeBotSettingsLink("Edit your bot's MSA info"));
            }
            cb(null, resp ? resp.statusCode : undefined);
          } else {
            if (recordInConversation) {
              this.addActivityToQueue(Object.assign({}, activity), "bot");
            }
            if (activity.type === 'invoke') {
              cb(null, resp.statusCode, activity.id, resp.body);
            } else {
              cb(null, resp.statusCode, activity.id);
            }
          }
        }
      }

      let handleError = (err) => {
        cb(err);
      }

      if (!isLocalhostUrl(bot.botUrl) && isLocalhostUrl(emulator.framework.getServiceUrl(bot.botUrl))) {
        logError(this.conversationId, 'Error: The bot is remote, but the callback URL is localhost. Without tunneling software you will not receive replies.');
        logError(this.conversationId, makeExternalLink('Connecting to bots hosted remotely', 'https://aka.ms/cnjvpo'));
        logError(this.conversationId, makeAppSettingsLink('Edit ngrok settings'));
      }

      if (bot.msaAppId && bot.msaPassword) {
        this.authenticatedRequest(options, responseCallback, handleError);
      } else {
        got(options)
          .then(responseCallback)
          .catch(handleError);
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
    this.postActivityToBot(activity, false, () => { });
  }

  /**
   * Queues activity for delivery to user.
   */
  public postActivityToUser(activity: IActivity): IResourceResponse {
    const settings = getSettings();
    // Make a shallow copy before modifying & queuing
    let visitor = new PaymentEncoder();
    activity = Object.assign({}, activity);
    visitor.traverseActivity(activity);
    this.postage(settings.users.currentUserId, activity);
    if (!activity.from.name) {
      activity.from.name = "Bot";
    }
    this.addActivityToQueue(activity, "user");
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
    name = name || `user-${uniqueId()}`;
    id = id || uniqueId();
    let user = { name, id };
    this.members.push(user);
    this.sendConversationUpdate([user], undefined);
    return user;
  }

  public removeMember(id: string) {
    let index = this.members.findIndex((val) => val.id == id);
    if (index >= 0) {
      this.members.splice(index, 1);
    }
    this.sendConversationUpdate(undefined, [{ id, name: undefined }]);
  }

  public sendContactAdded() {
    const activity: IContactRelationUpdateActivity = {
      type: 'contactRelationUpdate',
      action: 'add'
    }
    this.postActivityToBot(activity, false, () => { });
  }

  public sendContactRemoved() {
    const activity: IContactRelationUpdateActivity = {
      type: 'contactRelationUpdate',
      action: 'remove'
    }
    this.postActivityToBot(activity, false, () => { });
  }

  public sendTyping() {
    const activity: IActivity = {
      type: 'typing'
    }
    this.postActivityToBot(activity, false, () => { });
  }

  public sendPing() {
    const activity: IActivity = {
      type: 'ping'
    }
    this.postActivityToBot(activity, false, () => { });
  }

  public sendDeleteUserData() {
    const activity: IActivity = {
      type: 'deleteUserData'
    }
    this.postActivityToBot(activity, false, () => { });
  }

  public sendUpdateShippingAddressOperation(
    checkoutSession: Payment.ICheckoutConversationSession,
    request: Payment.IPaymentRequest,
    shippingAddress: Payment.IPaymentAddress,
    shippingOptionId: string,
    cb: (errCode, body) => void) {
    this.sendUpdateShippingOperation(
      checkoutSession,
      Payment.PaymentOperations.UpdateShippingAddressOperationName,
      request,
      shippingAddress,
      shippingOptionId,
      cb
    );
  }

  public sendUpdateShippingOptionOperation(
    checkoutSession: Payment.ICheckoutConversationSession,
    request: Payment.IPaymentRequest,
    shippingAddress: Payment.IPaymentAddress,
    shippingOptionId: string,
    cb: (errCode, body) => void) {
    this.sendUpdateShippingOperation(
      checkoutSession,
      Payment.PaymentOperations.UpdateShippingOptionOperationName,
      request,
      shippingAddress,
      shippingOptionId,
      cb
    );
  }

  private sendUpdateShippingOperation(
    checkoutSession: Payment.ICheckoutConversationSession,
    operation: string,
    request: Payment.IPaymentRequest,
    shippingAddress: Payment.IPaymentAddress,
    shippingOptionId: string,
    cb: (errCode, body) => void) {

    const updateValue: Payment.IPaymentRequestUpdate = {
      id: request.id,
      shippingAddress: shippingAddress,
      shippingOption: shippingOptionId,
      details: request.details
    };
    let serviceUrl;
    const bot = this.bot;
    if (bot) {
      serviceUrl = emulator.framework.getServiceUrl(bot.botUrl);

      const activity: IInvokeActivity = {
        type: 'invoke',
        name: operation,
        from: { id: checkoutSession.checkoutFromId },
        conversation: { id: checkoutSession.checkoutConversationId },
        relatesTo: {
          activityId: checkoutSession.paymentActivityId,
          bot: { id: bot.id },
          channelId: 'emulator',
          conversation: { id: this.conversationId },
          serviceUrl: serviceUrl,
          user: this.getCurrentUser()
        },
        value: updateValue
      };
      this.postActivityToBot(activity, false, (err, statusCode, activityId, responseBody) => {
        cb(statusCode, responseBody);
      });
    }
  }

  public sendPaymentCompleteOperation(
    checkoutSession: Payment.ICheckoutConversationSession,
    request: Payment.IPaymentRequest,
    shippingAddress: Payment.IPaymentAddress,
    shippingOptionId: string,
    payerEmail: string,
    payerPhone: string,
    cb: (errCode, body) => void) {
    const bot = this.bot;
    if (bot) {
      let paymentTokenHeader = {
        format: 2,
        merchantId: request.methodData[0].data.merchantId,
        paymentRequestId: request.id,
        amount: request.details.total.amount,
        expiry: '1/1/2020',
        timestamp: '4/27/2017',
      };

      let paymentTokenHeaderStr = JSON.stringify(paymentTokenHeader);
      let pthBytes = new Buffer(paymentTokenHeaderStr).toString('base64');

      let paymentTokenSource = 'tok_18yWDMKVgMv7trmwyE21VqO';
      let ptsBytes = new Buffer(paymentTokenSource).toString('base64');

      let ptsigBytes = new Buffer('Emulator').toString('base64');

      const updateValue: Payment.IPaymentRequestComplete = {
        id: request.id,
        paymentRequest: request,
        paymentResponse: {
          details: {
            paymentToken: pthBytes + '.' + ptsBytes + '.' + ptsigBytes
          },
          methodName: request.methodData[0].supportedMethods[0],
          payerEmail: payerEmail,
          payerPhone: payerPhone,
          shippingAddress: shippingAddress,
          shippingOption: shippingOptionId
        }
      };
      let serviceUrl;
      serviceUrl = emulator.framework.getServiceUrl(bot.botUrl);

      const activity: IInvokeActivity = {
        type: 'invoke',
        name: Payment.PaymentOperations.PaymentCompleteOperationName,
        from: { id: checkoutSession.checkoutFromId },
        conversation: { id: checkoutSession.checkoutConversationId },
        relatesTo: {
          activityId: checkoutSession.paymentActivityId,
          bot: { id: bot.id },
          channelId: 'emulator',
          conversation: { id: this.conversationId },
          serviceUrl: serviceUrl,
          user: this.getCurrentUser()
        },
        value: updateValue
      };
      this.postActivityToBot(activity, false, (err, statusCode, activityId, responseBody) => {
        cb(statusCode, responseBody);
      });
    }
  }

  public getSpeechToken(duration: number, cb: (tokenInfo: ISpeechTokenInfo) => void, refresh: boolean = false) {
    if (this.speechToken && !refresh) {
      cb(this.speechToken);
    } else {
      const bot = this.bot;
      if (bot) {
        if (bot.msaAppId && bot.msaPassword) {
          let options = {
            url: speechSettings.tokenEndpoint + '?goodForInMinutes=' + duration,
            method: 'GET',
            strictSSL: false,
            useElectronNet: true
          };

          let responseCallback = (resp) => {
            if (resp.body) {
              let speechToken: ISpeechTokenInfo = JSON.parse(resp.body) as ISpeechTokenInfo;
              if (speechToken.access_Token) {
                this.speechToken = speechToken;
              }
              cb(speechToken);
            } else if (resp.statusCode === 401) {
              cb({ access_Token: undefined, error: 'Unauthorized', error_Description: 'This bot is not authorized to use the Cognitive Services Speech API.' });
            } else {
              cb({ access_Token: undefined, error: 'Unable to retrieve speech token', error_Description: 'A speech token could not be retrieved for this bot. Response code: ' + resp.statusCode });
            }
          }
          let handleError = (err) => {
            cb({ access_Token: undefined, error: err, error_Description: undefined });
          }

          this.authenticatedRequest(options, responseCallback, handleError);
        } else {
          cb({ access_Token: undefined, error: 'Unauthorized', error_Description: 'To use speech, the bot must be registered and using a valid MS AppId and Password.' });
        }
      } else {
        cb({ access_Token: undefined, error: 'NotFound', error_Description: 'Unknown bot.' });
      }
    }
  }

  /**
   * Returns activities since the watermark.
   */
  getActivitiesSince(watermark: number): IActivity[] {
    return this.activities.slice(watermark);
  }

  private authenticatedRequest(options, callback: (response: http.IncomingMessage) => void, handleError: (error: any) => void, refresh = false): void {
    if (refresh) {
      this.accessToken = null;
    }
    this.addAccessToken(options, (err) => {
      if (!err) {
        got(options)
          .then((response) => {
            if (!err) {
              switch (response.statusCode) {
                case HttpStatus.UNAUTHORIZED:
                case HttpStatus.FORBIDDEN:
                  if (!refresh) {
                    this.authenticatedRequest(options, callback, handleError, true);
                  } else {
                    callback(response);
                  }
                  break;
                default:
                  if (response.statusCode < 400) {
                    callback(response);
                  } else {
                    let txt = "Request to '" + options.url + "' failed: [" + response.statusCode + "] " + response.statusMessage;
                    handleError(new Error(txt));
                  }
                  break;
              }
            }
          })
          .catch(handleError);
      } else {
        handleError(err);
      }
    });
  }

  public getAccessToken(cb: (err: Error, accessToken: string) => void): void {
    if (!this.accessToken || new Date().getTime() >= this.accessTokenExpires) {
      const bot = this.bot;
      // Refresh access token
      let opt = {
        method: 'POST',
        url: authenticationSettings.tokenEndpoint,
        body: {
          grant_type: 'client_credentials',
          client_id: bot.msaAppId,
          client_secret: bot.msaPassword,
          scope: bot.msaAppId + '/.default',
          // flag to request a version 1.0 token
          atver: getSettings().framework.use10Tokens ? 1 : null
        },
        form: true,
        strictSSL: false,
        useElectronNet: true
      };

      got(opt)
        .then((resp) => {
          if (resp.body && resp.statusCode < 300) {
            // Subtract 5 minutes from expires_in so they'll we'll get a
            // new token before it expires.
            let oauthResponse = JSON.parse(resp.body);
            this.accessToken = oauthResponse.access_token;
            this.accessTokenExpires = new Date().getTime() + ((oauthResponse.expires_in - 300) * 1000);
            cb(null, this.accessToken);
          } else {
            cb(new Error('Refresh access token failed with status code: ' + resp.statusCode), null);
          }
        })
        .catch((err) => {
          cb(err, null)
        });
    } else {
      cb(null, this.accessToken);
    }
  }

  private addAccessToken(options: any, cb: (err: Error) => void): void {
    const bot = this.bot;

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

  public feedActivities(activities: IActivity[]) {
    activities.forEach(activity => {
      if (activity.conversation) {
        activity.conversation.id = this.conversationId
      }
      this.postActivityToUser(activity);
    });
  }
}

/**
 * A set of conversations with a bot.
 */
class ConversationSet {
  conversations: Conversation[] = [];

  constructor(public idOfBotRecord: string) {
  }

  newConversation(user: IUser, conversationId?: string): Conversation {
    const conversation = new Conversation(this.idOfBotRecord, conversationId || uniqueId(), user);
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
    //    const deadBotIds = this.conversationSets.filter(set => !settings.bots.find(bot => bot.id === set.id)).map(conversation => conversation.id);
    //    this.conversationSets = this.conversationSets.filter(set => !deadBotIds.find(id => set.id === id));
  }

  /**
   * Creates a new conversation.
   */
  public newConversation(idOfBotRecord: string, user: IUser, conversationId?: string): Conversation {
    let conversationSet = this.conversationSets.find(value => value.idOfBotRecord === idOfBotRecord);
    if (!conversationSet) {
      conversationSet = new ConversationSet(idOfBotRecord);
      this.conversationSets.push(conversationSet);
    }
    let conversation = conversationSet.newConversation(user, conversationId);
    return conversation;
  }

  /**
   * Gets the existing conversation, or returns undefined.
   */
  public conversationById(idOfBotRecord: string, conversationId: string): Conversation {
    const set = this.conversationSets.find(set => set.idOfBotRecord === idOfBotRecord);
    if (set) {
      return set.conversationById(conversationId);
    } else {
      return null;
    }
  }
}
