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
  EmulatorMode,
  ErrorCodes,
  externalLinkItem,
  isLocalHostUrl,
  LogLevel,
  networkRequestItem,
  networkResponseItem,
  ResourceResponse,
  textItem,
  TranscriptRecord,
  User,
} from '@bfemulator/sdk-shared';
import {
  Activity,
  Attachment,
  ChannelAccount,
  ConversationAccount,
  IContactRelationUpdateActivity,
  IMessageActivity,
} from 'botframework-schema';
import { traceContainsDebugData, ValueTypesMask } from '@bfemulator/app-shared';

import { TokenCache } from '../routes/channel/userToken/tokenCache';
import { createAPIException } from '../utils/createResponse/createAPIException';
import { createResourceResponse } from '../utils/createResponse/createResourceResponse';
import { uniqueId } from '../utils/uniqueId';
import { EmulatorRestServer } from '../restServer';

import { BotEndpoint } from './botEndpoint';

// moment currently does not export callable function
// eslint-disable-next-line @typescript-eslint/no-var-requires
const moment = require('moment');
const maxDataUrlLength = Math.pow(2, 22);

interface ActivityBucket {
  activity: Activity;
  watermark: number;
}

/**
 * Stores and propagates conversation messages.
 */
export class Conversation extends EventEmitter {
  public botEndpoint: BotEndpoint;
  public conversationId: string;
  public emulatorServer: EmulatorRestServer;
  public user: User;
  public mode: EmulatorMode;
  public codeVerifier: string = undefined;
  public members: User[] = [];
  public nextWatermark = 0;
  // the list of activities in this conversation
  private activities: ActivityBucket[] = [];
  private transcript: TranscriptRecord[] = [];

  private get conversationIsTranscript() {
    return this.conversationId.includes('transcript');
  }

  constructor(
    emulatorServer: EmulatorRestServer,
    botEndpoint: BotEndpoint,
    conversationId: string,
    user: User,
    mode: EmulatorMode
  ) {
    super();
    Object.assign(this, { emulatorServer, botEndpoint, conversationId, user, mode });
    // We should consider hardcoding bot id because we don't really use it
    this.members.push({
      id: (botEndpoint && botEndpoint.botId) || 'bot-1',
      name: 'Bot',
    });
    this.members.push({ id: user.id, name: user.name });
  }

  public normalize(): void {
    this.transcript.length = 0;
    this.activities.length = 0;
  }

  /**
   * Sends the activity to the conversation's bot.
   */
  public async postActivityToBot(activity: Activity, recordInConversation: boolean) {
    if (!this.botEndpoint) {
      return this.emulatorServer.logger.logMessage(
        this.conversationId,
        textItem(
          LogLevel.Error,
          `This conversation does not have an endpoint, cannot post "${activity && activity.type}" activity.`
        )
      );
    }

    activity = await this.prepActivityToBeSentToBot(activity, recordInConversation);

    if (
      !this.conversationIsTranscript &&
      !isLocalHostUrl(this.botEndpoint.botUrl) &&
      isLocalHostUrl(activity.serviceUrl)
    ) {
      this.emulatorServer.logger.logMessage(
        this.conversationId,
        textItem(
          LogLevel.Error,
          'Error: The bot is remote, but the service URL is localhost.' +
            ' Without tunneling software you will not receive replies.'
        )
      );
      this.emulatorServer.logger.logMessage(
        this.conversationId,
        externalLinkItem('Connecting to bots hosted remotely', 'https://aka.ms/cnjvpo')
      );
      this.emulatorServer.logger.logMessage(this.conversationId, appSettingsItem('Configure a tunnel'));
    }

    const options = {
      body: JSON.stringify(activity),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    };

    let status = 200;
    let resp: any = { json: async () => ({}) };

    // If a message to the bot was triggered from a transcript, don't actually send it.
    // This can happen when clicking a button in an adaptive card, for instance.
    if (!this.conversationIsTranscript) {
      resp = await this.botEndpoint.fetchWithAuth(this.botEndpoint.botUrl, options);
      status = resp.status;
    }

    return {
      updatedActivity: activity,
      response: resp,
      statusCode: status,
    };
  }

  public async sendConversationUpdate(membersAdded: User[], membersRemoved: User[]) {
    if (this.mode === 'debug') {
      return;
    }
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
      this.emulatorServer.logger.logException(this.conversationId, result.response);
    }

