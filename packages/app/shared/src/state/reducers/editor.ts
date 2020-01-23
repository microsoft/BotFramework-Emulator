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

import { DirectLine } from 'botframework-directlinejs';
import { Activity } from 'botframework-schema';
import { EmulatorMode } from '@bfemulator/sdk-shared';

import { BotAction } from '../actions/botActions';
import { EditorAction, EditorActions } from '../actions/editorActions';
import { getOtherTabGroup, tabGroupHasDocuments } from '../helpers/editorHelpers';
import { deepCopySlow } from '../../utils';
import { SharedConstants } from '../../constants';

export interface EditorState<M = any> {
  // TODO: enum editors
  activeEditor?: string;
  draggingTab?: boolean;
  editors?: { [editorKey: string]: Editor<M> };
  docsWithPendingChanges?: string[];
}

// TODO: rename all mentions of editor to tab group
/** Represents an editor (tab group) */
export interface Editor<M = any> {
  activeDocumentId?: string;
  documents?: { [documentId: string]: Document<M> };
  /** UI representation of tab order in tab bar */
  tabOrder?: string[];
  /** Updated list of recently-used tabs (used to be tabStack) */
  recentTabs?: string[];
}

export interface Document<M = any> {
  activities: Activity[];
  botId: string;
  conversationId: string;
  contentType: string;
  directLine: DirectLine;
  dirty?: boolean;
  documentId?: string;
  fileName?: string;
  filePath?: string;
  inMemory?: boolean;
  isGlobal?: boolean;
  meta?: M;
  mode: EmulatorMode;
  ui?: DocumentUI;
  userId: string;
}

export interface DocumentUI {
  horizontalSplitter: SplitterSize[];
  verticalSplitter: SplitterSize[];
}

export interface SplitterSize {
  absolute: boolean;
  percentage: number;
}

const DEFAULT_STATE: EditorState = {
  activeEditor: SharedConstants.EDITOR_KEY_PRIMARY,
  draggingTab: false,
  editors: {
    [SharedConstants.EDITOR_KEY_PRIMARY]: getNewEditor(),
    [SharedConstants.EDITOR_KEY_SECONDARY]: getNewEditor(),
  },
  docsWithPendingChanges: [],
};

