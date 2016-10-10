import { ChannelAccount, ConversationAccount } from './accountTypes';
import { AttachmentCrate as Attachment } from './attachmentTypes';
import { Entity } from './entityTypes';

/// <summary>
/// basic shared properties for all activities
/// </summary>
export interface IActivity {
    /// <summary>
    /// Activity type
    /// </summary>
    type?: string;

    /// <summary>
    /// Id for the activity
    /// </summary>
    id?: string;

    /// <summary>
    /// (PROPOSED) ServiceUrl
    /// </summary>
    serviceUrl?: string;

    /// <summary>
    /// Time when message was sent
    /// </summary>
    timestamp?: string;

    /// <summary>
    /// Channel this activity is associated with
    /// </summary>
    channelId?: string;

    /// <summary>
    /// Sender address data
    /// </summary>
    from?: ChannelAccount;

    /// <summary>
    /// Address for the conversation that this activity is associated with
    /// </summary>
    conversation?: ConversationAccount;

    /// <summary>
    /// (Outbound to bot only) Bot's address that received the message
    /// </summary>
    recipient?: ChannelAccount;

    /// <summary>
    /// the original id this message is a response to
    /// </summary>
    replyToId?: string;

    /// <summary>
    /// Channel specific payload
    /// </summary>
    /// <remarks>
    /// Some channels will provide channel specific data.
    ///
    /// For a message originating in the channel it might provide the original native schema object for the channel.
    ///
    /// For a message coming into the channel it might accept a payload allowing you to create a "native" response for the channel.
    ///
    /// Example:
    /// * Email - The Email Channel will put the original Email metadata into the ChannelData object for outgoing messages, and will accep
    /// on incoming message a Subject property, and a HtmlBody which can contain Html.
    ///
    /// The channel data essentially allows a bot to have access to native functionality on a per channel basis.
    /// </remarks>
    channelData?: any;
};

/// <summary>
/// The From address is typing
/// </summary>
export interface ITypingActivity extends IActivity {
}

/// <summary>
/// The Properties of a conversation are different
/// </summary>
export interface IConversationUpdateActivity extends IActivity {
    /// <summary>
    /// Array of address added
    /// </summary>
    membersAdded?: Array<ChannelAccount>;

    /// <summary>
    /// Array of addresses removed
    /// </summary>
    membersRemoved?: Array<ChannelAccount>;

    /// <summary>
    /// Conversations new topic name
    /// </summary>
    topicName?: string;

    /// <summary>
    /// the previous history of the channel was disclosed
    /// </summary>
    historyDisclosed?: boolean;
}

/// <summary>
/// Someone has updated their contact list
/// </summary>
export interface IContactRelationUpdateActivity extends IActivity {
    /// <summary>
    /// add|remove
    /// </summary>
    action?: string;
}

/// <summary>
/// Someone has added a message to the conversation
/// </summary>
export interface IMessageActivity extends IActivity {
    /// <summary>
    /// The language code of the Text field
    /// </summary>
    /// <remarks>
    /// See https://msdn.microsoft.com/en-us/library/hh456380.aspx for a list of valid language codes
    /// </remarks>
    locale?: string;

    /// <summary>
    /// Text for the message
    /// </summary>
    text?: string;

    /// <summary>
    /// Text for the message
    /// </summary>
    summary?: string;

    /// <summary>
    /// Format of text fields [plain|markdown|xml] default:markdown
    /// </summary>
    textFormat?: string;

    /// <summary>
    /// AttachmentLayout - hint for how to deal with multiple attachments Values: [list|carousel] default:list
    /// </summary>
    attachmentLayout?: string;

    /// <summary>
    /// content attachemnts
    /// </summary>
    attachments?: Array<Attachment>;

    /// <summary>
    /// Entities
    /// Collection of objects which contain metadata about this activity
    /// </summary>
    entities?: Array<Entity>;
}

/// <summary>
/// User took action on a message (button click)
/// </summary>
export interface IActionActivity extends IActivity {
}

/// <summary>
/// Conversation is ending, or a request to end the conversation
/// </summary>
export interface IEndOfConversationActivity extends IActivity {
}

/// <summary>
/// An Activity is the basic communication type for the Bot Framework 3.0 protocol
/// </summary>
/// <remarks>
/// The Activity class contains all properties that individual, more specific activities
/// could contain. It is a superset type.
/// </remarks>
export class Activity implements
    IActivity,
    IConversationUpdateActivity,
    IContactRelationUpdateActivity,
    IMessageActivity,
    ITypingActivity,
    IActionActivity,
    IEndOfConversationActivity {
    constructor(public type: string = null) {

    }

    /// <summary>
    /// Id for the activity
    /// </summary>
    id: string;

    /// <summary>
    /// Time when message was sent
    /// </summary>
    timestamp: string;

    /// <summary>
    /// Service endpoint
    /// </summary>
    serviceUrl: string;

    /// <summary>
    /// ChannelId the activity was on
    /// </summary>
    channelId: string;

    /// <summary>
    /// Sender address
    /// </summary>
    from: ChannelAccount;

    /// <summary>
    /// Conversation
    /// </summary>
    conversation: ConversationAccount;

    /// <summary>
    /// (Outbound to bot only) Bot's address that received the message
    /// </summary>
    recipient: ChannelAccount;

    /// <summary>
    /// Format of text fields [plain|markdown] Default:markdown
    /// </summary>
    textFormat: string;

    /// <summary>
    /// AttachmentLayout - hint for how to deal with multiple attachments Values: [list|carousel] Default:list
    /// </summary>
    attachmentLayout: string;

    /// <summary>
    /// Array of address added
    /// </summary>
    membersAdded = new Array<ChannelAccount>();

    /// <summary>
    /// Array of addresses removed
    /// </summary>
    membersRemoved = new Array<ChannelAccount>();

    /// <summary>
    /// Conversations new topic name
    /// </summary>
    topicName: string;

    /// <summary>
    /// the previous history of the channel was disclosed
    /// </summary>
    historyDisclosed: boolean;

    /// <summary>
    /// The language code of the Text field
    /// </summary>
    /// <remarks>
    /// See https://msdn.microsoft.com/en-us/library/hh456380.aspx for a list of valid language codes
    /// </remarks>
    locale: string;

    /// <summary>
    /// Content for the message
    /// </summary>
    text: string;

    /// <summary>
    /// Text to display if you can't render cards
    /// </summary>
    summary: string;

    /// <summary>
    /// Attachments
    /// </summary>
    attachments = new Array<Attachment>();

    /// <summary>
    /// Collection of Entity objects, each of which contains metadata about this activity. Each Entity object is typed.
    /// </summary>
    entities = new Array<Entity>();

    /// <summary>
    /// Channel specific payload
    /// </summary>
    /// <remarks>
    /// Some channels will provide channel specific data.
    ///
    /// For a message originating in the channel it might provide the original native schema object for the channel.
    ///
    /// For a message coming into the channel it might accept a payload allowing you to create a "native" response for the channel.
    ///
    /// Example:
    /// * Email - The Email Channel will put the original Email metadata into the ChannelData object for outgoing messages, and will accep
    /// on incoming message a Subject property, and a HtmlBody which can contain Html.
    ///
    /// The channel data essentially allows a bot to have access to native functionality on a per channel basis.
    /// </remarks>
    channelData: any;

    /// <summary>
    /// ContactAdded/Removed action
    /// </summary>
    action: string;

    /// <summary>
    /// the original id this message is a response to
    /// </summary>
    replyToId: string;
}
