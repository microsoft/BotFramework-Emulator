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

import { ChannelAccount, ConversationAccount } from './accountTypes';
import { Attachment } from './attachmentTypes';
import { Entity } from './entityTypes';
import { ETagObject } from './eTagTypes';

export type ActivityOrID = {
  activity?: GenericActivity
  id?: string
};

export interface Activity extends ETagObject {
  type?: string;
  id?: string;
  serviceUrl?: string;
  timestamp?: string;
  localTimestamp?: string;
  channelId?: string;
  from?: ChannelAccount;
  conversation?: ConversationAccount;
  recipient?: ChannelAccount;
  replyToId?: string;
  channelData?: any;

  // Added when clicking on activity in web chat or log
  showInInspector?: boolean;
}

export interface TypingActivity extends Activity {
}

export interface ConversationUpdateActivity extends Activity {
  membersAdded?: ChannelAccount[];
  membersRemoved?: ChannelAccount[];
  topicName?: string;
  historyDisclosed?: boolean;
}

export interface ConversationParameters extends Activity {
  isGroup: boolean;
  bot: ChannelAccount;
  members?: ChannelAccount[];
  membersRemoved?: ChannelAccount[];
  topicName?: string;
  activity?: Activity;
  channelData?: any;
  conversationId?: string;
}

export interface ContactRelationUpdateActivity extends Activity {
  action?: string;
}

export interface MessageActivity extends Activity {
  text?: string;
  summary?: string;
  textFormat?: string;
  attachmentLayout?: string;
  attachments?: Attachment[];
  entities?: Entity[];
}

export interface ActionActivity extends Activity {
}

export interface EndOfConversationActivity extends Activity {
}

export interface TriggerActivity extends Activity {
  value?: any;
}

export interface ConversationReference {
  activityId: string;
  bot: ChannelAccount;
  channelId: string;
  conversation: ConversationAccount;
  serviceUrl: string;
  user: ChannelAccount;
}

export interface InvokeActivity extends Activity {
  name?: string;
  value?: any;
  relatesTo?: ConversationReference;
}

export interface EventActivity extends Activity {
  name?: string;
  value?: any;
  relatesTo?: ConversationReference;
}

export interface GenericActivity extends
  Activity,
  TypingActivity,
  ConversationUpdateActivity,
  ContactRelationUpdateActivity,
  MessageActivity,
  ActionActivity,
  EndOfConversationActivity,
  TriggerActivity,
  EventActivity,
  InvokeActivity {
}

export interface TraceActivity extends Activity {
  name?: string;
  value?: any;
  label?: string;
  valueType?: string;
}
