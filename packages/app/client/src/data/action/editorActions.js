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

export const APPEND_TAB = 'EDITOR/APPEND_TAB';
export const CLOSE = 'EDITOR/CLOSE';
export const CLOSE_ALL = 'EDITOR/CLOSE_ALL';
export const OPEN = 'EDITOR/OPEN';
export const SET_ACTIVE_TAB = 'EDITOR/SET_ACTIVE_TAB';
export const SET_ACTIVE_EDITOR = 'EDITOR/SET_ACTIVE_EDITOR';
export const SPLIT_TAB = 'EDITOR/SPLIT_TAB';
export const SWAP_TABS = 'EDITOR/SWAP_TABS';
export const TOGGLE_DRAGGING_TAB = 'EDITOR/TOGGLE_DRAGGING_TAB';

export function appendTab(srcEditorKey, destEditorKey, documentId) {
    return {
        type: APPEND_TAB,
        payload: {
            srcEditorKey,
            destEditorKey,
            documentId
        }
    };
}

export function close(editorKey, documentId) {
    return {
        type: CLOSE,
        payload: {
            editorKey,
            documentId
        }
    };
}

export function closeAllTabs() {
  return {
      type: CLOSE_ALL,
      payload: {
      }
  };
}

export function open(contentType, documentId, meta) {
    return {
        type: OPEN,
        payload: {
            contentType,
            documentId,
            meta
        }
    };
}

export function setActiveTab(documentId) {
    return {
        type: SET_ACTIVE_TAB,
        payload: {
            documentId
        }
    };
}

export function setActiveEditor(editorKey) {
    return {
        type: SET_ACTIVE_EDITOR,
        payload: editorKey
    }
}

export function splitTab(contentType, documentId, srcEditorKey, destEditorKey) {
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

export function swapTabs(srcEditorKey, destEditorKey, srcTabId, destTabId) {
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

export function toggleDraggingTab(draggingTab) {
    return {
        type: TOGGLE_DRAGGING_TAB,
        payload: draggingTab
    };
}
