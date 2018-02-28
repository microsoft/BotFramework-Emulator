import store from './store';

export function getTabCount() {
  let count = 0;
  let state = store.getState();
  for (let key in state.editor.editors) {
    if (state.editor.editors[key]) {
      count += state.editor.editors[key].documents.length;
    }
  }
  return count;
}
