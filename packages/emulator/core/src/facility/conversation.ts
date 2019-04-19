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

import { EventEmitter } from 'events';

import * as HttpStatus from 'http-status-codes';
import updateIn from 'simple-update-in';
import {
  appSettingsItem,
  CheckoutConversationSession,
  ErrorCodes,
  externalLinkItem,
  isLocalHostUrl,
  LogLevel,
  PaymentOperations,
  PaymentRequest,
  PaymentRequestComplete,
  PaymentRequestUpdate,
  ResourceResponse,
  textItem,
  TranscriptRecord,
  User,
} from '@bfemulator/sdk-shared';
import {
  Activity,
  Attachment,
  ConversationAccount,
  IContactRelationUpdateActivity,
  IInvokeActivity,
  IMessageActivity,
  ChannelAccount,
} from 'botframework-schema';
import { networkRequestItem, networkResponseItem } from '@bfemulator/sdk-shared';

import { BotEmulator } from '../botEmulator';
import { TokenCache } from '../userToken/tokenCache';
import createAPIException from '../utils/createResponse/apiException';
import createResourceResponse from '../utils/createResponse/resource';
import OAuthClientEncoder from '../utils/oauthClientEncoder';
import PaymentEncoder from '../utils/paymentEncoder';
import uniqueId from '../utils/uniqueId';

import BotEndpoint from './botEndpoint';

// moment currently does not export callable function
// eslint-disable-next-line typescript/no-var-requires
const moment = require('moment');
const maxDataUrlLength = Math.pow(2, 22);

interface ActivityBucket {
  activity: Activity;
  watermark: number;
}

/**
 * Stores and propagates conversation messages.
 */
export default class Conversation extends EventEmitter {
  public botEmulator: BotEmulator;
  public botEndpoint: BotEndpoint;
  public conversationId: string;
  public user: User;
  // flag indicating if the user has been shown the
  // "please don't use default Bot State API" warning message
  // when they try to write bot state data
  public stateApiDeprecationWarningShown: boolean = false;
  public codeVerifier: string = undefined;
  // private speechToken: SpeechTokenInfo;
  public members: User[] = [];
  public nextWatermark = 0;
  // the list of activities in this conversation
  private activities: ActivityBucket[] = [];
  private transcript: TranscriptRecord[] = [];

  private get conversationIsTranscript() {
    return this.conversationId.includes('transcript');
  }

  constructor(botEmulator: BotEmulator, botEndpoint: BotEndpoint, conversationId: string, user: User) {
    super();
    Object.assign(this, { botEmulator, botEndpoint, conversationId, user });
    // We should consider hardcoding bot id because we don't really use it
    this.members.push({
      id: (botEndpoint && botEndpoint.botId) || 'bot-1',
      name: 'Bot',
    });
    this.members.push({ id: user.id, name: user.name });
  }

  /**
   * Sends the activity to the conversation's bot.
   */
  public async postActivityToBot(activity: Activity, recordInConversation: boolean) {
    if (!this.botEndpoint) {
      return this.botEmulator.facilities.logger.logMessage(
        this.conversationId,
        textItem(
          LogLevel.Error,
          `This conversation does not have an endpoint, cannot post "${activity && activity.type}" activity.`
        )
      );
    }

    // Do not make a shallow copy here before modifying
    activity = this.postage(this.botEndpoint.botId, activity);
    activity.from = activity.from || this.user;
    activity.locale = this.botEmulator.facilities.locale;

    if (!activity.recipient.name) {
      activity.recipient.name = 'Bot';
    }

    // Fill in role field, if missing
    if (!activity.recipient.role) {
      activity.recipient.role = 'bot';
    }

    activity.serviceUrl = await this.botEmulator.getServiceUrl(this.botEndpoint.botUrl);

    if (
      !this.conversationIsTranscript &&
      !isLocalHostUrl(this.botEndpoint.botUrl) &&
      isLocalHostUrl(activity.serviceUrl)
    ) {
      this.botEmulator.facilities.logger.logMessage(
        this.conversationId,
        textItem(
          LogLevel.Error,
          'Error: The bot is remote, but the service URL is localhost.' +
            ' Without tunneling software you will not receive replies.'
        )
      );
      this.botEmulator.facilities.logger.logMessage(
        this.conversationId,
        externalLinkItem('Connecting to bots hosted remotely', 'https://aka.ms/cnjvpo')
      );
      this.botEmulator.facilities.logger.logMessage(this.conversationId, appSettingsItem('Configure ngrok'));
    }

    const options = {
      body: JSON.stringify(activity),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    };

    if (recordInConversation) {
      this.addActivityToQueue({ ...activity } as Activity);
    }

    this.transcript = [...this.transcript, { type: 'activity add', activity }];
    this.emit('transcriptupdate');

    let status = 200;
    let resp: any = { json: async () => ({}) };

    // If a message to the bot was triggered from a transcript, don't actually send it.
    // This can happen when clicking a button in an adaptive card, for instance.
    if (!this.conversationIsTranscript) {
      resp = await this.botEndpoint.fetchWithAuth(this.botEndpoint.botUrl, options);
      status = resp.status;
    }

    return {
      activityId: activity.id,
      response: resp,
      statusCode: status,
    };
  }

