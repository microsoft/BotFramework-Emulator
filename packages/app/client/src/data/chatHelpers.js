import store from './store';

export function documentIdForConversation(conversationId) {
  const state = store.getState();
  for (let key in state.chat.chats) {
    if (state.chat.chats[key].conversationId === conversationId) {
      return state.chat.chats[key].documentId
    }
  }
  return undefined;
}
