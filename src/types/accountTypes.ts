

export interface IChannelAccount {
    id?: string,
    name?: string,
}

export interface IConversationAccount extends IChannelAccount {
    isGroup?: boolean,
}
