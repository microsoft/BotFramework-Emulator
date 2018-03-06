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

import * as EditorActions from '../action/editorActions';
import * as Constants from '../../constants';
import { deepCopySlow } from '@bfemulator/app-shared';

const DEFAULT_STATE = {
  activeEditor: Constants.EditorKey_Primary,
  draggingTab: false,
  editors: {
    [Constants.EditorKey_Primary]: {
      activeDocumentId: null,
      documents: [],
      tabStack: [],
    },
    [Constants.EditorKey_Secondary]: null
  }
}

export default function documents(state = DEFAULT_STATE, action) {
  Object.freeze(state);

  const editorKey = action.payload ? action.payload.editorKey : null;
  const srcEditorKey = action.payload ? action.payload.srcEditorKey : null;
  const destEditorKey = action.payload ? action.payload.destEditorKey : null;

  switch (action.type) {
    case EditorActions.APPEND_TAB: {
      // if the tab is being appended to the end of its own editor, use one document array
      if (srcEditorKey === destEditorKey) {
        let docs = [...state.editors[srcEditorKey].documents];

        const docToAppend = docs.find(doc => doc.documentId === action.payload.documentId);
        docs = [...docs.filter(doc => doc.documentId !== action.payload.documentId), docToAppend];

        let editorState = {
          ...state.editors[srcEditorKey],
          documents: docs
        };
        state = setEditorState(srcEditorKey, editorState, state);
        break;
      }

      // if the tab is being appended to another editor, we need to track both editors' documents and tabstacks
      let srcDocs = [...state.editors[srcEditorKey].documents];
      let srcTabStack = [...state.editors[srcEditorKey].tabStack];

      const docToAppend = srcDocs.find(doc => doc.documentId === action.payload.documentId);
      srcDocs = srcDocs.filter(doc => doc.documentId !== action.payload.documentId);
      srcTabStack = srcTabStack.filter(tabId => tabId !== action.payload.documentId);
      let srcEditor = srcDocs.length === 0 ? null : {
        ...state.editors[srcEditorKey],
        documents: srcDocs,
        tabStack: srcTabStack
      };

      let destDocs = [...state.editors[destEditorKey].documents, docToAppend];
      let destTabStack = [...state.editors[destEditorKey].tabStack, docToAppend.documentId];
      let destEditor = {
        ...state.editors[destEditorKey],
        documents: destDocs,
        tabStack: destTabStack
      };

      if (!srcEditor && srcEditorKey === Constants.EditorKey_Primary) {
        state = setNewPrimaryEditor(destEditor, state);
      } else {
        state = setActiveEditor(!srcEditor ? destEditorKey : state.activeEditor, state);
        state = setEditorState(srcEditorKey, srcEditor, state);
        state = setEditorState(destEditorKey, destEditor, state);
      }
      state = setDraggingTab(false, state);
      break;
    }

    case EditorActions.CLOSE: {
      // TODO: Add logic to check if document has been saved
      // & prompt user to save document if necessary

      let newTabStack = state.editors[editorKey].tabStack.filter(tabId => tabId !== action.payload.documentId);
      let newDocumentList = state.editors[editorKey].documents.filter(doc => doc.documentId !== action.payload.documentId);
      let newActiveDocumentId = newTabStack[0] || null;

      // close empty editor if there is another one able to take its place
      const newPrimaryEditorKey = editorKey === Constants.EditorKey_Primary ? Constants.EditorKey_Secondary : Constants.EditorKey_Primary;
      if (!newDocumentList.length && state.editors[newPrimaryEditorKey]) {
        // if the editor being closed is the primary editor, have the secondary editor become the primary
        const tmp = state.editors[newPrimaryEditorKey];
        state = setNewPrimaryEditor(tmp, state);
      } else {
        let editorState = {
          ...state.editors[editorKey],
          documents: newDocumentList,
          activeDocumentId: newActiveDocumentId,
          tabStack: newTabStack
        };
        state = setEditorState(editorKey, editorState, state);
      }
      break;
    }

    case EditorActions.CLOSE_ALL: {
      if (action.payload.includeGlobal) {
        return DEFAULT_STATE;
      } else {
        let newState = {
          ...state
        };
        for (let key in state.editors) {
          let tabGroup = state.editors[key];
          if (tabGroup) {
            let newTabStack = [...tabGroup.tabStack];
            let newDocumentList = [];
            let newActiveDocumentId = null;
            tabGroup.documents.forEach(document => {
              if (document.isGlobal) {
                newDocumentList.push(document);
              } else {
                newTabStack = newTabStack.filter(documentId => documentId != document.documentId);
              }
            });
            let newTabGroup = {
              tabStack: newTabStack,
              documents: newDocumentList,
              activeDocumentId: newTabStack[0] || null
            }
            newState = {
              ...newState,
              editors: {
                ...newState.editors,
                [key]: newTabGroup
              }
            }
          }
        }
        state = fixupActiveEditor(newState);
      }
      break;
    }

    case EditorActions.OPEN: {
      let editorKey = state.activeEditor;
      let newTabStack = state.editors[editorKey].tabStack.filter(tabId => tabId !== action.payload.documentId);
      newTabStack.unshift(action.payload.documentId);

      // add the document to the docs list if it doesn't exist
      let editorDocs = documentExists(action.payload.documentId, state.editors[editorKey].documents) ?
        [...state.editors[editorKey].documents]
        :
        [
          ...state.editors[editorKey].documents,
          {
            documentId: action.payload.documentId,
            contentType: action.payload.contentType,
            meta: action.payload.meta || null,
            dirty: false,
            isGlobal: action.payload.isGlobal || false
          }
        ];

      let editorState = {
        ...state.editors[editorKey],
        activeDocumentId: action.payload.documentId,
        documents: editorDocs,
        tabStack: newTabStack
      };
      state = setEditorState(editorKey, editorState, state);
      state = setActiveEditor(editorKey, state);
      break;
    }

    case EditorActions.SET_ACTIVE_EDITOR: {
      state = setActiveEditor(action.payload, state);
      break;
    }

    case EditorActions.SET_ACTIVE_TAB: {
      Constants.EditorKeys.forEach(editorKey => {
        if (state.editors[editorKey]) {
          let newTabStack = state.editors[editorKey].tabStack.filter(tabId => tabId !== action.payload.documentId);
          newTabStack.unshift(action.payload.documentId);

          let editorState = {
            ...state.editors[editorKey],
            activeDocumentId: action.payload.documentId,
            tabStack: newTabStack
          };
          state = setEditorState(editorKey, editorState, state);
          state = setActiveEditor(editorKey, state);
        }
      });
      break;
    }

    case EditorActions.SET_DIRTY_FLAG: {
      Constants.EditorKeys.forEach(editorKey => {
        if (state.editors[editorKey]) {
          let docs = [...state.editors[editorKey].documents];
          let docIndex = docs.findIndex(doc => doc.documentId === action.payload.documentId);
          let newDoc = {
            ...docs[docIndex],
            dirty: action.payload.dirty
          }
          docs[docIndex] = newDoc;

          let editorState = {
            ...state.editors[editorKey],
            documents: docs
          };
          state = setEditorState(editorKey, editorState, state);
        }
      });
      break;
    }

    case EditorActions.SPLIT_TAB: {
      // remove tab from source editor
      let srcEditor = state.editors[srcEditorKey];
      let srcDoc = srcEditor.documents.find(doc => doc.documentId === action.payload.documentId);
      srcEditor.documents = srcEditor.documents.filter(doc => doc.documentId !== action.payload.documentId);
      srcEditor.tabStack = srcEditor.tabStack.filter(tabId => tabId !== action.payload.documentId);
      srcEditor.activeDocumentId = srcEditor.tabStack[0] || null;
      if (srcEditor.documents.length === 0) {
        srcEditor = null;
      }

      // check for destination editor or create it if non-existent
      let destEditor = state.editors[destEditorKey] || getNewEditor();
      destEditor.activeDocumentId = action.payload.documentId;
      destEditor.documents.push(srcDoc);
      destEditor.tabStack.unshift(action.payload.documentId);

      state = setActiveEditor(destEditorKey, state);
      state = setEditorState(srcEditorKey, srcEditor, state);
      state = setEditorState(destEditorKey, destEditor, state);
      state = setDraggingTab(false, state);
      break;
    }

    case EditorActions.SWAP_TABS: {
      // swap tabs within the same editor
      if (srcEditorKey == destEditorKey) {
        let docs = [...state.editors[srcEditorKey].documents];

        const srcTabIndex = docs.findIndex(doc => doc.documentId === action.payload.srcTabId);
        const destTabIndex = docs.findIndex(doc => doc.documentId === action.payload.destTabId);
        let destTab = docs[destTabIndex];

        docs[destTabIndex] = docs[srcTabIndex];
        docs[srcTabIndex] = destTab;

        let editorState = {
          ...state.editors[srcEditorKey],
          documents: docs
        };

        state = setEditorState(srcEditorKey, editorState, state);
        break;
      }

      // swap tab into different editor
      let srcDocs = [...state.editors[srcEditorKey].documents];
      let srcTabStack = [...state.editors[srcEditorKey].tabStack];
      let destDocs = [...state.editors[destEditorKey].documents];
      let destTabStack = [...state.editors[destEditorKey].tabStack];

      const srcTabIndex = srcDocs.findIndex(doc => doc.documentId === action.payload.srcTabId);
      const destTabIndex = destDocs.findIndex(doc => doc.documentId === action.payload.destTabId);

      // remove tab from source editor, and insert into destination editor before the destination tab
      destDocs = [...destDocs.splice(0, destTabIndex), srcDocs[srcTabIndex], ...destDocs];
      destTabStack = [...destTabStack, action.payload.srcTabId];
      srcDocs = srcDocs.filter(doc => doc.documentId !== action.payload.srcTabId);
      srcTabStack = srcTabStack.filter(tabId => tabId !== action.payload.srcTabId);

      let srcEditor = srcDocs.length === 0 ? null : {
        ...state.editors[srcEditorKey],
        documents: srcDocs,
        tabStack: srcTabStack
      };
      let destEditor = {
        ...state.editors[destEditorKey],
        documents: destDocs,
        tabStack: destTabStack
      };

      if (!srcEditor && srcEditorKey === Constants.EditorKey_Primary) {
        state = setNewPrimaryEditor(destEditor, state);
      } else {
        state = setActiveEditor(!srcEditor ? destEditorKey : state.activeEditor, state);
        state = setEditorState(srcEditorKey, srcEditor, state);
        state = setEditorState(destEditorKey, destEditor, state);
      }
      break;
    }

    case EditorActions.TOGGLE_DRAGGING_TAB: {
      state = setDraggingTab(action.payload, state);
      break;
    }

    default: break;
  }

  return state;
}

