import * as request from 'request';
import { ISettings } from './settings/settingsStore';
import { IActivity } from './types/activityTypes';
import { uniqueId } from './utils';
import * as SettingsStore from './settings/settingsStore';


/**
 * Stores and propagates conversation messages.
 */
export class Conversation {
    messageId: number = 0;
    activities: IActivity[] = [];

    constructor(public conversationId: string, public botId: string) {
    }

    /**
     * Sends the activity to the conversation's bot.
     */
    postActivityToBot = (activity: IActivity) => {
        activity.id = `${this.messageId++}`;
        this.activities.push(Object.assign({}, activity));
        const bot = SettingsStore.botById(this.botId);
        if (!bot) {
            console.error("Conversation.postToBot: bot not found! How does this conversation exist?", this.botId);
        } else {
            request({
                url: bot.botUrl,
                method: "POST",
                json: activity
            });
        }
    }

    /**
     * Queues activity for delivery to user.
     */
    postActivityToUser = (activity: IActivity) => {
        activity.id = `${this.messageId++}`;
        this.activities.push(Object.assign({}, activity));
    }

    /**
     * Returns activities since the watermark.
     */
    getActivitiesSince = (watermark: number): IActivity[] => {
        return this.activities.slice(watermark);
    }
}


/**
 * Container for conversation instances.
 */
export class ConversationManager {
    conversations: Conversation[] = [];

    /**
     * Applies configuration changes.
     */
    configure = (settings: ISettings) => {
        // Remove conversations that reference nonexistent bots.
        const deadConversationIds = this.conversations.filter(conversation => !settings.bots.find(bot => bot.botId === conversation.botId)).map(conversation => conversation.conversationId);
        this.conversations = this.conversations.filter(conversation => !deadConversationIds.find(conversationId => conversation.conversationId === conversationId));
    }

    /**
     * Creates a new conversation.
     */
    newConversation = (botId: string): Conversation => {
        let conversation = this.conversations.find(value => value.botId == botId);
        if (!conversation) {
            conversation = new Conversation(uniqueId(), botId);
            this.conversations.push(conversation);
        }
        return conversation;
    }

    /**
     * Gets the existing conversation, or returns undefined.
     */
    conversationById = (conversationId: string): Conversation => {
        return this.conversations.find(value => value.conversationId === conversationId);
    }
}
