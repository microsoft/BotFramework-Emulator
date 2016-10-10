import { IConversation } from './conversationTypes';
import { uniqueId } from './utils';

export class ConversationStore {
    conversations: { [key: string]: IConversation } = {};

    newConversation = (streamUrl: string): IConversation => {
        let conversation: IConversation = {
            eTag: "*",
            conversationId: uniqueId(),
            token: "emulator",
            expires_in: -1,
            streamUrl: streamUrl
        };

        this.conversations[conversation.conversationId] = conversation;

        return conversation;
    }
}
