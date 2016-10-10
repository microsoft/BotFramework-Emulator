import { IETagObject } from './eTagTypes';

export interface IConversation extends IETagObject {
    /// <summary>
    /// ID for this conversation
    /// </summary>
    conversationId: string;

    /// <summary>
    /// Token scoped to this conversation
    /// </summary>
    token: string;

    /// <summary>
    /// Expiration for token
    /// </summary>
    expires_in: number;

    /// <summary>
    /// URL for this conversation's message stream
    /// </summary>
    streamUrl?: string;
}