  public async sendConversationUpdate(membersAdded: User[], membersRemoved: User[]) {
    const activity = {
      type: 'conversationUpdate',
      membersAdded,
      membersRemoved,
    };

    // don't send if it has already been sent
    if (this.activities.some(act => act.activity == activity)) {
      return;
    }

    const result = await this.postActivityToBot(activity as Activity, false);
    if (!/2\d\d/.test('' + result.statusCode)) {
      this.botEmulator.facilities.logger.logException(this.conversationId, result.response);
    }

    this.botEmulator.facilities.logger.logMessage(
      this.conversationId,
      networkRequestItem(
        'directline',
        activity,
        {
          'Content-Type': 'application/json',
        },
        'POST',
        '/v3/directline/conversations'
      ),
      networkResponseItem(
        { id: result.activityId },
        result.response.headers,
        result.statusCode,
        result.status,
        '/v3/directline/conversations'
      ),
      textItem(LogLevel.Debug, `directline.conversationUpdate`)
    );
  }

  /**
   * Queues activity for delivery to user.
   */
  public postActivityToUser(activity: Activity, isHistoric: boolean = false): ResourceResponse {
    activity = this.processActivity(activity);
    activity = this.postage(this.user.id, activity, isHistoric);

    if (!activity.from.name) {
      activity.from.name = 'Bot';
    }

    if (!activity.locale) {
      activity.locale = this.botEmulator.facilities.locale;
    }

    // Fill in role field, if missing
    if (!activity.recipient.role) {
      activity.recipient.role = 'user';
    }

    this.addActivityToQueue(activity);
    this.transcript = [...this.transcript, { type: 'activity add', activity }];
    this.emit('transcriptupdate');

    if (activity.type === 'endOfConversation') {
      this.emit('end');
    }

    return createResourceResponse(activity.id);
  }

  // TODO: Payment modification is only useful for emulator, but not local mode
  //       This function turns all payment cardAction into openUrl to payment://
  public processActivity(activity: Activity): Activity {
    const visitors = [new PaymentEncoder(), new OAuthClientEncoder(activity)];

    activity = { ...activity };
    visitors.forEach(v => v.traverseActivity(activity));

    return activity;
  }

  // This function turns local contentUrls into dataUrls://
  public async processActivityForDataUrls(activity: Activity): Promise<Activity> {
    const visitor = new DataUrlEncoder(this.botEmulator);

    activity = { ...activity };
    await visitor.traverseActivity(activity);

    return activity;
  }

  // updateActivity with replacement
  public updateActivity(updatedActivity: Activity): ResourceResponse {
    const { id } = updatedActivity;
    const index = this.activities.findIndex(entry => entry.activity.id === id);

    if (index === -1) {
      // The activity may already flushed to the client, thus, not found anymore
      // TODO: Should we add a new activity with same ID, so the client will get the update?
      throw createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, 'not a known activity id');
    }

    this.activities = updateIn(this.activities, [index, 'activity'], activity => ({ ...activity, ...updatedActivity }));
    updatedActivity = this.activities[index].activity;
    this.emit('activitychange', { activity: updatedActivity });

    this.transcript = [...this.transcript, { type: 'activity update', activity: updatedActivity }];
    this.emit('transcriptupdate');