export const editor = (state: EditorState = DEFAULT_STATE, action: EditorAction | BotAction): EditorState => {
  Object.freeze(state);

  switch (action.type) {
    case EditorActions.appendTab: {
      const { srcEditorKey, destEditorKey } = action.payload;

      /** if the tab is being appended to the end of its own editor, just re-adjust tab order */
      if (srcEditorKey === destEditorKey) {
        let tabOrder = [...state.editors[srcEditorKey].tabOrder];
        tabOrder = [...tabOrder.filter(docId => docId !== action.payload.documentId), action.payload.documentId];

        const editorState: Editor = {
          ...state.editors[srcEditorKey],
          tabOrder,
        };
        state = setEditorState(srcEditorKey, editorState, state);
        state = setDraggingTab(false, state);
        break;
      }

      /**
       * if the tab is being appended to another editor,
       * we need to modify both editors' docs, recent tabs, and tab order
       */
      const docToAppend = state.editors[srcEditorKey].documents[action.payload.documentId];

      // remove any trace of document from source editor
      const srcEditor = removeDocumentFromTabGroup(state.editors[srcEditorKey], action.payload.documentId);

      // add the tab to the dest editor
      const destTabOrder = [...state.editors[destEditorKey].tabOrder, action.payload.documentId];
      const destRecentTabs = [...state.editors[destEditorKey].recentTabs, action.payload.documentId];
      const destDocs = { ...state.editors[destEditorKey].documents };
      destDocs[action.payload.documentId] = docToAppend;

      const destEditor: Editor = {
        ...state.editors[destEditorKey],
        documents: destDocs,
        recentTabs: destRecentTabs,
        tabOrder: destTabOrder,
      };

      if (!tabGroupHasDocuments(srcEditor) && srcEditorKey === SharedConstants.EDITOR_KEY_PRIMARY) {
        state = setNewPrimaryEditor(destEditor, state);
      } else {
        state = setActiveEditor(!tabGroupHasDocuments(srcEditor) ? destEditorKey : state.activeEditor, state);
        state = setEditorState(srcEditorKey, srcEditor, state);
        state = setEditorState(destEditorKey, destEditor, state);
      }
      state = setDraggingTab(false, state);
      break;
    }

    case EditorActions.close: {
      // TODO: Add logic to check if document has been saved
      // & prompt user to save document if necessary

      const { editorKey } = action.payload;

      // remove any trace of document from editor
      const editor1 = removeDocumentFromTabGroup(state.editors[editorKey], action.payload.documentId);

      // close empty editor if there is another one able to take its place
      const newPrimaryEditorKey = getOtherTabGroup(editorKey);
      if (!tabGroupHasDocuments(editor1) && state.editors[newPrimaryEditorKey]) {
        // if the editor being closed is the primary editor, have the secondary editor become the primary
        const tmp: Editor = deepCopySlow(state.editors[newPrimaryEditorKey]);
        state = setNewPrimaryEditor(tmp, state);
      } else {
        state = setEditorState(editorKey, editor1, state);
      }
      break;
    }

    case EditorActions.closeAll: {
      if (action.payload.includeGlobal) {
        return DEFAULT_STATE;
      } else {
        let newState: EditorState = {
          ...state,
        };

        for (const key in state.editors) {
          if (!state.editors.hasOwnProperty(key)) {
            continue;
          }
          const tabGroup = state.editors[key];
          if (tabGroup) {
            let newTabOrder = [...tabGroup.tabOrder];
            let newRecentTabs = [...tabGroup.recentTabs];
            const newDocs = {};

            Object.keys(tabGroup.documents).forEach(documentId => {
              const document = tabGroup.documents[documentId];
              if (document.isGlobal) {
                newDocs[documentId] = document;
              } else {
                newTabOrder = newTabOrder.filter(documentIdArg => documentIdArg !== documentId);
                newRecentTabs = newRecentTabs.filter(documentIdArg => documentIdArg !== documentId);
              }
            });

            const newTabGroup: Editor = {
              activeDocumentId: newRecentTabs[0] || null,
              documents: newDocs,
              recentTabs: newRecentTabs,
              tabOrder: newTabOrder,
            };

            newState = {
              ...newState,
              editors: {
                ...newState.editors,
                [key]: newTabGroup,
              },
            };
          }
        }
        newState = setDocsWithPendingChanges([], newState);
        state = fixupTabGroups(newState);
      }
      break;
    }

    case EditorActions.open: {
      let makeEditorActive = true;
      if (action.payload.meta && action.payload.meta.makeActiveByDefault === false) {
        makeEditorActive = false;
      }
      const editorKey = state.activeEditor;
      const otherTabGroup = getOtherTabGroup(editorKey);

      // if the document is already in another tab group, focus that one
      if (
        tabGroupHasDocuments(state.editors[otherTabGroup]) &&
        state.editors[otherTabGroup].documents[action.payload.documentId]
      ) {
        const recentTabs = [...state.editors[otherTabGroup].recentTabs].filter(
          docId => docId !== action.payload.documentId
        );
        recentTabs.unshift(action.payload.documentId);
        const tabGroupState: Editor = {
          ...state.editors[otherTabGroup],
          activeDocumentId: action.payload.documentId,
          recentTabs,
        };
        state = setEditorState(otherTabGroup, tabGroupState, state);
        state = setActiveEditor(otherTabGroup, state);
        break;
      }
      // if the document is new, insert it into the tab order after the current active document
      let newTabOrder;
      if (state.editors[editorKey].documents[action.payload.documentId]) {
        newTabOrder = [...state.editors[editorKey].tabOrder];
      } else {
        const activeDocumentId = state.editors[state.activeEditor].activeDocumentId;
        const activeIndex = state.editors[editorKey].tabOrder.indexOf(activeDocumentId);
        if (activeIndex != null && activeIndex !== -1) {
          state.editors[editorKey].tabOrder.splice(activeIndex + 1, 0, action.payload.documentId);
          newTabOrder = [...state.editors[editorKey].tabOrder];
        } else {
          newTabOrder = [...state.editors[editorKey].tabOrder, action.payload.documentId];
        }
      }

      // move document to top of recent tabs
      const newRecentTabs = [...state.editors[editorKey].recentTabs].filter(
        docId => docId !== action.payload.documentId
      );
      newRecentTabs.unshift(action.payload.documentId);

      // add document to tab group
      const newDocs = deepCopySlow(state.editors[editorKey].documents);
      // Instead of overwriting the document wholesale,
      // assign the updated keys from the payload so we do not
      // lose data from EditorActions.updateDocument
      if (!newDocs[action.payload.documentId]) {
        newDocs[action.payload.documentId] = {};
      }
      Object.assign(newDocs[action.payload.documentId], action.payload);
      let activeDocumentId = state.editors[editorKey].activeDocumentId;
      if (makeEditorActive) {
        activeDocumentId = action.payload.documentId;
      }
      const editorState: Editor = {
        ...state.editors[editorKey],
        activeDocumentId,
        documents: newDocs,
        recentTabs: newRecentTabs,
        tabOrder: newTabOrder,
      };
      state = setEditorState(editorKey, editorState, state);
      state = setActiveEditor(editorKey, state);
      break;
    }

    case EditorActions.updateDocument: {
      const { payload: updatedDocument }: { payload: Partial<Document> } = action;
      const { editors } = state;
      const editorKeys = Object.keys(editors);
      let i = editorKeys.length;
      outer: while (i--) {
        const documents = editors[editorKeys[i]].documents;
        const documentKeys = Object.keys(documents);
        let j = documentKeys.length;
        while (j--) {
          const document = documents[documentKeys[j]];
          if (document.documentId === updatedDocument.documentId) {
            documents[documentKeys[j]] = { ...document, ...updatedDocument };
            break outer;
          }
        }
      }
      state = JSON.parse(JSON.stringify(state));
      break;
    }

    case EditorActions.setActiveEditor: {
      state = setActiveEditor(action.payload.editorKey, state);
      break;
    }

    case EditorActions.setActiveTab: {
      SharedConstants.EditorKeys.forEach(editorKey => {
        if (state.editors[editorKey] && state.editors[editorKey].documents[action.payload.documentId]) {
          const recentTabs = state.editors[editorKey].recentTabs.filter(tabId => tabId !== action.payload.documentId);
          recentTabs.unshift(action.payload.documentId);

          const editorState = {
            ...state.editors[editorKey],
            activeDocumentId: action.payload.documentId,
            recentTabs,
          };
          state = setEditorState(editorKey, editorState, state);
          state = setActiveEditor(editorKey, state);
        }
      });
      break;
    }

    case EditorActions.setDirtyFlag: {
      SharedConstants.EditorKeys.forEach(editorKey => {
        if (state.editors[editorKey] && state.editors[editorKey].documents[action.payload.documentId]) {
          const newDocs = deepCopySlow(state.editors[editorKey].documents);
          const docToSet = newDocs[action.payload.documentId];
          docToSet.dirty = action.payload.dirty;

          const editorState: Editor = {
            ...state.editors[editorKey],
            documents: newDocs,
          };
          state = setEditorState(editorKey, editorState, state);
        }
      });
      break;
    }

    case EditorActions.splitTab: {
      const { srcEditorKey } = action.payload;
      const { destEditorKey } = action.payload;

      const docToAppend = state.editors[srcEditorKey].documents[action.payload.documentId];

      // remove any trace of document from source editor
      const srcEditor = removeDocumentFromTabGroup(state.editors[srcEditorKey], action.payload.documentId);

      // add the document to the dest editor
      const destEditor: Editor = state.editors[destEditorKey]
        ? deepCopySlow(state.editors[destEditorKey])
        : getNewEditor();
      const destTabOrder = [...destEditor.tabOrder, action.payload.documentId];
      const destRecentTabs = [...destEditor.recentTabs];
      destRecentTabs.unshift(action.payload.documentId);
      const destDocs = deepCopySlow(destEditor.documents);
      destDocs[action.payload.documentId] = docToAppend;

      destEditor.activeDocumentId = action.payload.documentId;
      destEditor.documents = destDocs;
      destEditor.recentTabs = destRecentTabs;
      destEditor.tabOrder = destTabOrder;

      state = setActiveEditor(destEditorKey, state);
      state = setEditorState(srcEditorKey, srcEditor, state);
      state = setEditorState(destEditorKey, destEditor, state);
      state = setDraggingTab(false, state);
      break;
    }

    case EditorActions.swapTabs: {
      const { srcEditorKey } = action.payload;
      const { destEditorKey } = action.payload;

      /** swapping tabs within the same tab group */
      if (srcEditorKey === destEditorKey) {
        // only change tab order
        const tabOrder = [...state.editors[srcEditorKey].tabOrder];
        const srcTabIndex = tabOrder.findIndex(docId => docId === action.payload.srcTabId);
        const destTabIndex1 = tabOrder.findIndex(docId => docId === action.payload.destTabId);

        const destTab = tabOrder[destTabIndex1];
        tabOrder[destTabIndex1] = tabOrder[srcTabIndex];
        tabOrder[srcTabIndex] = destTab;

        const editorState = {
          ...state.editors[srcEditorKey],
          tabOrder,
        };

        state = setEditorState(srcEditorKey, editorState, state);
        break;
      }

      /** swapping tab into a different tab group */
      const docToSwap = state.editors[srcEditorKey].documents[action.payload.srcTabId];

      // remove any trace of document from source editor
      const srcEditor = removeDocumentFromTabGroup(state.editors[srcEditorKey], action.payload.srcTabId);

      // add the document to the destination tab group
      const destEditor: Editor = deepCopySlow(state.editors[destEditorKey]);
      destEditor.documents[action.payload.srcTabId] = docToSwap;
      const destRecentTabs = [...destEditor.recentTabs, action.payload.srcTabId];
      destEditor.recentTabs = destRecentTabs;
      // insert before the destination tab's position
      const destTabIndex = destEditor.tabOrder.findIndex(docId => docId === action.payload.destTabId);
      const destTabOrder = [
        ...destEditor.tabOrder.splice(0, destTabIndex + 1),
        action.payload.srcTabId,
        ...destEditor.tabOrder,
      ];
      destEditor.tabOrder = destTabOrder;

      if (!tabGroupHasDocuments(srcEditor) && srcEditorKey === SharedConstants.EDITOR_KEY_PRIMARY) {
        state = setNewPrimaryEditor(destEditor, state);
      } else {
        state = setActiveEditor(!tabGroupHasDocuments(srcEditor) ? destEditorKey : state.activeEditor, state);
        state = setEditorState(srcEditorKey, srcEditor, state);
        state = setEditorState(destEditorKey, destEditor, state);
      }
      break;
    }

    case EditorActions.toggleDraggingTab: {
      state = setDraggingTab(action.payload.draggingTab, state);
      break;
    }

    case EditorActions.addDocPendingChange: {
      const docsPendingChange = [
        ...state.docsWithPendingChanges.filter(d => d !== action.payload.documentId),
        action.payload.documentId,
      ];
      state = setDocsWithPendingChanges(docsPendingChange, state);
      break;
    }

    case EditorActions.removeDocPendingChange: {
      const docsPendingChange = [...state.docsWithPendingChanges].filter(d => d !== action.payload.documentId);
      state = setDocsWithPendingChanges(docsPendingChange, state);
      break;
    }

    case EditorActions.dropTabOnLeftOverlay: {
      // move every other document to the secondary editor
      const { tabId: tabToIsolate } = action.payload;

      const primary = SharedConstants.EDITOR_KEY_PRIMARY;
      const secondary = SharedConstants.EDITOR_KEY_SECONDARY;

      // the primary tab group will only contain the document being dropped
      const docToIsolate = state.editors[primary].documents[tabToIsolate];
      const primaryTabs = [tabToIsolate];
      const primaryDocs = { [tabToIsolate]: docToIsolate };

      // move all documents but the one being dropped to the secondary tab group
      const secondaryTabOrder = state.editors[primary].tabOrder.filter(tabId => tabId !== tabToIsolate);
      const secondaryRecentTabs = state.editors[primary].recentTabs.filter(tabId => tabId !== tabToIsolate);
      const secondaryDocs = state.editors[primary].documents;
      delete secondaryDocs[tabToIsolate];

      const primaryEditor = getNewEditor();
      primaryEditor.activeDocumentId = tabToIsolate;
      primaryEditor.documents = primaryDocs;
      primaryEditor.recentTabs = primaryTabs;
      primaryEditor.tabOrder = primaryTabs;

      const secondaryEditor = getNewEditor();
      secondaryEditor.activeDocumentId = secondaryRecentTabs[0] || null;
      secondaryEditor.recentTabs = secondaryRecentTabs;
      secondaryEditor.tabOrder = secondaryTabOrder;
      secondaryEditor.documents = secondaryDocs;

      state = setEditorState(primary, primaryEditor, state);
      state = setEditorState(secondary, secondaryEditor, state);
      break;
    }

    default:
      break;
  }

  return state;
};

