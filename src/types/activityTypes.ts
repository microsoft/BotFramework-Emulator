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

import { IChannelAccount, IConversationAccount } from './accountTypes';
import { IAttachment } from './attachmentTypes';
import { IEntity } from './entityTypes';
import { IETagObject } from './eTagTypes';


export type ActivityOrID = {
    activity?: IGenericActivity
    id?: string
}

export interface IActivity extends IETagObject {
    type?: string,
    id?: string,
    serviceUrl?: string,
    timestamp?: string,
    channelId?: string,
    from?: IChannelAccount,
    conversation?: IConversationAccount,
    recipient?: IChannelAccount,
    replyToId?: string,
    channelData?: any,
};

export interface ITypingActivity extends IActivity {
}

export interface IConversationUpdateActivity extends IActivity {
    membersAdded?: IChannelAccount[],
    membersRemoved?: IChannelAccount[],
    topicName?: string,
    historyDisclosed?: boolean,
}

export interface IConversationParameters extends IActivity {
    isGroup: boolean,
    bot: IChannelAccount,
    members?: IChannelAccount[],
    membersRemoved?: IChannelAccount[],
    topicName?: string,
    activity?: IActivity,
    channelData?: any,
    conversationId?: string
}

export interface IContactRelationUpdateActivity extends IActivity {
    action?: string
}

export interface IMessageActivity extends IActivity {
    locale?: string,
    text?: string,
    summary?: string,
    textFormat?: string,
    attachmentLayout?: string,
    attachments?: IAttachment[],
    entities?: IEntity[],
}

export interface IActionActivity extends IActivity {
}

export interface IEndOfConversationActivity extends IActivity {
}

export interface ITriggerActivity extends IActivity {
    value?: any;
}

export interface IGenericActivity extends
    IActivity,
    ITypingActivity,
    IConversationUpdateActivity,
    IContactRelationUpdateActivity,
    IMessageActivity,
    IActionActivity,
    IEndOfConversationActivity,
    ITriggerActivity {
}

