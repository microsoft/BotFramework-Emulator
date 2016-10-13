import { IChannelAccount, IConversationAccount } from './accountTypes';
import { IAttachment } from './attachmentTypes';
import { IEntity } from './entityTypes';
import { IETagObject } from './eTagTypes';


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

export interface IGenericActivity extends
    IActivity,
    ITypingActivity,
    IConversationUpdateActivity,
    IContactRelationUpdateActivity,
    IMessageActivity,
    IActionActivity,
    IEndOfConversationActivity {
}