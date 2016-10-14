import * as request from 'request';
import { Settings } from './types/settingsTypes';
import { IActivity } from './types/activityTypes';
import { uniqueId } from './utils';
import * as SettingsServer from './settings/settingsServer';


/**
 * Stores and propagates conversation messages.
 */
export class Conversation {
    activities: IActivity[] = [];

    constructor(public conversationId: string) {
        // NOTE: conversationId is a botId
    }

    /**
     * Sends the activity to the conversation's bot.
     */
    postActivityToBot = (activity: IActivity) => {
        activity.id = uniqueId();
        this.activities.push(Object.assign({}, activity));
        const bot = SettingsServer.settings().botById(this.conversationId);
        if (!bot) {
            console.error("Conversation.postToBot: bot not found! How does this conversation exist?", this.conversationId);
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
        activity.id = uniqueId();
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

    constructor() {
        SettingsServer.store.subscribe(() => {
            this.configure();
        });
        this.configure();
    }

    /**
     * Applies configuration changes.
     */
    private configure = () => {
        // Remove conversations that reference nonexistent bots.
        const settings = SettingsServer.settings();
        const deadConversationIds = this.conversations.filter(conversation => !settings.bots.find(bot => bot.botId === conversation.conversationId)).map(conversation => conversation.conversationId);
        this.conversations = this.conversations.filter(conversation => !deadConversationIds.find(conversationId => conversation.conversationId === conversationId));
    }

    /**
     * Creates a new conversation.
     */
    newConversation = (botId: string): Conversation => {
        let conversation = this.conversationById(botId);
        if (!conversation) {
            conversation = new Conversation(botId);
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
