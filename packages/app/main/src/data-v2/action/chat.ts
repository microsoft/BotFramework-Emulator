import { uniqueId } from 'botframework-emulator-shared/built/utils';


export const NEW = 'CHAT/LIVE/NEW';
export type T_NEW = 'CHAT/LIVE/NEW';

export function newLiveChat() {
  return {
    type: NEW,
    payload: {
      conversationId: uniqueId()
    }
  }
}
