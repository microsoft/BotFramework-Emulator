/// <summary>
/// Channel account information needed to route a message
/// </summary>
export class ChannelAccount {
    /// <summary>
    /// Create an instance of the ChannelAccount class
    /// </summary>
    constructor(public id: string = null) {
    }

    /// <summary>
    /// Channel id for the user or bot on this channel (Example: joe@smith.com, or @joesmith or 123456)
    /// </summary>
    //id: string;

    /// <summary>
    /// Display friendly name
    /// </summary>
    name: string;
}

/// <summary>
/// Channel account information for a conversation
/// </summary>
export class ConversationAccount extends ChannelAccount {
    /// <summary>
    /// Create an instance of the ConversationAccount class
    /// </summary>
    constructor(id: string = null) {
        super(id);
    }

    /// <summary>
    /// Is this a reference to a group
    /// </summary>
    isGroup: boolean;
}
