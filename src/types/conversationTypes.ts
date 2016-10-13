import { IETagObject } from './eTagTypes';


export interface IConversation extends IETagObject {
    conversationId: string,
    token: string,
    expires_in: number,
    streamUrl?: string,
}
