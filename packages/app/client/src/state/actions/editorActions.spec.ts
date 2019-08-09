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

import {
  EditorActions,
  appendTab,
  addDocPendingChange,
  removeDocPendingChange,
  close,
  closeNonGlobalTabs,
  setDirtyFlag,
  open,
  updateDocument,
  setActiveTab,
  setActiveEditor,
  splitTab,
  swapTabs,
  toggleDraggingTab,
  dropTabOnLeftOverlay,
} from './editorActions';

describe('editor actions', () => {
  it('should create an appendTab action', () => {
    const srcEditorKey = 'primary';
    const destEditorKey = 'secondary';
    const documentId = 'someDocId';
    const action = appendTab(srcEditorKey, destEditorKey, documentId);

    expect(action.type).toBe(EditorActions.appendTab);
    expect(action.payload).toEqual({ srcEditorKey, destEditorKey, documentId });
  });

  it('should create an addDocPendingChange action', () => {
    const documentId = 'someDocId';
    const action = addDocPendingChange(documentId);

    expect(action.type).toBe(EditorActions.addDocPendingChange);
    expect(action.payload).toEqual({ documentId });
  });

  it('should create a removeDocPendingChange action', () => {
    const documentId = 'someDocId';
    const action = removeDocPendingChange(documentId);

    expect(action.type).toBe(EditorActions.removeDocPendingChange);
    expect(action.payload).toEqual({ documentId });
  });

  it('should create a close action', () => {
    const editorKey = 'primary';
    const documentId = 'someDocId';
    const action = close(editorKey, documentId);

    expect(action.type).toBe(EditorActions.close);
    expect(action.payload).toEqual({ documentId, editorKey });
  });

  it('should create a closeNonGlobalTabs action', () => {
    const action = closeNonGlobalTabs();

    expect(action.type).toBe(EditorActions.closeAll);
    expect(action.payload).toEqual({ includeGlobal: false });
  });

  it('should create a setDirtyFlag action', () => {
    const documentId = 'someDocId';
    const dirty = true;
    const action = setDirtyFlag(documentId, dirty);

    expect(action.type).toBe(EditorActions.setDirtyFlag);
    expect(action.payload).toEqual({ documentId, dirty });
  });

  it('should create an open action', () => {
    const document: any = {};
    const action = open(document);

    expect(action.type).toBe(EditorActions.open);
    expect(action.payload).toEqual(document);
  });

  it('should create an updateDocument action', () => {
    const documentId = 'someDocId';
    const updatedDocument: any = { dirty: true, contentType: 'welcome-page' };
    const action = updateDocument(documentId, updatedDocument);

    expect(action.type).toBe(EditorActions.updateDocument);
    expect(action.payload).toEqual({ documentId, dirty: true, contentType: 'welcome-page' });
  });

  it('should create a setActiveTab action', () => {
    const documentId = 'someDocId';
    const action = setActiveTab(documentId);

    expect(action.type).toBe(EditorActions.setActiveTab);
    expect(action.payload).toEqual({ documentId });
  });

  it('should create a setActiveEditor action', () => {
    const editorKey = 'primary';
    const action = setActiveEditor(editorKey);

    expect(action.type).toBe(EditorActions.setActiveEditor);
    expect(action.payload).toEqual({ editorKey });
  });

  it('should create a splitTab action', () => {
    const contentType = 'welcome-page';
    const documentId = 'someDocId';
    const srcEditorKey = 'primary';
    const destEditorKey = 'secondary';
    const action = splitTab(contentType, documentId, srcEditorKey, destEditorKey);

    expect(action.type).toBe(EditorActions.splitTab);
    expect(action.payload).toEqual({ contentType, documentId, srcEditorKey, destEditorKey });
  });

  it('should create a swapTabs action', () => {
    const srcEditorKey = 'primary';
    const destEditorKey = 'secondary';
    const srcTabId = 'tab1';
    const destTabId = 'tab2';
    const action = swapTabs(srcEditorKey, destEditorKey, srcTabId, destTabId);

    expect(action.type).toBe(EditorActions.swapTabs);
    expect(action.payload).toEqual({ srcEditorKey, destEditorKey, srcTabId, destTabId });
  });

  it('should create a toggleDraggingTab action', () => {
    const draggingTab = true;
    const action = toggleDraggingTab(draggingTab);

    expect(action.type).toBe(EditorActions.toggleDraggingTab);
    expect(action.payload).toEqual({ draggingTab });
  });

  it('should create a dropTabOnLeftOverlay action', () => {
    const tabId = 'someTabId';
    const action = dropTabOnLeftOverlay(tabId);

    expect(action.type).toBe(EditorActions.dropTabOnLeftOverlay);
    expect(action.payload).toEqual({ tabId });
  });
});
