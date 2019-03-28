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

import * as Constants from '../constants';

import * as EditorActions from './action/editorActions';
import { Editor } from './reducer/editor';
import { store } from './store';

export function hasNonGlobalTabs(tabGroups?: { [editorKey: string]: Editor }): number {
  tabGroups = tabGroups || store.getState().editor.editors;
  let count = 0;
  for (const key in tabGroups) {
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
  for (const key in tabGroups) {
    if (tabGroups[key] && tabGroups[key].documents) {
      if (tabGroups[key].documents[documentId]) {
        return key;
      }
    }
  }
  return undefined;
}

/** Takes a tab group key and returns the key of the other tab group */
export function getOtherTabGroup(tabGroup: string): string {
  return tabGroup === Constants.EDITOR_KEY_PRIMARY ? Constants.EDITOR_KEY_SECONDARY : Constants.EDITOR_KEY_PRIMARY;
}

export function showWelcomePage(): void {
  store.dispatch(
    EditorActions.open({
      contentType: Constants.CONTENT_TYPE_WELCOME_PAGE,
      documentId: Constants.DOCUMENT_ID_WELCOME_PAGE,
      isGlobal: true,
    })
  );
}

export function showWaitingForConnectionPage(): void {
  store.dispatch(
    EditorActions.open({
      contentType: Constants.WAITING_FOR_CONNECTION,
      documentId: Constants.WAITING_FOR_CONNECTION,
      isGlobal: false,
      meta: {
        serviceUrl: store.getState().clientAwareSettings.serverUrl,
      },
    })
  );
}

export function tabGroupHasDocuments(tabGroup: Editor): boolean {
  return !!Object.keys(tabGroup.documents).length;
}
