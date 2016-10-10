/*
import {IActivity} from './activityTypes';

let conversationCounter = 0;
let tokenCounter = 0;

let conversations: { [key: string]: Conversation } = {};

export class AttachmentCrate {
    url: string;
    contentType: string;
}

export class ActivitySet {
    activities = new Array<ActivitySet>();
    watermark: string;
    eTag: string;
}

export class Conversation {
    id: string;
    token: string;
    name: string;
    messages = new Array<Message>();

    public postMessageFromUser = (message: ) => {
        let msg = new Message();
        msg.id = `${this.messages.length}`;
        msg.eTag = message.eTag;
        msg.conversationId = this.id;
        msg.created = Date.now();
        msg.from = message.from;
        msg.text = message.text;
        msg.channelData = message.channelData;
        this.messages.push(msg);

        // TODO: Add user to conversation

        // TODO: Post message to bot
    }

    public getMessagesSince = (watermark: string): MessageSet => {
        let index = +watermark;
        let messageset = new MessageSet();
        let slice = this.messages.slice(index);
        messageset.messages = messageset.messages.concat(slice);
        messageset.watermark = `${index + slice.length}`;
        return messageset;
    }
}

export namespace Operators {

    export const postActivity = (conversation: Conversation, activity: IActivity) => {

    }
}

export const newConversation = (): Conversation => {
    let conversationId = nextConversationId();
    let conversation = new Conversation();
    conversation.id = conversationId;
    conversation.token = `${++tokenCounter}`;
    conversation.name = makeConversationName(conversationId);
    conversations[conversation.id] = conversation;
    return conversation;
}

export const getConversation = (conversationId: string): Conversation => {
    return conversations[conversationId];
}

export const nextConversationId = (): string => {
    return `${++conversationCounter}`;
}

export const makeConversationName = (conversationId: string): string => {
    return `Conversation ${conversationId}`;
}

*/