    return createResourceResponse(id);
  }

  public deleteActivity(id: string) {
    // if we found the activity to reply to
    const activityIndex = this.activities.findIndex(entry => entry.activity.id === id);

    if (activityIndex === -1) {
      // The activity may already flushed to the client
      // TODO: Should we add a new empty activity with same ID to let the client know about the recall?
      throw createAPIException(HttpStatus.NOT_FOUND, ErrorCodes.BadArgument, 'The activity id was not found');
    }

    const { activity } = this.activities[activityIndex];

    this.activities = updateIn(this.activities, [activityIndex]);
    this.emit('deleteactivity', { activity });

    this.transcript = [...this.transcript, { type: 'activity delete', activity: { id } } as TranscriptRecord];
    this.emit('transcriptupdate');
  }

  public async addMember(id: string, name: string): Promise<User> {
    name = name || `user-${uniqueId()}`;
    id = id || uniqueId();

    const user = { name, id };

    this.members = [...this.members, user];
    this.emit('join', { user });

    // TODO: A conversation without endpoint is weird, think about it
    // Don't send "conversationUpdate" if we don't have an endpoint
    if (this.botEndpoint) {
      await this.sendConversationUpdate([user], undefined);
    }

    this.transcript = [
      ...this.transcript,
      {
        type: 'member join',
        activity: {
          type: 'conversationUpdate',
          membersAdded: [user],
        } as Activity,
      },
    ];

    this.emit('transcriptupdate');

    return user;
  }

  public async removeMember(id: string) {
    const index = this.members.findIndex(val => val.id === id);

    if (index !== -1) {
      const user = this.members[index];

      this.members = updateIn(this.members, [index]);
      this.emit('left', { user });
    }

    await this.sendConversationUpdate(undefined, [{ id, name: undefined }]);

    this.transcript = [
      ...this.transcript,
      {
        type: 'member left',
        activity: {
          type: 'conversationUpdate',
          membersRemoved: [{ id }],
        } as Activity,
      },
    ];

    this.emit('transcriptupdate');
  }

  public async sendContactAdded() {
    const activity = {
      type: 'contactRelationUpdate',
      action: 'add',
    } as IContactRelationUpdateActivity;

    try {
      await this.postActivityToBot(activity as Activity, false);
    } catch (err) {
      this.botEmulator.facilities.logger.logException(this.conversationId, err);
    }

    this.transcript = [...this.transcript, { type: 'contact update', activity } as TranscriptRecord];
    this.emit('transcriptupdate');
  }

  public async sendContactRemoved() {
    const activity = {
      type: 'contactRelationUpdate',
      action: 'remove',
    } as IContactRelationUpdateActivity;

    try {
      await this.postActivityToBot(activity as Activity, false);
    } catch (err) {
      this.botEmulator.facilities.logger.logException(this.conversationId, err);
    }

    this.transcript = [...this.transcript, { type: 'contact remove', activity } as TranscriptRecord];
    this.emit('transcriptupdate');
  }

  public async sendTyping() {
    // TODO: Which side is sending the typing activity?
    const activity = {
      type: 'typing',
    } as Activity;

    try {
      await this.postActivityToBot(activity, false);
    } catch (err) {
      this.botEmulator.facilities.logger.logException(this.conversationId, err);
    }

    this.transcript = [...this.transcript, { type: 'typing', activity }];
    this.emit('transcriptupdate');
  }

  public async sendPing() {
    // TODO: Which side is sending the ping activity?
    const activity = {
      type: 'ping',
    } as Activity;

    try {
      await this.postActivityToBot(activity, false);
    } catch (err) {
      this.botEmulator.facilities.logger.logException(this.conversationId, err);
    }

    this.transcript = [...this.transcript, { type: 'ping', activity }];
    this.emit('transcriptupdate');
  }

  public async sendDeleteUserData() {
    const activity = {
      type: 'deleteUserData',
    } as Activity;

    try {
      await this.postActivityToBot(activity, false);
    } catch (err) {
      this.botEmulator.facilities.logger.logException(this.conversationId, err);
    }

    this.transcript = [...this.transcript, { type: 'user data delete', activity }];
    this.emit('transcriptupdate');
  }

  public async sendUpdateShippingAddressOperation(
    checkoutSession: CheckoutConversationSession,
    request: PaymentRequest,
    shippingAddress: PaymentAddress,
    shippingOptionId: string
  ) {
    return this.sendUpdateShippingOperation(
      checkoutSession,
      PaymentOperations.UpdateShippingAddressOperationName,
      request,
      shippingAddress,
      shippingOptionId
    );
  }

  public async sendUpdateShippingOptionOperation(
    checkoutSession: CheckoutConversationSession,
    request: PaymentRequest,
    shippingAddress: PaymentAddress,
    shippingOptionId: string
  ) {
    return this.sendUpdateShippingOperation(
      checkoutSession,
      PaymentOperations.UpdateShippingOptionOperationName,
      request,
      shippingAddress,
      shippingOptionId
    );
  }

  public async sendPaymentCompleteOperation(
    checkoutSession: CheckoutConversationSession,
    request: PaymentRequest,
    shippingAddress: PaymentAddress,
    shippingOptionId: string,
    payerEmail: string,
    payerPhone: string
  ) {
    if (!this.botEndpoint) {
      return this.botEmulator.facilities.logger.logMessage(
        this.conversationId,
        textItem(
          LogLevel.Error,
          'Error: This conversation does not have an endpoint, cannot send payment complete activity.'
        )
      );
    }

    const paymentTokenHeader = {
      amount: request.details.total.amount,
      expiry: '1/1/2020',
      format: 2,
      merchantId: request.methodData[0].data.merchantId,
      paymentRequestId: request.id,
      timestamp: '4/27/2017',
    };

    const paymentTokenHeaderStr = JSON.stringify(paymentTokenHeader);
    const pthBytes = new Buffer(paymentTokenHeaderStr).toString('base64');

    const paymentTokenSource = 'tok_18yWDMKVgMv7trmwyE21VqO';
    const ptsBytes = new Buffer(paymentTokenSource).toString('base64');

    const ptsigBytes = new Buffer('Emulator').toString('base64');

    const updateValue: PaymentRequestComplete = {
      id: request.id,
      paymentRequest: request,
      paymentResponse: {
        details: {
          paymentToken: pthBytes + '.' + ptsBytes + '.' + ptsigBytes,
        },
        methodName: request.methodData[0].supportedMethods[0],
        payerEmail,
        payerPhone,
        shippingAddress,
        shippingOption: shippingOptionId,
      },
    };

    const activity = {
      type: 'invoke',
      name: PaymentOperations.PaymentCompleteOperationName,
      from: { id: checkoutSession.checkoutFromId } as ChannelAccount,
      conversation: { id: checkoutSession.checkoutConversationId } as ConversationAccount,
      relatesTo: {
        activityId: checkoutSession.paymentActivityId,
        bot: { id: this.botEndpoint.botId } as ChannelAccount,
        channelId: 'emulator',
        conversation: { id: this.conversationId } as ConversationAccount,
        serviceUrl: await this.botEmulator.getServiceUrl(this.botEndpoint.botUrl),
        user: this.botEmulator.facilities.users.usersById(this.botEmulator.facilities.users.currentUserId),
      },
      value: updateValue,
    } as IInvokeActivity;

    const { response } = await this.postActivityToBot(activity as Activity, false);

    return response;
  }

  public async sendTokenResponse(connectionName: string, token: string, doNotCache?: boolean) {
    const userId = this.botEmulator.facilities.users.currentUserId;

    if (!doNotCache) {
      TokenCache.addTokenToCache(this.botEndpoint.botId, userId, connectionName, token);
    }

    const activity = {
      type: 'event',
      name: 'tokens/response',
      value: {
        connectionName,
        token,
      },
    } as Activity;

    return this.postActivityToBot(activity as Activity, false);
  }

  /**
   * Returns activities since the watermark.
   */
  public getActivitiesSince(watermark: number): { activities: Activity[]; watermark: number } {
    this.activities = watermark ? this.activities.filter(entry => entry.watermark >= watermark) : this.activities;

    return {
      activities: this.activities.map(entry => entry.activity),
      watermark: this.nextWatermark,
    };
  }

  // TODO: This need to be redesigned
  public feedActivities(activities: Activity[]) {
    /*
     * We need to fixup the activities to look like they're part of the current conversation.
     * This a limitation of the way the emulator was originally designed, and not a problem
     * with the transcript data. In the fullness of time, the emulator (and webchat control)
     * could be better adapted to loading transcripts.
     * */

    const { id: currUserId } = this.user;
    let origUserId = null;
    let origBotId = null;

    // Get original botId and userId
    // Fixup conversationId
    activities.forEach(activity => {
      if (activity.conversation) {
        activity.conversation.id = this.conversationId;
      }

      const { type } = activity;

      if (
        activity.recipient &&
        (type === 'event' || type === 'message' || type === 'messageReaction' || type === 'typing')
      ) {
        if (!origBotId && activity.recipient.role === 'bot') {
          origBotId = activity.recipient.id;
        }

        if (!origUserId && activity.recipient.role === 'user') {
          origUserId = activity.recipient.id;
        }
      }
    });

    // Fixup recipient and from ids
    if (this.botEndpoint && origUserId && origBotId) {
      activities.forEach(activity => {
        if (activity.recipient.id === origBotId) {
          activity.recipient.id = this.botEndpoint.botId;
        }

        if (activity.from.id === origBotId) {
          activity.from.id = this.botEndpoint.botId;
        }

        if (activity.recipient.id === origUserId) {
          activity.recipient.id = currUserId;
        }

        if (activity.from.id === origUserId) {
          activity.from.id = currUserId;
        }
      });
    }

    // Add activities to the queue
    activities.forEach(activity => {
      if (activity.recipient && activity.recipient.role === 'user') {
        activity = this.processActivity(activity);
      }

      this.addActivityToQueue(activity);
    });
  }

  public async getTranscript(): Promise<Activity[]> {
    // Currently, we only export transcript of activities
    // TODO: Think about "member join/left", "typing", "activity update/delete", etc.
    const activities = this.transcript.filter(record => record.type === 'activity add').map(record => record.activity);
    for (let i = 0; i < activities.length; i++) {
      await this.processActivityForDataUrls(activities[i]);
    }
    return activities;
  }

  private async sendUpdateShippingOperation(
    checkoutSession: CheckoutConversationSession,
    operation: string,
    request: PaymentRequest,
    shippingAddress: PaymentAddress,
    shippingOptionId: string
  ) {
    if (!this.botEndpoint) {
      return this.botEmulator.facilities.logger.logMessage(
        this.conversationId,
        textItem(
          LogLevel.Error,
          'Error: This conversation does not have an endpoint, cannot send update shipping activity.'
        )
      );
    }

    const updateValue: PaymentRequestUpdate = {
      id: request.id,
      shippingAddress,
      shippingOption: shippingOptionId,
      details: request.details,
    };

    const activity = {
      type: 'invoke',
      name: operation,
      from: { id: checkoutSession.checkoutFromId },
      conversation: { id: checkoutSession.checkoutConversationId },
      relatesTo: {
        activityId: checkoutSession.paymentActivityId,
        bot: { id: this.botEndpoint.botId },
        channelId: 'emulator',
        conversation: { id: this.conversationId },
        serviceUrl: await this.botEmulator.getServiceUrl(this.botEndpoint.botUrl),
        user: this.botEmulator.facilities.users.usersById(this.botEmulator.facilities.users.currentUserId),
      },
      value: updateValue,
    } as IInvokeActivity;

    const { response } = await this.postActivityToBot(activity as Activity, false);

    // TODO: Should we record this in transcript? It looks like normal IInvokeActivity

    return response;
  }

  private postage(recipientId: string, activity: Partial<Activity>, isHistoric: boolean = false): Activity {
    const date = moment();

    const timestamp = isHistoric ? activity.timestamp : date.toISOString();
    const recipient = isHistoric ? activity.recipient : ({ id: recipientId } as ChannelAccount);

    return {
      ...activity,
      channelId: 'emulator',
      conversation: activity.conversation || ({ id: this.conversationId } as ConversationAccount),
      id: activity.id || uniqueId(),
      localTimestamp: date.format(),
      recipient,
      timestamp,
    } as Activity;
  }

  private addActivityToQueue(activity: Activity) {
    if (!(activity.channelData || {}).postback) {
      this.activities = [...this.activities, { activity, watermark: this.nextWatermark++ }];
      this.emit('addactivity', { activity });
    }

    if (activity && activity.recipient) {
      this.botEmulator.facilities.logger.logActivity(this.conversationId, activity, activity.recipient.role);
    }
  }
}