function getNewEditor(): Editor {
  return {
    activeDocumentId: null,
    documents: {},
    recentTabs: [],
    tabOrder: [],
  };
}

/** Removes all trace of a document from a tab group and returns
 *  the updated state, or a new editor if the tab group has no documents (empty)
 */
export function removeDocumentFromTabGroup(tabGroup: Editor, documentId: string): Editor {
  const newTabOrder = [...tabGroup.tabOrder].filter(docId => docId !== documentId);
  const newRecentTabs = [...tabGroup.recentTabs].filter(docId => docId !== documentId);
  const newDocs = { ...tabGroup.documents };
  delete newDocs[documentId];
  const newActiveDocumentId = newRecentTabs[0] || null;

  const newTabGroup: Editor =
    Object.keys(newDocs).length === 0
      ? getNewEditor()
      : {
          ...tabGroup,
          activeDocumentId: newActiveDocumentId,
          documents: newDocs,
          recentTabs: newRecentTabs,
          tabOrder: newTabOrder,
        };
  return newTabGroup;
}

export function setEditorState(editorKey: string, editorState: Editor, state: EditorState): EditorState {
  const newState = deepCopySlow(state);

  newState.editors[editorKey] = editorState;
  return newState;
}

function setActiveEditor(editorKey: string, state: EditorState): EditorState {
  const newState = deepCopySlow(state);

  newState.activeEditor = editorKey;
  return newState;
}

