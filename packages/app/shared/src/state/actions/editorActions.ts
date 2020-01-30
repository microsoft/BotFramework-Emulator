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

import { Document } from '../reducers/editor';

export enum EditorActions {
  appendTab = 'EDITOR/APPEND_TAB',
  addDocPendingChange = 'EDITOR/ADD_DOC_PENDING_CHANGE',
  removeDocPendingChange = 'EDITOR/REMOVE_DOC_PENDING_CHANGE',
  close = 'EDITOR/CLOSE',
  closeAll = 'EDITOR/CLOSE_ALL',
  dropTabOnLeftOverlay = 'EDITOR/DROP_TAB_ON_LEFT_OVERLAY',
  setDirtyFlag = 'EDITOR/SET_DIRTY_FLAG',
  open = 'EDITOR/OPEN',
  setActiveTab = 'EDITOR/SET_ACTIVE_TAB',
  setActiveEditor = 'EDITOR/SET_ACTIVE_EDITOR',
  splitTab = 'EDITOR/SPLIT_TAB',
  swapTabs = 'EDITOR/SWAP_TABS',
  toggleDraggingTab = 'EDITOR/TOGGLE_DRAGGING_TAB',
  updateDocument = 'EDITOR/UPDATE_DOCUMENT',
}

export interface AppendTabAction {
  type: EditorActions.appendTab;
  payload: {
    srcEditorKey: string;
    destEditorKey: string;
    documentId: string;
  };
}

export interface CloseEditorAction {
  type: EditorActions.close;
  payload: {
    editorKey: string;
    documentId: string;
  };
}

export interface CloseAllEditorAction {
  type: EditorActions.closeAll;
  payload: {
    includeGlobal: boolean;
  };
}

export interface SetDirtyFlagAction {
  type: EditorActions.setDirtyFlag;
  payload: {
    documentId: string;
    dirty: boolean;
  };
}

export interface OpenEditorAction {
  type: EditorActions.open;
  payload: Partial<Document>;
}

export interface UpdateDocumentAction {
  type: EditorActions.updateDocument;
  payload: Partial<Document>;
}

export interface SetActiveTabAction {
  type: EditorActions.setActiveTab;
  payload: {
    documentId: string;
  };
}

export interface SetActiveEditorAction {
  type: EditorActions.setActiveEditor;
  payload: {
    editorKey: string;
  };
}

export interface SplitTabAction {
  type: EditorActions.splitTab;
  payload: {
    contentType: string;
    documentId: string;
    srcEditorKey: string;
    destEditorKey: string;
  };
}

export interface SwapTabsAction {
  type: EditorActions.swapTabs;
  payload: {
    srcEditorKey: string;
    destEditorKey: string;
    srcTabId: string;
    destTabId: string;
  };
}

export interface ToggleDraggingTabAction {
  type: EditorActions.toggleDraggingTab;
  payload: {
    draggingTab: boolean;
  };
}

export interface AddDocPendingChangeAction {
  type: EditorActions.addDocPendingChange;
  payload: {
    documentId: string;
  };
}

export interface RemoveDocPendingChangeAction {
  type: EditorActions.removeDocPendingChange;
  payload: {
    documentId: string;
  };
}

export interface DropTabOnLeftOverlayAction {
  type: EditorActions.dropTabOnLeftOverlay;
  payload: {
    tabId: string;
  };
}

export type EditorAction =
  | AppendTabAction
  | CloseEditorAction
  | CloseAllEditorAction
  | SetDirtyFlagAction
  | OpenEditorAction
  | UpdateDocumentAction
  | SetActiveTabAction
  | SetActiveEditorAction
  | SplitTabAction
  | SwapTabsAction
  | ToggleDraggingTabAction
  | AddDocPendingChangeAction
  | RemoveDocPendingChangeAction
  | DropTabOnLeftOverlayAction;

export function appendTab(srcEditorKey: string, destEditorKey: string, documentId: string): AppendTabAction {
  return {
    type: EditorActions.appendTab,
    payload: {
      srcEditorKey,
      destEditorKey,
      documentId,
    },
  };
}

export function addDocPendingChange(documentId: string): AddDocPendingChangeAction {
  return {
    type: EditorActions.addDocPendingChange,
    payload: {
      documentId,
    },
  };
}

export function removeDocPendingChange(documentId: string): RemoveDocPendingChangeAction {
  return {
    type: EditorActions.removeDocPendingChange,
    payload: {
      documentId,
    },
  };
}

export function close(editorKey: string, documentId: string): CloseEditorAction {
  return {
    type: EditorActions.close,
    payload: {
      editorKey,
      documentId,
    },
  };
}

export function closeNonGlobalTabs(): CloseAllEditorAction {
  return {
    type: EditorActions.closeAll,
    payload: {
      includeGlobal: false,
    },
  };
}

export function setDirtyFlag(documentId: string, dirty: boolean): SetDirtyFlagAction {
  return {
    type: EditorActions.setDirtyFlag,
    payload: {
      documentId,
      dirty,
    },
  };
}

export function open(document: Partial<Document>): OpenEditorAction {
  return {
    type: EditorActions.open,
    payload: document,
  };
}

export function updateDocument(documentId: string, updatedDocument: Partial<Document>): UpdateDocumentAction {
  return {
    type: EditorActions.updateDocument,
    payload: { documentId, ...updatedDocument },
  };
}

export function setActiveTab(documentId: string): SetActiveTabAction {
  return {
    type: EditorActions.setActiveTab,
    payload: {
      documentId,
    },
  };
}

export function setActiveEditor(editorKey: string): SetActiveEditorAction {
  return {
    type: EditorActions.setActiveEditor,
    payload: {
      editorKey,
    },
  };
}

export function splitTab(
  contentType: string,
  documentId: string,
  srcEditorKey: string,
  destEditorKey: string
): SplitTabAction {
  return {
    type: EditorActions.splitTab,
    payload: {
      contentType,
      documentId,
      srcEditorKey,
      destEditorKey,
    },
  };
}

export function swapTabs(
  srcEditorKey: string,
  destEditorKey: string,
  srcTabId: string,
  destTabId: string
): SwapTabsAction {
  return {
    type: EditorActions.swapTabs,
    payload: {
      srcEditorKey,
      destEditorKey,
      srcTabId,
      destTabId,
    },
  };
}

export function toggleDraggingTab(draggingTab: boolean): ToggleDraggingTabAction {
  return {
    type: EditorActions.toggleDraggingTab,
    payload: {
      draggingTab,
    },
  };
}

export function dropTabOnLeftOverlay(tabId: string): DropTabOnLeftOverlayAction {
  return {
    type: EditorActions.dropTabOnLeftOverlay,
    payload: {
      tabId,
    },
  };
}