function documentExists(id, documents = []) {
  return documents.some(doc => doc.documentId === id);
}

function getNewEditor() {
  return {
    activeDocumentId: null,
    draggingTab: false,
    documents: [],
    tabStack: []
  };
}

function setEditorState(editorKey, editorState, state) {
  let newState = deepCopySlow(state);

  newState.editors[editorKey] = editorState;
  return newState;
}

function setActiveEditor(editorKey, state) {
  let newState = deepCopySlow(state);

  newState.activeEditor = editorKey;
  return newState;
}

/** Sets a new primary editor, and destroys the secondary editor */
function setNewPrimaryEditor(newPrimaryEditor, state) {
  let newState = deepCopySlow(state);

  newState.editors[Constants.EditorKey_Secondary] = null;
  newState.editors[Constants.EditorKey_Primary] = newPrimaryEditor;
  newState.activeEditor = Constants.EditorKey_Primary;
  return newState;
}

function setDraggingTab(dragging, state) {
  let newState = deepCopySlow(state);

  newState.draggingTab = dragging;
  return newState;
}

function fixupActiveEditor(state) {
  if (state.activeEditor === Constants.EditorKey_Primary
    && !state.editors[Constants.EditorKey_Primary].tabStack.length
    && state.editors[Constants.EditorKey_Secondary])
    state = setNewPrimaryEditor(state.editors[Constants.EditorKey_Secondary], state);
  return state;
}
