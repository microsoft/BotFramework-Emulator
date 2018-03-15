import store from './store';
import * as EditorActions from './action/editorActions';
import * as Constants from '../constants';
import { IEditor } from '../data/reducer/editor';

export function hasNonGlobalTabs(tabGroups?: { [editorKey: string]: IEditor }): number {
  tabGroups = tabGroups || store.getState().editor.editors;
  let count = 0;
  for (let key in tabGroups) {
    if (tabGroups[key]) {
      count += Object.keys(tabGroups[key].documents)
        .map(documentId => tabGroups[key].documents[documentId])
        .filter(document => !document.isGlobal).length;
    }
  }
  return count;
}

// @returns: name of editor group, or undefined if doc is not open.
export function getTabGroupForDocument(documentId: string, tabGroups?: { [editorKey: string]: IEditor }): string {
  tabGroups = tabGroups || store.getState().editor.editors;
  for (let key in tabGroups) {
    if (tabGroups[key] && tabGroups[key].documents) {
      if (tabGroups[key].documents[documentId])
        return key;
    }
  }
  return undefined;
}

/** Takes a tab group key and returns the key of the other tab group */
export function getOtherTabGroup(tabGroup: string): string {
  return tabGroup === Constants.EditorKey_Primary ? Constants.EditorKey_Secondary : Constants.EditorKey_Primary;
}

export function showWelcomePage(): void {
  store.dispatch(EditorActions.open(Constants.ContentType_WelcomePage, Constants.DocumentId_WelcomePage, true));
}

export function showAppSettingsPage(): void {
  store.dispatch(EditorActions.open(Constants.ContentType_AppSettings, Constants.DocumentId_AppSettings, true));
}

export function tabGroupHasDocuments(tabGroup: IEditor): boolean {
  return Object.keys(tabGroup.documents).length ? true : false;
}
