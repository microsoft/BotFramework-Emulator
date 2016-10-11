import { IConversation } from './conversationTypes';
import { uniqueId } from './utils';

export class ConversationStore {
    conversations: { [botId: string]: IConversation } = {};

    newConversationForBot = (botId: string, streamUrl: string): IConversation => {
        let conversation: IConversation = {
            eTag: "*",
            conversationId: uniqueId(),
            token: "emulator",
            expires_in: -1,
            streamUrl: streamUrl
        };

        this.conversations[botId] = conversation;

        return conversation;
    }

    getConversationForBot = (botId: string): IConversation => {
        return this.conversations[botId];
    }
}
