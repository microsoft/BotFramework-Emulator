import store from './store';

export function documentIdForConversation(conversationId) {
  const state = store.getState();
  for (let key in state.chat.liveChats) {
    if (state.chat.liveChats[key].conversationId === conversationId) {
      return state.chat.liveChats[key].documentId
    }
  }
  return undefined;
}