/** Sets a new primary editor, and resets the secondary editor */
export function setNewPrimaryEditor(newPrimaryEditor: Editor, state: EditorState): EditorState {
  const newState = deepCopySlow(state);

  newState.editors[SharedConstants.EDITOR_KEY_SECONDARY] = getNewEditor();
  newState.editors[SharedConstants.EDITOR_KEY_PRIMARY] = newPrimaryEditor;
  newState.activeEditor = SharedConstants.EDITOR_KEY_PRIMARY;
  return newState;
}

export function setDraggingTab(dragging: boolean, state: EditorState): EditorState {
  const newState = deepCopySlow(state);

  newState.draggingTab = dragging;
  return newState;
}

/** Sets the secondary tab group as the primary if the primary is now empty */
export function fixupTabGroups(state: EditorState): EditorState {
  if (
    !tabGroupHasDocuments(state.editors[SharedConstants.EDITOR_KEY_PRIMARY]) &&
    tabGroupHasDocuments(state.editors[SharedConstants.EDITOR_KEY_SECONDARY])
  ) {
    state = setNewPrimaryEditor(state.editors[SharedConstants.EDITOR_KEY_SECONDARY], state);
  }

  if (
    state.activeEditor === SharedConstants.EDITOR_KEY_SECONDARY &&
    !tabGroupHasDocuments(state.editors[SharedConstants.EDITOR_KEY_SECONDARY])
  ) {
    state = setActiveEditor(SharedConstants.EDITOR_KEY_PRIMARY, state);
  }

  return state;
}

/** Sets the list of docs with pending changes */
export function setDocsWithPendingChanges(docs: string[], state: EditorState): EditorState {
  const newState: EditorState = deepCopySlow(state);

  newState.docsWithPendingChanges = docs;
  return newState;
}
