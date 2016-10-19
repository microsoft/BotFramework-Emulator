import * as request from 'request';
import * as http from 'http';
import { Settings } from '../types/settingsTypes';
import { IChannelAccount, IConversationAccount } from '../types/accountTypes';
import { IActivity, IConversationUpdateActivity } from '../types/activityTypes';
import { uniqueId } from '../utils';
import * as SettingsServer from '../settings/settingsServer';


/**
 * Stores and propagates conversation messages.
 */
export class Conversation {
    botId: string;
    conversationId: string;
    activities: IActivity[] = [];

    constructor(botId: string, conversationId: string) {
        this.botId = botId;
        this.conversationId = conversationId;
    }

    private postage = (recipientId: string, activity: IActivity) => {
        activity.id = uniqueId();
        activity.channelId = 'emulator';
        activity.timestamp = (new Date()).toISOString();
        activity.recipient = { id: recipientId };
        activity.conversation = { id: this.conversationId };
    }

    /**
     * Sends the activity to the conversation's bot.
     */
    postActivityToBot = (activity: IActivity) => {
        this.postage(this.botId, activity);
        this.activities.push(Object.assign({}, activity));
        const bot = SettingsServer.settings().botById(this.botId);
        if (bot) {
            var statusCode = '';
            request({ url: bot.botUrl, method: "POST", json: activity })
            .on('error', (e: Error) => {
                console.error(e.message);
            })
            .on('response', (resp: http.IncomingMessage) => {
                statusCode = `${resp.statusCode}`;
                if (!statusCode.match(/$2\d\d^/)) {
                    resp.setEncoding('utf8');
                    var body: string;
                    resp.on('data', (chunk: string) => {
                        body += chunk;
                    }).on('end', () => {
                        console.log(body);
                    });
                }
            });
        } else {
            console.error("Conversation.postToBot: bot not found! How does this conversation exist?", this.botId);
        }
    }

    sendBotAddedToConversation = () => {
        const activity: IConversationUpdateActivity = {
            type: 'conversationUpdate',
            channelId: 'emulator',
            from: {
                id: this.conversationId
            },
            membersAdded: [{ id: this.botId }]
        }
        this.postActivityToBot(activity);
    }

    /**
     * Queues activity for delivery to user.
     */
    postActivityToUser = (activity: IActivity) => {
        this.postage('', activity);
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
 * A set of conversations with a bot.
 */
class ConversationSet {
    botId: string;
    conversations: Conversation[] = [];

    constructor(botId: string) {
        this.botId = botId;
    }

    newConversation = (): Conversation => {
        const conversation = new Conversation(this.botId, uniqueId());
        this.conversations.push(conversation);
        return conversation;
    }

    conversationById = (conversationId: string): Conversation => {
        return this.conversations.find(value => value.conversationId === conversationId);
    }
}


/**
 * Container for conversation instances.
 */
export class ConversationManager {
    conversationSets: ConversationSet[] = [];

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
        const deadBotIds = this.conversationSets.filter(set => !settings.bots.find(bot => bot.botId === set.botId)).map(conversation => conversation.botId);
        this.conversationSets = this.conversationSets.filter(set => !deadBotIds.find(botId => set.botId === botId));
    }

    /**
     * Creates a new conversation.
     */
    newConversation = (botId: string): Conversation => {
        let conversationSet = this.conversationSets.find(value => value.botId === botId);
        if (!conversationSet) {
            conversationSet = new ConversationSet(botId);
            this.conversationSets.push(conversationSet);
        }
        let conversation = conversationSet.newConversation();
        return conversation;
    }

    /**
     * Gets the existing conversation, or returns undefined.
     */
    conversationById = (botId: string, conversationId: string): Conversation => {
        const set = this.conversationSets.find(set => set.botId === botId);
        if (set) {
            return set.conversationById(conversationId);
        }
    }
}
