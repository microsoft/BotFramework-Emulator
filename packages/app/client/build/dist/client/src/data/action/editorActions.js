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
export var EditorActions;
(function (EditorActions) {
    EditorActions["appendTab"] = "EDITOR/APPEND_TAB";
    EditorActions["addDocPendingChange"] = "EDITOR/ADD_DOC_PENDING_CHANGE";
    EditorActions["removeDocPendingChange"] = "EDITOR/REMOVE_DOC_PENDING_CHANGE";
    EditorActions["close"] = "EDITOR/CLOSE";
    EditorActions["closeAll"] = "EDITOR/CLOSE_ALL";
    EditorActions["setDirtyFlag"] = "EDITOR/SET_DIRTY_FLAG";
    EditorActions["open"] = "EDITOR/OPEN";
    EditorActions["setActiveTab"] = "EDITOR/SET_ACTIVE_TAB";
    EditorActions["setActiveEditor"] = "EDITOR/SET_ACTIVE_EDITOR";
    EditorActions["splitTab"] = "EDITOR/SPLIT_TAB";
    EditorActions["swapTabs"] = "EDITOR/SWAP_TABS";
    EditorActions["toggleDraggingTab"] = "EDITOR/TOGGLE_DRAGGING_TAB";
    EditorActions["updateDocument"] = "EDITOR/UPDATE_DOCUMENT";
})(EditorActions || (EditorActions = {}));
export function appendTab(srcEditorKey, destEditorKey, documentId) {
    return {
        type: EditorActions.appendTab,
        payload: {
            srcEditorKey,
            destEditorKey,
            documentId
        }
    };
}
export function addDocPendingChange(documentId) {
    return {
        type: EditorActions.addDocPendingChange,
        payload: {
            documentId
        }
    };
}
export function removeDocPendingChange(documentId) {
    return {
        type: EditorActions.removeDocPendingChange,
        payload: {
            documentId
        }
    };
}
export function close(editorKey, documentId) {
    return {
        type: EditorActions.close,
        payload: {
            editorKey,
            documentId
        }
    };
}
export function closeNonGlobalTabs() {
    return {
        type: EditorActions.closeAll,
        payload: {
            includeGlobal: false
        }
    };
}
export function setDirtyFlag(documentId, dirty) {
    return {
        type: EditorActions.setDirtyFlag,
        payload: {
            documentId,
            dirty
        }
    };
}
export function open(contentType, documentId, isGlobal, meta) {
    return {
        type: EditorActions.open,
        payload: {
            contentType,
            documentId,
            isGlobal,
            meta
        }
    };
}
export function updateDocument(documentId, updatedDocument) {
    return {
        type: EditorActions.updateDocument,
        payload: Object.assign({ documentId }, updatedDocument)
    };
}
export function setActiveTab(documentId) {
    return {
        type: EditorActions.setActiveTab,
        payload: {
            documentId
        }
    };
}
export function setActiveEditor(editorKey) {
    return {
        type: EditorActions.setActiveEditor,
        payload: {
            editorKey
        }
    };
}
export function splitTab(contentType, documentId, srcEditorKey, destEditorKey) {
    return {
        type: EditorActions.splitTab,
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
        type: EditorActions.swapTabs,
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
        type: EditorActions.toggleDraggingTab,
        payload: {
            draggingTab
        }
    };
}
//# sourceMappingURL=editorActions.js.map