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

import { Document } from '../reducer/editor';

export const APPEND_TAB = 'EDITOR/APPEND_TAB';
export const CLOSE = 'EDITOR/CLOSE';
export const CLOSE_ALL = 'EDITOR/CLOSE_ALL';
export const SET_DIRTY_FLAG = 'EDITOR/SET_DIRTY_FLAG';
export const OPEN = 'EDITOR/OPEN';
export const SET_ACTIVE_TAB = 'EDITOR/SET_ACTIVE_TAB';
export const SET_ACTIVE_EDITOR = 'EDITOR/SET_ACTIVE_EDITOR';
export const SPLIT_TAB = 'EDITOR/SPLIT_TAB';
export const SWAP_TABS = 'EDITOR/SWAP_TABS';
export const TOGGLE_DRAGGING_TAB = 'EDITOR/TOGGLE_DRAGGING_TAB';
export const UPDATE_DOCUMENT = 'EDITOR/UPDATE_DOCUMENT';

export type EditorAction = {
  type: 'EDITOR/APPEND_TAB',
  payload: {
    srcEditorKey: string,
    destEditorKey: string,
    documentId: string
  }
} | {
  type: 'EDITOR/CLOSE',
  payload: {
    editorKey: string,
    documentId: string
  }
} | {
  type: 'EDITOR/CLOSE_ALL',
  payload: {
    includeGlobal: boolean
  }
} | {
  type: 'EDITOR/SET_DIRTY_FLAG',
  payload: {
    documentId: string,
    dirty: boolean
  }
} | {
  type: 'EDITOR/OPEN',
  payload: Document
} | {
  type: 'EDITOR/UPDATE_DOCUMENT',
  payload: Document
} | {
  type: 'EDITOR/SET_ACTIVE_TAB',
  payload: {
    documentId: string
  }
} | {
  type: 'EDITOR/SET_ACTIVE_EDITOR',
  payload: {
    editorKey: string
  }
} | {
  type: 'EDITOR/SPLIT_TAB',
  payload: {
    contentType: string,
    documentId: string,
    srcEditorKey: string,
    destEditorKey: string
  }
} | {
  type: 'EDITOR/SWAP_TABS',
  payload: {
    srcEditorKey: string,
    destEditorKey: string,
    srcTabId: string,
    destTabId: string
  }
} | {
  type: 'EDITOR/TOGGLE_DRAGGING_TAB',
  payload: {
    draggingTab: boolean
  }
};

export function appendTab(srcEditorKey: string, destEditorKey: string, documentId: string): EditorAction {
  return {
    type: APPEND_TAB,
    payload: {
      srcEditorKey,
      destEditorKey,
      documentId
    }
  };
}

export function close(editorKey: string, documentId: string): EditorAction {
  return {
    type: CLOSE,
    payload: {
      editorKey,
      documentId
    }
  };
}

export function closeNonGlobalTabs(): EditorAction {
  return {
    type: CLOSE_ALL,
    payload: {
      includeGlobal: false
    }
  };
}

export function setDirtyFlag(documentId: string, dirty: boolean): EditorAction {
  return {
    type: SET_DIRTY_FLAG,
    payload: {
      documentId,
      dirty
    }
  };
}

export function open(contentType: string, documentId: string, isGlobal: boolean, meta?: any): EditorAction {
  return {
    type: OPEN,
    payload: {
      contentType,
      documentId,
      isGlobal,
      meta
    }
  };
}

export function updateDocument(documentId: string, updatedDocument: Partial<Document>) {
  return {
    type: UPDATE_DOCUMENT,
      payload: { documentId, ...updatedDocument }
  };
}

export function setActiveTab(documentId: string): EditorAction {
  return {
    type: SET_ACTIVE_TAB,
    payload: {
      documentId
    }
  };
}

export function setActiveEditor(editorKey: string): EditorAction {
  return {
    type: SET_ACTIVE_EDITOR,
    payload: {
      editorKey
    }
  };
}

export function splitTab(contentType: string, documentId: string, srcEditorKey: string, destEditorKey: string)
  : EditorAction {
  return {
    type: SPLIT_TAB,
    payload: {
      contentType,
      documentId,
      srcEditorKey,
      destEditorKey
    }
  };
}

export function swapTabs(srcEditorKey: string, destEditorKey: string, srcTabId: string, destTabId: string)
  : EditorAction {
  return {
    type: SWAP_TABS,
    payload: {
      srcEditorKey,
      destEditorKey,
      srcTabId,
      destTabId
    }
  };
}

export function toggleDraggingTab(draggingTab: boolean): EditorAction {
  return {
    type: TOGGLE_DRAGGING_TAB,
    payload: {
      draggingTab
    }
  };
}
