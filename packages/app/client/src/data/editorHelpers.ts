//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

import store from './store';
import * as EditorActions from './action/editorActions';
import * as Constants from '../constants';
import { Editor } from '../data/reducer/editor';

export function hasNonGlobalTabs(tabGroups?: { [editorKey: string]: Editor }): number {
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

/**
 * Returns name of editor group, or undefined if doc is not open
 */
export function getTabGroupForDocument(documentId: string, tabGroups?: { [editorKey: string]: Editor }): string {
  tabGroups = tabGroups || store.getState().editor.editors;
  for (let key in tabGroups) {
    if (tabGroups[key] && tabGroups[key].documents) {
      if (tabGroups[key].documents[documentId]) {
        return key;
      }
    }
  }
  return undefined;
}
/**
 * Checks all tab groups to see if the specified document is active in one of them
 * @param documentId The document to check for
 */
export function isActiveDocument(documentId: string): boolean {
  const tabGroup = getTabGroupForDocument(documentId);
  if (!tabGroup) {
    return false;
  }

  return store.getState().editor.editors[tabGroup].activeDocumentId === documentId;
}

/** Takes a tab group key and returns the key of the other tab group */
export function getOtherTabGroup(tabGroup: string): string {
  return tabGroup === Constants.EDITOR_KEY_PRIMARY ? Constants.EDITOR_KEY_SECONDARY : Constants.EDITOR_KEY_PRIMARY;
}

export function showWelcomePage(): void {
  store.dispatch(EditorActions.open(Constants.CONTENT_TYPE_WELCOME_PAGE, Constants.DOCUMENT_ID_WELCOME_PAGE, true));
}

export function showAppSettingsPage(): void {
  store.dispatch(EditorActions.open(Constants.CONTENT_TYPE_APP_SETTINGS, Constants.DOCUMENT_ID_APP_SETTINGS, true));
}

export function tabGroupHasDocuments(tabGroup: Editor): boolean {
  return Object.keys(tabGroup.documents).length ? true : false;
}
