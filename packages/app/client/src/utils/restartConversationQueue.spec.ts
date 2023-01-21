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

import { ChatReplayData, RestartConversationStatus } from '@bfemulator/app-shared';
import { Activity } from 'botframework-schema';

import { replayScenarios } from '../../mocks/conversationQueueMocks';

import { ConversationQueue, WebChatEvents } from './restartConversationQueue';

describe('Restart Conversation Queue', () => {
  let scenarios;
  beforeEach(() => {
    scenarios = JSON.parse(JSON.stringify(replayScenarios));
  });

  it('should validate if it is in Replay conversational flow', () => {
    const { activitiesToBePosted, incomingActivities, postActivitiesSlots } = scenarios[2];
    const queue: ConversationQueue = new ConversationQueue(
      activitiesToBePosted,
      {
        incomingActivities,
        postActivitiesSlots,
      },
      '123',
      activitiesToBePosted[activitiesToBePosted.length - 1],
      jest.fn()
    );
    expect(queue.validateIfReplayFlow(RestartConversationStatus.Started, WebChatEvents.incomingActivity)).toBeTruthy();
    expect(queue.validateIfReplayFlow(RestartConversationStatus.Rejected, WebChatEvents.incomingActivity)).toBeFalsy();
    expect(queue.validateIfReplayFlow(undefined, WebChatEvents.incomingActivity)).toBeFalsy();
    expect(queue.validateIfReplayFlow(RestartConversationStatus.Started, WebChatEvents.postActivity)).toBeFalsy();
    expect(queue.validateIfReplayFlow(RestartConversationStatus.Started, 'WEBCHAT/SEND_TYPING')).toBeFalsy();
  });

  it('should give the correct activity to be posted next if available in scenario[0]', () => {
    const activities: any = scenarios[0].activitiesToBePosted;
    const chatReplayData: ChatReplayData = {
      incomingActivities: scenarios[0].incomingActivities,
      postActivitiesSlots: scenarios[0].postActivitiesSlots,
    };

    const queue: ConversationQueue = new ConversationQueue(activities, chatReplayData, '123', activities[1], jest.fn());
    expect(queue.getNextActivityForPost()).toBeUndefined();
    expect(queue.replayComplete).toBeFalsy();

    queue.handleIncomingActivity(chatReplayData.incomingActivities[0] as Activity);

    const postActivity: Activity = queue.getNextActivityForPost();
    expect(postActivity.channelData.matchIndexes).toEqual([1, 2]);

    const botResponsesForActivity: Activity[] = scenarios[0].botResponsesForActivity;

    queue.handleIncomingActivity(botResponsesForActivity[1]);
    expect(queue.getNextActivityForPost()).toBeUndefined();

    queue.handleIncomingActivity(botResponsesForActivity[2]);
    expect(queue.getNextActivityForPost()).toBeUndefined();

    const err = queue.handleIncomingActivity(botResponsesForActivity[3]);
    expect(err).toBeUndefined();
    expect(queue.getNextActivityForPost()).toBeDefined();
  });

  it('should throw error if activities arrive in the wrong order on replay in scenario[0]', () => {
    const activities: any = scenarios[0].activitiesToBePosted;
    const chatReplayData: ChatReplayData = {
      incomingActivities: scenarios[0].incomingActivities,
      postActivitiesSlots: scenarios[0].postActivitiesSlots,
    };

    const queue: ConversationQueue = new ConversationQueue(activities, chatReplayData, '123', activities[1], jest.fn());
    // Conversation Update
    queue.handleIncomingActivity(chatReplayData.incomingActivities[0] as Activity);

    const botResponsesForActivity: Activity[] = scenarios[0].botResponsesForActivity;

    queue.handleIncomingActivity(botResponsesForActivity[1]);
    expect(queue.getNextActivityForPost()).toBeUndefined();

    // The original conversation had 2 bot responses for the activity before an echoback
    const err = queue.handleIncomingActivity(botResponsesForActivity[3]);
    expect(err).toBeDefined();
    expect(queue.replayComplete).toBeFalsy();
  });

  it('should replay scenario1 without errors and should set replay to complete - Scenario[1]', () => {
    const { activitiesToBePosted, incomingActivities, postActivitiesSlots, botResponsesForActivity } = scenarios[1];
    const queue: ConversationQueue = new ConversationQueue(
      activitiesToBePosted,
      {
        incomingActivities,
        postActivitiesSlots,
      },
      '123',
      activitiesToBePosted[activitiesToBePosted.length - 1],
      jest.fn()
    );
    // Conversation Update
    let err;
    err = queue.handleIncomingActivity(incomingActivities[0]);
    expect(err).toBeUndefined();
    expect(queue.getNextActivityForPost()).toBeUndefined();
    queue.handleIncomingActivity(incomingActivities[1]);

    let activity = queue.getNextActivityForPost();
    expect(activity).toBeDefined();
    err = queue.handleIncomingActivity(botResponsesForActivity[2]);
    err = queue.handleIncomingActivity(botResponsesForActivity[3]);
    expect(err).toBeUndefined();
    err = queue.handleIncomingActivity(botResponsesForActivity[4]);
    err = queue.handleIncomingActivity(botResponsesForActivity[5]);
    expect(err).toBeUndefined();

    activity = queue.getNextActivityForPost();
    expect(activity).toBeDefined();
    err = queue.handleIncomingActivity(botResponsesForActivity[6]);
    err = queue.handleIncomingActivity(botResponsesForActivity[7]);
    expect(err).toBeUndefined();
    err = queue.handleIncomingActivity(botResponsesForActivity[8]);
    expect(err).toBeUndefined();
    expect(queue.replayComplete).toBeTruthy();
  });

  it('should handle multiple events sent before we get completion for the first one - Scenario[2]', () => {
    const { activitiesToBePosted, incomingActivities, postActivitiesSlots, botResponsesForActivity } = scenarios[2];
    const queue: ConversationQueue = new ConversationQueue(
      activitiesToBePosted,
      {
        incomingActivities,
        postActivitiesSlots,
      },
      '123',
      activitiesToBePosted[activitiesToBePosted.length - 1],
      jest.fn()
    );

    let err;
    queue.handleIncomingActivity(botResponsesForActivity[0]);

    const postActivity2: Activity = queue.getNextActivityForPost();
    expect(postActivity2).toBeDefined();
    expect(postActivity2.channelData.matchIndexes).toEqual([1, 4, 7, 8]);
    err = queue.handleIncomingActivity(botResponsesForActivity[1]);
    expect(err).toBeUndefined();

    const postActivity3: Activity = queue.getNextActivityForPost();
    expect(postActivity3.channelData.matchIndexes).toEqual([2, 3, 5]);

    queue.handleIncomingActivity(botResponsesForActivity[2]);
    queue.handleIncomingActivity(botResponsesForActivity[3]);
    queue.handleIncomingActivity(botResponsesForActivity[4]);
    queue.handleIncomingActivity(botResponsesForActivity[5]);
    //Act3 completed
    err = queue.handleIncomingActivity(botResponsesForActivity[6]);
    expect(err).toBeUndefined();
    expect(queue.getNextActivityForPost()).toBeUndefined();

    queue.handleIncomingActivity(botResponsesForActivity[7]);
    err = queue.handleIncomingActivity(botResponsesForActivity[8]);
    expect(err).toBeUndefined();
    expect(queue.getNextActivityForPost()).toBeUndefined();
    expect(queue.replayComplete).toBeFalsy();
  });

  it('should set replay complete once the last action that the user set for restart was fired - Scenario[2]', () => {
    const { activitiesToBePosted, incomingActivities, postActivitiesSlots, botResponsesForActivity } = scenarios[2];
    const queue: ConversationQueue = new ConversationQueue(
      activitiesToBePosted,
      {
        incomingActivities,
        postActivitiesSlots,
      },
      '123',
      activitiesToBePosted[activitiesToBePosted.length - 2],
      jest.fn()
    );

    queue.handleIncomingActivity(botResponsesForActivity[0]);
    queue.getNextActivityForPost();
    queue.handleIncomingActivity(botResponsesForActivity[1]);
    queue.getNextActivityForPost();
    queue.handleIncomingActivity(botResponsesForActivity[2]);
    // We have asked the queue to stop after posting 2 activities
    expect(queue.replayComplete).toBeTruthy();
  });

  it('should set replay complete after 3 actions have been posted - Scenario[2]', () => {
    const { activitiesToBePosted, incomingActivities, postActivitiesSlots, botResponsesForActivity } = scenarios[2];
    const queue: ConversationQueue = new ConversationQueue(
      activitiesToBePosted,
      {
        incomingActivities,
        postActivitiesSlots,
      },
      '123',
      activitiesToBePosted[activitiesToBePosted.length - 1],
      jest.fn()
    );

    queue.handleIncomingActivity(botResponsesForActivity[0]);
    queue.handleIncomingActivity(botResponsesForActivity[1]);
    queue.handleIncomingActivity(botResponsesForActivity[2]);
    queue.handleIncomingActivity(botResponsesForActivity[3]);
    queue.handleIncomingActivity(botResponsesForActivity[4]);
    queue.handleIncomingActivity(botResponsesForActivity[5]);
    queue.handleIncomingActivity(botResponsesForActivity[6]);
    queue.handleIncomingActivity(botResponsesForActivity[7]);
    expect(queue.replayComplete).toBeFalsy();
    queue.handleIncomingActivity(botResponsesForActivity[8]);
    queue.handleIncomingActivity(botResponsesForActivity[9]);
    const postActivity = queue.getNextActivityForPost();
    expect(postActivity).toBeDefined();
    queue.handleIncomingActivity(botResponsesForActivity[10]);
    expect(queue.replayComplete).toBeTruthy();
  });

  it('should set replay complete after progressive responses arrive - Scenario[3]', () => {
    const { activitiesToBePosted, incomingActivities, postActivitiesSlots, botResponsesForActivity } = scenarios[3];
    const queue: ConversationQueue = new ConversationQueue(
      activitiesToBePosted,
      {
        incomingActivities,
        postActivitiesSlots,
      },
      '123',
      activitiesToBePosted[activitiesToBePosted.length - 1],
      jest.fn()
    );

    queue.handleIncomingActivity(botResponsesForActivity[0]);
    queue.handleIncomingActivity(botResponsesForActivity[1]);
    queue.handleIncomingActivity(botResponsesForActivity[2]);
    queue.handleIncomingActivity(botResponsesForActivity[3]);
    queue.handleIncomingActivity(botResponsesForActivity[4]);
    queue.handleIncomingActivity(botResponsesForActivity[5]);
    queue.handleIncomingActivity(botResponsesForActivity[6]);
    queue.handleIncomingActivity(botResponsesForActivity[7]);
    queue.handleIncomingActivity(botResponsesForActivity[8]);
    queue.handleIncomingActivity(botResponsesForActivity[9]);
    queue.handleIncomingActivity(botResponsesForActivity[10]);
    queue.handleIncomingActivity(botResponsesForActivity[11]);
    queue.handleIncomingActivity(botResponsesForActivity[12]);
    let err = queue.handleIncomingActivity(botResponsesForActivity[13]);
    // Progressive response for Act2 arrived at the correct spot
    expect(err).toBeUndefined();
    err = queue.handleIncomingActivity(botResponsesForActivity[14]);
    // Another Progressive response for Act2 arrived at the correct spot
    expect(err).toBeUndefined();
  });
});
