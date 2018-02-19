import * as ChatActions from '../action/chat';
import { IActivity } from 'botframework-emulator-shared/built/types/activityTypes';

export interface ILiveChatState {
  activities: IActivity[];
  watermark: number;
}

export interface ILiveChats {
  [conversationId: string]: ILiveChatState
}

export interface IChatState {
  liveChats: ILiveChats;
}

export const DEFAULT_STATE: IChatState = {
  liveChats: {}
}

export type ChatAction = {
  type: ChatActions.T_NEW,
  payload: {
    conversationId: string,
  }
}

export const chat: any = (state: IChatState, action: ChatAction) => {
  state = state || DEFAULT_STATE
  const payload = action.payload;

  switch (action.type) {
    case ChatActions.NEW: {
      state = {
        ...state,
        liveChats: {
          ...state.liveChats,
          [payload.conversationId]: {
            activities: [],
            watermark: 0
          }
        }
      }
    }
      break;
  }

  return state;
}
