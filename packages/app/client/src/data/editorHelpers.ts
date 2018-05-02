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
