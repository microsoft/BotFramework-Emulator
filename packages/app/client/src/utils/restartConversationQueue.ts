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
import { Activity } from 'botframework-schema';
import { SharedConstants, RestartConversationStatus } from '@bfemulator/app-shared';
import { ChatReplayData, IncomingActivityRecord } from '@bfemulator/app-shared';

export enum WebChatEvents {
  postActivity = 'DIRECT_LINE/POST_ACTIVITY',
  incomingActivity = 'DIRECT_LINE/INCOMING_ACTIVITY',
  rejectedActivity = 'DIRECT_LINE/POST_ACTIVITY_REJECTED',
}

export const webChatEventsToWatch: string[] = [WebChatEvents.postActivity, WebChatEvents.incomingActivity];

export class ConversationQueue {
  private userActivities: Activity[] = [];
  private replayDataFromOldConversation: ChatReplayData;
  private receivedActivities: Activity[];
  private conversationId: string;
  private nextActivityToBePosted: Activity = undefined;
  private isReplayComplete: boolean = false;
  private proactiveResponseValidationMap: Map<number, string>;

  constructor(
    activities: Activity[],
    chatReplayData: ChatReplayData,
    conversationId: string,
    replayToActivity: Activity
  ) {
    // Get all user activities
    this.userActivities = activities.filter(
      (activity: Activity) => activity.from.role === SharedConstants.Activity.USER_ROLE && activity.channelData
    );

    const trimActivityIndex: number = this.userActivities.findIndex(activity => activity.id === replayToActivity.id);
    if (trimActivityIndex !== -1) {
      this.userActivities = this.userActivities.splice(0, trimActivityIndex + 1);
    }

    this.conversationId = conversationId;
    this.replayDataFromOldConversation = chatReplayData;
    this.receivedActivities = [];
    this.proactiveResponseValidationMap = new Map();

    this.checkIfActivityToBePosted = this.checkIfActivityToBePosted.bind(this);
    this.handleIncomingActivity = this.handleIncomingActivity.bind(this);
  }

  private static dataURLtoFile(dataurl: string, filename: string) {
    const arr: string[] = dataurl.split(',');
    if (arr.length !== 2) {
      return undefined;
    }
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  }

  private checkIfActivityToBePosted() {
    try {
      if (
        !this.replayDataFromOldConversation.postActivitiesSlots.includes(this.receivedActivities.length) ||
        this.userActivities.length === 0
      ) {
        this.nextActivityToBePosted = undefined;
        return;
      }
      const activity: Activity = this.userActivities.shift();

      const matchIndexes = [];
      this.replayDataFromOldConversation.incomingActivities.forEach(
        (incomingActivity: IncomingActivityRecord, index: number) => {
          if (incomingActivity.replyToId === activity.id) {
            matchIndexes.push(index);
          }
        }
      );

      if (activity.attachments && activity.attachments.length >= 1) {
        const mutatedAttachments = activity.attachments.map(attachment => {
          const fileFormat: File = ConversationQueue.dataURLtoFile(attachment.contentUrl, attachment.name);
          return {
            ...attachment,
            contentUrl: fileFormat ? window.URL.createObjectURL(fileFormat) : '',
          };
        });
        activity.attachments = mutatedAttachments;
      }

      if (activity) {
        activity.conversation = {
          ...activity.conversation,
          id: this.conversationId,
        };
        activity.channelData = {
          ...activity.channelData,
          originalActivityId: activity.id,
          matchIndexes,
        };
        delete activity.id;
      }
      this.nextActivityToBePosted = activity;
    } catch (ex) {
      return undefined;
    }
  }

  public validateIfReplayFlow(replayStatus: RestartConversationStatus, actionType: string) {
    return !!(
      typeof replayStatus !== undefined &&
      actionType === WebChatEvents.incomingActivity &&
      replayStatus === RestartConversationStatus.Started
    );
  }

  public getNextActivityForPost(): Activity | undefined {
    return this.nextActivityToBePosted;
  }

  public get replayComplete(): boolean {
    return this.isReplayComplete;
  }

  public handleIncomingActivity(activity: Activity) {
    if (this.isReplayComplete) {
      return;
    }
    try {
      const indexToBeInserted: number = this.receivedActivities.length;
      if (
        this.proactiveResponseValidationMap.has(indexToBeInserted) &&
        this.proactiveResponseValidationMap.get(indexToBeInserted) !== activity.replyToId
      ) {
        throw new Error('Replayed activities not in order of original conversation');
      } else {
        this.proactiveResponseValidationMap.delete(indexToBeInserted);
      }
      this.receivedActivities.push(activity);

      if (activity.channelData && !activity.replyToId) {
        const matchIndexes: number[] = activity.channelData.matchIndexes;
        if (matchIndexes) {
          matchIndexes.forEach((index: number) => {
            if (!this.receivedActivities[index]) {
              this.proactiveResponseValidationMap.set(index, activity.id);
            } else if (this.receivedActivities[index].replyToId !== activity.id) {
              throw new Error('Replayed activities not in order of original conversation');
            }
          });
        }
      }

      if (this.userActivities.length === 0) {
        this.isReplayComplete = true;
      }
      this.checkIfActivityToBePosted();
    } catch (ex) {
      return ex;
    }
  }
}
