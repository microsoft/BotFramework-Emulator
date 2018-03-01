import store from './store';
import * as EditorActions from './action/editorActions';
import * as Constants from '../constants';

export function hasNonGlobalTabs(tabGroups) {
  tabGroups = tabGroups || store.getState().editor.editors;
  let count = 0;
  for (let key in tabGroups) {
    if (tabGroups[key]) {
      count += tabGroups[key].documents.filter(document => !document.isGlobal).length;
    }
  }
  return count;
}

// @returns: name of editor group, or undefined if doc is not open.
export function getTabGroupForDocument(documentId, tabGroups) {
  tabGroups = tabGroups || store.getState().editor.editors;
  for (let key in tabGroups) {
    if (tabGroups[key] && tabGroups[key].documents) {
      if (tabGroups[key].documents.some(document => document.documentId == documentId))
        return key;
    }
  }
  return undefined;
}

export function showWelcomePage() {
  const key = getTabGroupForDocument('welcome-page');
  if (key) {
    store.dispatch(EditorActions.setActiveTab('welcome-page'));
  } else {
    store.dispatch(EditorActions.open(Constants.ContentType_WelcomePage, 'welcome-page', true));
  }
}
