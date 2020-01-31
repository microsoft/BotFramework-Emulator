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

import { Editor, SharedConstants } from '@bfemulator/app-shared';
import * as EditorActions from '@bfemulator/app-shared/built/state/actions/editorActions';

import { store } from '../store';

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

export function showWelcomePage(): void {
  store.dispatch(
    EditorActions.open({
      contentType: SharedConstants.ContentTypes.CONTENT_TYPE_WELCOME_PAGE,
      documentId: SharedConstants.DocumentIds.DOCUMENT_ID_WELCOME_PAGE,
      isGlobal: true,
    })
  );
}

export function showMarkdownPage(markdown: string, label: string, onLine: boolean): void {
  store.dispatch(
    EditorActions.open({
      contentType: SharedConstants.ContentTypes.CONTENT_TYPE_MARKDOWN,
      documentId: SharedConstants.DocumentIds.DOCUMENT_ID_MARKDOWN_PAGE,
      isGlobal: true,
      meta: { markdown, label, onLine },
    })
  );
}