class DataUrlEncoder {
  constructor(public bot: BotEmulator) {
    // the constructor only exists so we can pass in the bot
  }

  public async traverseActivity(activity: Activity) {
    const IMessageActivity = activity as IMessageActivity;
    if (IMessageActivity) {
      await this.traverseIMessageActivity(IMessageActivity);
    }
  }

  public async traverseIMessageActivity(IMessageActivity: IMessageActivity) {
    if (IMessageActivity && IMessageActivity.attachments) {
      for (let i = 0; i < IMessageActivity.attachments.length; i++) {
        await this.traverseAttachment(IMessageActivity.attachments[i]);
      }
    }
  }

  public async traverseAttachment(attachment: Attachment) {
    if (attachment && attachment.contentUrl) {
      await this.visitContentUrl(attachment);
    }
  }

  protected async visitContentUrl(attachment: Attachment) {
    if (this.shouldBeDataUrl(attachment.contentUrl)) {
      attachment.contentUrl = await this.makeDataUrl(attachment.contentUrl);
    }
  }

  protected async makeDataUrl(url: string): Promise<string> {
    let resultUrl = url;
    const imported = await this.bot.options.fetch(url, {});
    if (parseInt(imported.headers.get('content-length'), 10) < maxDataUrlLength) {
      const buffer = await imported.buffer();
      const encoded = Buffer.from(buffer).toString('base64');
      const typeString = imported.headers.get('content-type');
      resultUrl = 'data:' + typeString + ';base64,' + encoded;
    }
    return resultUrl;
  }

  protected shouldBeDataUrl(url: string): boolean {
    return url && (isLocalHostUrl(url) || url.indexOf('ngrok') !== -1);
  }
}