    const { headers, message } = result.response;
    this.emulatorServer.logger.logMessage(
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
        { id: result.activityId, message },
        headers,
        result.statusCode,
        result.status,
        '/v3/directline/conversations'
      ),
      textItem(LogLevel.Debug, `directline.conversationUpdate`)
    );
  }

  // This function turns local contentUrls into dataUrls://
  public async processActivityForDataUrls(activity: Activity): Promise<Activity> {
    const visitor = new DataUrlEncoder(this.emulatorServer);

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
      this.emulatorServer.logger.logException(this.conversationId, err);
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
      this.emulatorServer.logger.logException(this.conversationId, err);
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
      this.emulatorServer.logger.logException(this.conversationId, err);
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
      this.emulatorServer.logger.logException(this.conversationId, err);
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
      this.emulatorServer.logger.logException(this.conversationId, err);
    }

    this.transcript = [...this.transcript, { type: 'user data delete', activity }];
    this.emit('transcriptupdate');
  }

  public async sendTokenResponse(connectionName: string, token: string, doNotCache?: boolean) {
    const userId = this.user.id;

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

  public prepTranscriptActivities(activities: Activity[]): Activity[] {
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
    return activities;
  }

  /**
   * Gets the transcript, extracting values based on
   * the (optional) valueTypesToExtract bitmask. If the valueTypesToExtract is
   * not included in the bitmask, the entire activity is
   * included. Otherwise, the value of the activity is extracted.
   *
   * @param valueTypesToExtract a bitmask representing the value Types to extract from the activity
   */
  public async getTranscript(valueTypesToExtract = 0): Promise<Activity[]> {
    const activities = this.transcript
      .filter(record => record.type === 'activity add')
      .map(record => {
        const { activity } = record;
        const extractValue =
          valueTypesToExtract && activity.valueType && !!(valueTypesToExtract & ValueTypesMask[activity.valueType]); // bitwise intentional
        return extractValue ? activity.value : activity;
      });
    for (let i = 0; i < activities.length; i++) {
      await this.processActivityForDataUrls(activities[i]);
    }
    return activities;
  }

  public postage(recipientId: string, activity: Partial<Activity>, isHistoric = false): Activity {
    const date = moment();
    const timestamp = isHistoric ? activity.timestamp : date.toISOString();
    const recipient = isHistoric ? activity.recipient : ({ id: recipientId } as ChannelAccount);

    return {
      ...activity,
      channelId: 'emulator',
      conversation: activity.conversation || ({ id: this.conversationId } as ConversationAccount),
      id: uniqueId(),
      localTimestamp: date.format(),
      recipient,
      timestamp,
    } as Activity;
  }

  public prepActivityToBeSentToUser(userId: string, activity: Activity): Activity {
    activity = this.postage(userId, activity, false);
    if (!activity.from.name) {
      activity.from.name = 'Bot';
    }

    if (activity.name === 'ReceivedActivity') {
      activity.value.from.role = 'user';
    } else if (activity.name === 'SentActivity') {
      activity.value.from.role = 'bot';
    }

    if (!activity.locale) {
      activity.locale = this.emulatorServer.state.locale;
    }

    // Fill in role field, if missing
    if (!activity.recipient.role) {
      activity.recipient.role = 'user';
    }

    // internal tracking
    this.addActivityToQueue(activity);
    this.transcript = [...this.transcript, { type: 'activity add', activity }];
    return activity;
  }

  public async prepActivityToBeSentToBot(activity: Activity, recordInConversation: boolean): Promise<Activity> {
    // Do not make a shallow copy here before modifying
    activity = this.postage(this.botEndpoint.botId, activity);
    activity.from = activity.from || this.user;
    activity.locale = this.emulatorServer.state.locale;

    if (!activity.recipient.name) {
      activity.recipient.name = 'Bot';
    }

    // Fill in role field, if missing
    if (!activity.recipient.role) {
      activity.recipient.role = 'bot';
    }

    activity.serviceUrl = await this.emulatorServer.getServiceUrl(this.botEndpoint.botUrl);

    if (recordInConversation) {
      this.addActivityToQueue({ ...activity } as Activity);
    }

    this.transcript = [...this.transcript, { type: 'activity add', activity }];
    this.emit('transcriptupdate');

    return { ...activity };
  }

  private addActivityToQueue(activity: Activity) {
    if (this.mode === 'debug' && !traceContainsDebugData(activity)) {
      return;
    }

    if (!(activity.channelData || {}).postback) {
      this.activities = [...this.activities, { activity, watermark: this.nextWatermark++ }];
    }

    if (activity && activity.recipient) {
      this.emulatorServer.logger.logActivity(this.conversationId, activity, activity.recipient.role);
    }
  }
}

class DataUrlEncoder {
  constructor(public bot: EmulatorRestServer) {
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
    return url && isLocalHostUrl(url);
  }
}
