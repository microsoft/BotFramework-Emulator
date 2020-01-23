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

import { deepCopySlow } from '../../utils';
import { SharedConstants as Constants } from '../../constants';
import {
  addDocPendingChange,
  appendTab,
  close,
  closeNonGlobalTabs,
  dropTabOnLeftOverlay,
  EditorAction,
  open,
  removeDocPendingChange,
  setActiveEditor,
  setActiveTab,
  setDirtyFlag,
  splitTab,
  swapTabs,
  toggleDraggingTab,
  updateDocument,
} from '../actions/editorActions';

import {
  editor,
  Editor,
  EditorState,
  fixupTabGroups,
  removeDocumentFromTabGroup,
  setDraggingTab,
  setEditorState,
  setNewPrimaryEditor,
} from './editor';

let defaultState: EditorState;

jest.mock('electron', () => ({
  remote: {
    app: {
      isPackaged: false,
    },
  },
  ipcMain: new Proxy(
    {},
    {
      get(): any {
        return () => ({});
      },
      has() {
        return true;
      },
    }
  ),
  ipcRenderer: new Proxy(
    {},
    {
      get(): any {
        return () => ({});
      },
      has() {
        return true;
      },
    }
  ),
}));

describe('Editor reducer tests', () => {
  beforeEach(initializeDefaultState);

  it('should return unaltered state for non-matching action type', () => {
    const emptyAction: EditorAction = { type: null, payload: null };
    const startingState = { ...defaultState };
    const endingState = editor(defaultState, emptyAction);
    expect(endingState).toEqual(startingState);
  });

  describe('appending a tab', () => {
    it('should just re-order the tabs when appending to same editor ', () => {
      const startingState: EditorState = {
        ...defaultState,
        draggingTab: true,
        editors: {
          ...defaultState.editors,
          [Constants.EDITOR_KEY_PRIMARY]: {
            ...defaultState.editors[Constants.EDITOR_KEY_PRIMARY],
            tabOrder: ['doc1', 'doc2'],
          },
        },
      };
      const srcEditorKey = Constants.EDITOR_KEY_PRIMARY;
      const destEditorKey = Constants.EDITOR_KEY_PRIMARY;
      const docIdToAppend = 'doc1';
      const action = appendTab(srcEditorKey, destEditorKey, docIdToAppend);
      const endingState = editor(startingState, action);
      expect(endingState.editors[Constants.EDITOR_KEY_PRIMARY].tabOrder[0]).not.toBe(docIdToAppend);
      expect(endingState.editors[Constants.EDITOR_KEY_PRIMARY].tabOrder[1]).toBe(docIdToAppend);

      // assert that draggingTab is toggled off
      expect(endingState.draggingTab).toBe(false);
    });

    it('should append a tab to the destination editor', () => {
      const startingState: EditorState = {
        ...defaultState,
        activeEditor: Constants.EDITOR_KEY_PRIMARY,
        editors: {
          ...defaultState.editors,
          [Constants.EDITOR_KEY_PRIMARY]: {
            ...defaultState.editors[Constants.EDITOR_KEY_PRIMARY],
            documents: {
              doc1: {},
              doc2: {},
            },
            tabOrder: ['doc1', 'doc2'],
            recentTabs: ['doc1', 'doc2'],
          },
          [Constants.EDITOR_KEY_SECONDARY]: {
            ...defaultState.editors[Constants.EDITOR_KEY_SECONDARY],
            documents: {
              doc3: {},
            },
            tabOrder: ['doc3'],
            recentTabs: ['doc3'],
          },
        },
      };
      const srcEditorKey = Constants.EDITOR_KEY_PRIMARY;
      const destEditorKey = Constants.EDITOR_KEY_SECONDARY;
      const action = appendTab(srcEditorKey, destEditorKey, 'doc2');
      const endingState = editor(startingState, action);
      const srcEditor = endingState.editors[srcEditorKey];
      const destEditor = endingState.editors[destEditorKey];
      expect(Object.keys(destEditor.documents)).toContain('doc2');
      expect(destEditor.tabOrder).toEqual(['doc3', 'doc2']);
      expect(destEditor.recentTabs).toEqual(['doc3', 'doc2']);

      expect(Object.keys(srcEditor.documents)).not.toContain('doc2');
      expect(srcEditor.tabOrder).toEqual(['doc1']);
      expect(srcEditor.recentTabs).toEqual(['doc1']);

      expect(endingState.activeEditor).toBe(Constants.EDITOR_KEY_PRIMARY);
    });

    it('should handle appending the last document from secondary editor to the primary editor', () => {
      const startingState: EditorState = {
        ...defaultState,
        activeEditor: Constants.EDITOR_KEY_SECONDARY,
        editors: {
          ...defaultState.editors,
          [Constants.EDITOR_KEY_PRIMARY]: {
            ...defaultState.editors[Constants.EDITOR_KEY_PRIMARY],
            documents: {
              doc1: {},
            },
            tabOrder: ['doc1'],
            recentTabs: ['doc1'],
          },
          [Constants.EDITOR_KEY_SECONDARY]: {
            ...defaultState.editors[Constants.EDITOR_KEY_SECONDARY],
            documents: {
              doc2: {},
            },
            tabOrder: ['doc2'],
            recentTabs: ['doc2'],
          },
        },
      };
      const srcEditorKey = Constants.EDITOR_KEY_SECONDARY;
      const destEditorKey = Constants.EDITOR_KEY_PRIMARY;
      const action = appendTab(srcEditorKey, destEditorKey, 'doc2');
      const endingState = editor(startingState, action);

      // because secondary editor is now empty, the active editor should be set to primary
      expect(endingState.activeEditor).toBe(Constants.EDITOR_KEY_PRIMARY);
    });

    it('should have the secondary editor replace the primary if the primary no longer has documents', () => {
      const startingState: EditorState = {
        ...defaultState,
        editors: {
          ...defaultState.editors,
          [Constants.EDITOR_KEY_PRIMARY]: {
            ...defaultState.editors[Constants.EDITOR_KEY_PRIMARY],
            documents: {
              doc1: {},
            },
            tabOrder: ['doc1'],
            recentTabs: ['doc1'],
          },
          [Constants.EDITOR_KEY_SECONDARY]: {
            ...defaultState.editors[Constants.EDITOR_KEY_SECONDARY],
            documents: {
              doc2: {},
            },
            tabOrder: ['doc2'],
            recentTabs: ['doc2'],
          },
        },
      };
      const srcEditorKey = Constants.EDITOR_KEY_PRIMARY;
      const destEditorKey = Constants.EDITOR_KEY_SECONDARY;
      const action = appendTab(srcEditorKey, destEditorKey, 'doc1');
      const endingState = editor(startingState, action);
      expect(endingState.activeEditor).toBe(Constants.EDITOR_KEY_PRIMARY);
      expect(endingState.editors[Constants.EDITOR_KEY_PRIMARY].tabOrder).toEqual(['doc2', 'doc1']);
      expect(endingState.editors[Constants.EDITOR_KEY_SECONDARY].tabOrder).toEqual([]);

      // assert that draggingTab is toggled off
      expect(endingState.draggingTab).toBe(false);
    });
  });

  describe('closing a document', () => {
    it('should close a document', () => {
      const startingState: EditorState = {
        ...defaultState,
        editors: {
          ...defaultState.editors,
          [Constants.EDITOR_KEY_PRIMARY]: {
            ...defaultState.editors[Constants.EDITOR_KEY_PRIMARY],
            activeDocumentId: 'doc1',
            documents: {
              doc1: {},
              doc2: {},
            },
            recentTabs: ['doc1', 'doc2'],
            tabOrder: ['doc1', 'doc2'],
          },
        },
      };
      const editorKey = Constants.EDITOR_KEY_PRIMARY;
      const action = close(editorKey, 'doc1');
      const endingState = editor(startingState, action);
      const modifiedEditor = endingState.editors[editorKey];
      expect(Object.keys(modifiedEditor.documents)).not.toContain('doc1');
      expect(modifiedEditor.recentTabs).toEqual(['doc2']);
      expect(modifiedEditor.tabOrder).toEqual(['doc2']);
      expect(modifiedEditor.activeDocumentId).toBe('doc2');
    });

    it('should set a new primary editor if the old primary has no remaining documents', () => {
      const startingState: EditorState = {
        ...defaultState,
        activeEditor: Constants.EDITOR_KEY_SECONDARY,
        editors: {
          ...defaultState.editors,
          [Constants.EDITOR_KEY_PRIMARY]: {
            ...defaultState.editors[Constants.EDITOR_KEY_PRIMARY],
            activeDocumentId: 'doc1',
            documents: {
              doc1: {},
            },
            recentTabs: ['doc1'],
            tabOrder: ['doc1'],
          },
          [Constants.EDITOR_KEY_SECONDARY]: {
            ...defaultState.editors[Constants.EDITOR_KEY_SECONDARY],
            activeDocumentId: 'doc2',
            documents: {
              doc2: {},
            },
            recentTabs: ['doc2'],
            tabOrder: ['doc2'],
          },
        },
      };
      const editorKey = Constants.EDITOR_KEY_PRIMARY;
      const action = close(editorKey, 'doc1');
      const endingState = editor(startingState, action);
      const primaryEditor = endingState.editors[Constants.EDITOR_KEY_PRIMARY];
      expect(endingState.activeEditor).toBe(Constants.EDITOR_KEY_PRIMARY);
      expect(primaryEditor.recentTabs).toEqual(['doc2']);
      expect(primaryEditor.tabOrder).toEqual(['doc2']);
      expect(Object.keys(primaryEditor.documents)).toContain('doc2');
      expect(Object.keys(endingState.editors[Constants.EDITOR_KEY_SECONDARY].documents)).not.toContain('doc1');
    });
  });

  it('should set "draggingTab" state', () => {
    const action = toggleDraggingTab(true);
    const state = editor(defaultState, action);
    expect(state.draggingTab).toBe(true);
  });

  it('should set the active editor', () => {
    const startingState: EditorState = {
      ...defaultState,
      activeEditor: Constants.EDITOR_KEY_SECONDARY,
    };
    const action = setActiveEditor(Constants.EDITOR_KEY_PRIMARY);
    const endingState = editor(startingState, action);
    expect(endingState.activeEditor).toBe(Constants.EDITOR_KEY_PRIMARY);
  });

  it('should set the active tab', () => {
    const startingState: EditorState = {
      ...defaultState,
      activeEditor: Constants.EDITOR_KEY_SECONDARY,
      editors: {
        ...defaultState.editors,
        [Constants.EDITOR_KEY_PRIMARY]: {
          ...defaultState.editors[Constants.EDITOR_KEY_PRIMARY],
          activeDocumentId: 'doc1',
          documents: {
            doc1: {},
            doc2: {},
          },
          recentTabs: ['doc1', 'doc2'],
          tabOrder: ['doc1', 'doc2'],
        },
        [Constants.EDITOR_KEY_SECONDARY]: {
          ...defaultState.editors[Constants.EDITOR_KEY_SECONDARY],
          activeDocumentId: 'doc3',
          documents: {
            doc3: {},
          },
          recentTabs: ['doc3'],
          tabOrder: ['doc3'],
        },
      },
    };
    const action = setActiveTab('doc2');
    const endingState = editor(startingState, action);
    const newActiveEditor = endingState.editors[Constants.EDITOR_KEY_PRIMARY];
    expect(endingState.activeEditor).toBe(Constants.EDITOR_KEY_PRIMARY);
    expect(newActiveEditor.activeDocumentId).toBe('doc2');
    expect(newActiveEditor.recentTabs).toEqual(['doc2', 'doc1']);
  });

  it("should set a document's dirty flag", () => {
    const startingState: EditorState = {
      ...defaultState,
      editors: {
        ...defaultState.editors,
        [Constants.EDITOR_KEY_SECONDARY]: {
          ...defaultState.editors[Constants.EDITOR_KEY_SECONDARY],
          activeDocumentId: 'doc3',
          documents: {
            doc3: { dirty: false },
          },
          recentTabs: ['doc3'],
          tabOrder: ['doc3'],
        },
      },
    };
    const dirtyDocId = 'doc3';
    const action = setDirtyFlag(dirtyDocId, true);
    const endingState = editor(startingState, action);
    expect(endingState.editors[Constants.EDITOR_KEY_SECONDARY].documents[dirtyDocId].dirty).toBe(true);
  });

  it('should close all non-global tabs', () => {
    const startingState: EditorState = {
      ...defaultState,
      activeEditor: Constants.EDITOR_KEY_PRIMARY,
      editors: {
        ...defaultState.editors,
        [Constants.EDITOR_KEY_PRIMARY]: {
          ...defaultState.editors[Constants.EDITOR_KEY_PRIMARY],
          activeDocumentId: 'doc2',
          documents: {
            doc1: { isGlobal: true },
            doc2: { isGlobal: false },
            doc3: { isGlobal: false },
          },
          recentTabs: ['doc2', 'doc1', 'doc3'],
          tabOrder: ['doc1', 'doc2', 'doc3'],
        },
        [Constants.EDITOR_KEY_SECONDARY]: {
          ...defaultState.editors[Constants.EDITOR_KEY_SECONDARY],
          activeDocumentId: 'doc6',
          documents: {
            doc4: { isGlobal: false },
            doc5: { isGlobal: true },
            doc6: { isGlobal: true },
          },
          recentTabs: ['doc6', 'doc4', 'doc5'],
          tabOrder: ['doc4', 'doc5', 'doc6'],
        },
      },
      docsWithPendingChanges: ['doc2', 'doc3'],
    };
    const action = closeNonGlobalTabs();
    const endingState = editor(startingState, action);
    const primaryEditor = endingState.editors[Constants.EDITOR_KEY_PRIMARY];
    const secondaryEditor = endingState.editors[Constants.EDITOR_KEY_SECONDARY];

    expect(primaryEditor.activeDocumentId).toBe('doc1');
    expect(Object.keys(primaryEditor.documents)).toHaveLength(1);
    expect(primaryEditor.recentTabs).toEqual(['doc1']);
    expect(primaryEditor.tabOrder).toEqual(['doc1']);

    expect(secondaryEditor.activeDocumentId).toBe('doc6');
    expect(Object.keys(secondaryEditor.documents)).toHaveLength(2);
    expect(secondaryEditor.recentTabs).toEqual(['doc6', 'doc5']);
    expect(secondaryEditor.tabOrder).toEqual(['doc5', 'doc6']);
    expect(endingState.docsWithPendingChanges).toEqual([]);
  });

  it('should update a document', () => {
    const startingState: EditorState = {
      ...defaultState,
      editors: {
        ...defaultState.editors,
        [Constants.EDITOR_KEY_PRIMARY]: {
          ...defaultState.editors[Constants.EDITOR_KEY_PRIMARY],
          activeDocumentId: 'doc1',
          documents: {
            doc1: { documentId: 'doc1' },
          },
          recentTabs: ['doc1'],
          tabOrder: ['doc1'],
        },
      },
    };
    const docToUpdateId = 'doc1';
    const action = updateDocument(docToUpdateId, {
      isGlobal: true,
      dirty: true,
    });
    const endingState = editor(startingState, action);
    expect(endingState.editors[Constants.EDITOR_KEY_PRIMARY].documents[docToUpdateId]).toEqual({
      documentId: 'doc1',
      isGlobal: true,
      dirty: true,
    });
  });

  describe('opening a document', () => {
    it('should focus an already existing document in other tab group', () => {
      const startingState: EditorState = {
        ...defaultState,
        activeEditor: Constants.EDITOR_KEY_PRIMARY,
        editors: {
          ...defaultState.editors,
          [Constants.EDITOR_KEY_PRIMARY]: {
            ...defaultState.editors[Constants.EDITOR_KEY_PRIMARY],
            activeDocumentId: 'doc1',
            documents: {
              doc1: {},
            },
            recentTabs: ['doc1'],
            tabOrder: ['doc1'],
          },
          [Constants.EDITOR_KEY_SECONDARY]: {
            ...defaultState.editors[Constants.EDITOR_KEY_SECONDARY],
            activeDocumentId: 'doc2',
            documents: {
              doc2: {},
              doc3: {},
            },
            recentTabs: ['doc3', 'doc2'],
            tabOrder: ['doc2', 'doc3'],
          },
        },
      };
      const action = open({
        contentType: Constants.CONTENT_TYPE_APP_SETTINGS,
        documentId: 'doc2',
        isGlobal: true,
      });
      const endingState = editor(startingState, action);
      expect(endingState.activeEditor).toBe(Constants.EDITOR_KEY_SECONDARY);
      expect(endingState.editors[Constants.EDITOR_KEY_SECONDARY].recentTabs).toEqual(['doc2', 'doc3']);
    });

    it('should focus an already existing document in the same tab group', () => {
      const startingState: EditorState = {
        ...defaultState,
        activeEditor: Constants.EDITOR_KEY_PRIMARY,
        editors: {
          ...defaultState.editors,
          [Constants.EDITOR_KEY_PRIMARY]: {
            ...defaultState.editors[Constants.EDITOR_KEY_PRIMARY],
            activeDocumentId: 'doc1',
            documents: {
              doc1: {},
              doc2: {},
            },
            recentTabs: ['doc1', 'doc2'],
            tabOrder: ['doc1', 'doc2'],
          },
        },
      };
      const action = open({
        contentType: Constants.CONTENT_TYPE_APP_SETTINGS,
        documentId: 'doc2',
        isGlobal: true,
      });
      const endingState = editor(startingState, action);
      const primaryEditor = endingState.editors[Constants.EDITOR_KEY_PRIMARY];
      expect(primaryEditor.activeDocumentId).toBe('doc2');
      expect(primaryEditor.recentTabs).toEqual(['doc2', 'doc1']);
      expect(primaryEditor.tabOrder).toEqual(['doc1', 'doc2']);
    });

    it('should insert a new document after the current active document', () => {
      const startingState: EditorState = {
        ...defaultState,
        activeEditor: Constants.EDITOR_KEY_PRIMARY,
        editors: {
          ...defaultState.editors,
          [Constants.EDITOR_KEY_PRIMARY]: {
            ...defaultState.editors[Constants.EDITOR_KEY_PRIMARY],
            activeDocumentId: 'doc1',
            documents: {
              doc1: {},
              doc2: {},
            },
            recentTabs: ['doc1', 'doc2'],
            tabOrder: ['doc1', 'doc2'],
          },
        },
      };
      const action = open({
        contentType: Constants.CONTENT_TYPE_APP_SETTINGS,
        documentId: 'doc3',
        isGlobal: true,
      });
      const endingState = editor(startingState, action);
      const primaryEditor = endingState.editors[Constants.EDITOR_KEY_PRIMARY];
      expect(primaryEditor.activeDocumentId).toBe('doc3');
      expect(primaryEditor.recentTabs).toEqual(['doc3', 'doc1', 'doc2']);
      expect(primaryEditor.tabOrder).toEqual(['doc1', 'doc3', 'doc2']);
      expect(Object.keys(primaryEditor.documents)).toContain('doc3');
    });

    it("should append new document if current activeDocument isn't found", () => {
      const startingState: EditorState = {
        ...defaultState,
        activeEditor: Constants.EDITOR_KEY_PRIMARY,
        editors: {
          ...defaultState.editors,
          [Constants.EDITOR_KEY_PRIMARY]: {
            ...defaultState.editors[Constants.EDITOR_KEY_PRIMARY],
            activeDocumentId: 'doc1234',
            documents: {
              doc1: {},
              doc2: {},
            },
            recentTabs: ['doc1', 'doc2'],
            tabOrder: ['doc1', 'doc2'],
          },
        },
      };
      const action = open({
        contentType: Constants.CONTENT_TYPE_APP_SETTINGS,
        documentId: 'doc3',
        isGlobal: true,
      });
      const endingState = editor(startingState, action);
      const primaryEditor = endingState.editors[Constants.EDITOR_KEY_PRIMARY];
      expect(primaryEditor.activeDocumentId).toBe('doc3');
      expect(primaryEditor.recentTabs).toEqual(['doc3', 'doc1', 'doc2']);
      expect(primaryEditor.tabOrder).toEqual(['doc1', 'doc2', 'doc3']);
      expect(Object.keys(primaryEditor.documents)).toContain('doc3');
    });
  });

  it('should split a tab to the other tab group', () => {
    const startingState: EditorState = {
      ...defaultState,
      activeEditor: Constants.EDITOR_KEY_PRIMARY,
      draggingTab: true,
      editors: {
        ...defaultState.editors,
        [Constants.EDITOR_KEY_PRIMARY]: {
          ...defaultState.editors[Constants.EDITOR_KEY_PRIMARY],
          activeDocumentId: 'doc2',
          documents: {
            doc1: {},
            doc2: {},
          },
          recentTabs: ['doc1', 'doc2'],
          tabOrder: ['doc1', 'doc2'],
        },
        [Constants.EDITOR_KEY_SECONDARY]: {
          ...defaultState.editors[Constants.EDITOR_KEY_SECONDARY],
          activeDocumentId: 'doc3',
          documents: {
            doc3: {},
          },
          recentTabs: ['doc3'],
          tabOrder: ['doc3'],
        },
      },
    };
    const action = splitTab(
      Constants.CONTENT_TYPE_APP_SETTINGS,
      'doc2',
      Constants.EDITOR_KEY_PRIMARY,
      Constants.EDITOR_KEY_SECONDARY
    );
    const endingState = editor(startingState, action);
    const primaryEditor = endingState.editors[Constants.EDITOR_KEY_PRIMARY];
    const secondaryEditor = endingState.editors[Constants.EDITOR_KEY_SECONDARY];

    expect(Object.keys(primaryEditor.documents)).not.toContain('doc2');
    expect(primaryEditor.recentTabs).toEqual(['doc1']);
    expect(primaryEditor.tabOrder).toEqual(['doc1']);
    expect(primaryEditor.activeDocumentId).toBe('doc1');

    expect(Object.keys(secondaryEditor.documents)).toContain('doc2');
    expect(secondaryEditor.recentTabs).toEqual(['doc2', 'doc3']);
    expect(secondaryEditor.tabOrder).toEqual(['doc3', 'doc2']);
    expect(secondaryEditor.activeDocumentId).toBe('doc2');

    expect(endingState.draggingTab).toBe(false);
  });

  describe('swapping tabs', () => {
    it('should swap tabs within the same tab group', () => {
      const startingState: EditorState = {
        ...defaultState,
        activeEditor: Constants.EDITOR_KEY_PRIMARY,
        editors: {
          ...defaultState.editors,
          [Constants.EDITOR_KEY_PRIMARY]: {
            ...defaultState.editors[Constants.EDITOR_KEY_PRIMARY],
            documents: {
              doc1: {},
              doc2: {},
              doc3: {},
            },
            recentTabs: ['doc3', 'doc2', 'doc1'],
            tabOrder: ['doc1', 'doc2', 'doc3'],
          },
        },
      };
      const action = swapTabs(Constants.EDITOR_KEY_PRIMARY, Constants.EDITOR_KEY_PRIMARY, 'doc1', 'doc3');
      const endingState = editor(startingState, action);
      const primaryEditor = endingState.editors[Constants.EDITOR_KEY_PRIMARY];
      expect(primaryEditor.tabOrder).toEqual(['doc3', 'doc2', 'doc1']);
    });

    it('should move a tab to another tab group', () => {
      const startingState: EditorState = {
        ...defaultState,
        activeEditor: Constants.EDITOR_KEY_SECONDARY,
        editors: {
          ...defaultState.editors,
          [Constants.EDITOR_KEY_PRIMARY]: {
            ...defaultState.editors[Constants.EDITOR_KEY_PRIMARY],
            documents: {
              doc1: {},
              doc2: {},
            },
            recentTabs: ['doc2', 'doc1'],
            tabOrder: ['doc1', 'doc2'],
          },
          [Constants.EDITOR_KEY_SECONDARY]: {
            ...defaultState.editors[Constants.EDITOR_KEY_SECONDARY],
            activeDocumentId: 'doc3',
            documents: {
              doc3: {},
              doc4: {},
            },
            recentTabs: ['doc4', 'doc3'],
            tabOrder: ['doc3', 'doc4'],
          },
        },
      };
      const action = swapTabs(Constants.EDITOR_KEY_SECONDARY, Constants.EDITOR_KEY_PRIMARY, 'doc3', 'doc1');
      const endingState = editor(startingState, action);
      const primaryEditor = endingState.editors[Constants.EDITOR_KEY_PRIMARY];
      const secondaryEditor = endingState.editors[Constants.EDITOR_KEY_SECONDARY];
      expect(endingState.activeEditor).toBe(Constants.EDITOR_KEY_SECONDARY);

      expect(Object.keys(primaryEditor.documents)).toContain('doc3');
      expect(primaryEditor.recentTabs).toEqual(['doc2', 'doc1', 'doc3']);
      expect(primaryEditor.tabOrder).toEqual(['doc1', 'doc3', 'doc2']);

      expect(Object.keys(secondaryEditor.documents)).not.toContain('doc3');
      expect(secondaryEditor.activeDocumentId).toBe('doc4');
      expect(secondaryEditor.recentTabs).toEqual(['doc4']);
      expect(secondaryEditor.tabOrder).toEqual(['doc4']);
    });

    it('should focus primary if secondary tab group has no remaining docs', () => {
      const startingState: EditorState = {
        ...defaultState,
        activeEditor: Constants.EDITOR_KEY_SECONDARY,
        editors: {
          ...defaultState.editors,
          [Constants.EDITOR_KEY_PRIMARY]: {
            ...defaultState.editors[Constants.EDITOR_KEY_PRIMARY],
            documents: {
              doc1: {},
              doc2: {},
            },
            recentTabs: ['doc2', 'doc1'],
            tabOrder: ['doc1', 'doc2'],
          },
          [Constants.EDITOR_KEY_SECONDARY]: {
            ...defaultState.editors[Constants.EDITOR_KEY_SECONDARY],
            activeDocumentId: 'doc3',
            documents: {
              doc3: {},
            },
            recentTabs: ['doc3'],
            tabOrder: ['doc3'],
          },
        },
      };
      const action = swapTabs(Constants.EDITOR_KEY_SECONDARY, Constants.EDITOR_KEY_PRIMARY, 'doc3', 'doc1');
      const endingState = editor(startingState, action);
      expect(endingState.activeEditor).toBe(Constants.EDITOR_KEY_PRIMARY);
    });

    it('should set secondary as new primary tab group if primary has no remaining docs', () => {
      const startingState: EditorState = {
        ...defaultState,
        activeEditor: Constants.EDITOR_KEY_SECONDARY,
        editors: {
          ...defaultState.editors,
          [Constants.EDITOR_KEY_PRIMARY]: {
            ...defaultState.editors[Constants.EDITOR_KEY_PRIMARY],
            activeDocumentId: 'doc1',
            documents: {
              doc1: {},
            },
            recentTabs: ['doc1'],
            tabOrder: ['doc1'],
          },
          [Constants.EDITOR_KEY_SECONDARY]: {
            ...defaultState.editors[Constants.EDITOR_KEY_SECONDARY],
            activeDocumentId: 'doc2',
            documents: {
              doc2: {},
            },
            recentTabs: ['doc2'],
            tabOrder: ['doc2'],
          },
        },
      };
      const action = swapTabs(Constants.EDITOR_KEY_PRIMARY, Constants.EDITOR_KEY_SECONDARY, 'doc1', 'doc2');
      const endingState = editor(startingState, action);
      const primaryEditor = endingState.editors[Constants.EDITOR_KEY_PRIMARY];
      const secondaryEditor = endingState.editors[Constants.EDITOR_KEY_SECONDARY];
      expect(endingState.activeEditor).toBe(Constants.EDITOR_KEY_PRIMARY);

      expect(primaryEditor.activeDocumentId).toBe('doc2');
      expect(Object.keys(primaryEditor.documents)).toHaveLength(2);
      expect(primaryEditor.recentTabs).toEqual(['doc2', 'doc1']);
      expect(primaryEditor.tabOrder).toEqual(['doc2', 'doc1']);

      expect(secondaryEditor.activeDocumentId).toBe(null);
      expect(Object.keys(secondaryEditor.documents)).toHaveLength(0);
      expect(secondaryEditor.recentTabs).toEqual([]);
      expect(secondaryEditor.tabOrder).toEqual([]);
    });
  });

  describe('modifying the list of docs pending changes', () => {
    it('should add a doc to the list', () => {
      const startingState: EditorState = {
        ...defaultState,
        docsWithPendingChanges: ['doc1', 'doc2', 'doc3'],
      };
      const action1 = addDocPendingChange('doc4');
      const endingState1 = editor(startingState, action1);

      expect(endingState1.docsWithPendingChanges).toEqual(['doc1', 'doc2', 'doc3', 'doc4']);

      // shouldn't allow duplicates
      const action2 = addDocPendingChange('doc4');
      const endingState2 = editor(endingState1, action2);

      expect(endingState2.docsWithPendingChanges).toEqual(['doc1', 'doc2', 'doc3', 'doc4']);
    });

    it('should remove a doc from the list', () => {
      const startingState: EditorState = {
        ...defaultState,
        docsWithPendingChanges: ['doc1', 'doc2', 'doc3'],
      };
      const action = removeDocPendingChange('doc2');
      const endingState = editor(startingState, action);

      expect(endingState.docsWithPendingChanges).toEqual(['doc1', 'doc3']);
    });
  });
});

describe('Editor reducer utility function tests', () => {
  beforeEach(initializeDefaultState);

  it('setDraggingTab() functionality', () => {
    let state = setDraggingTab(true, defaultState);
    expect(state.draggingTab).toBe(true);
    state = setDraggingTab(false, state);
    expect(state.draggingTab).toBe(false);
  });

  it('setNewPrimaryEditor() functionality', () => {
    const startingState: EditorState = {
      ...defaultState,
      activeEditor: Constants.EDITOR_KEY_SECONDARY,
      editors: {
        ...defaultState.editors,
        [Constants.EDITOR_KEY_SECONDARY]: {
          activeDocumentId: 'doc1',
          documents: {
            doc1: {},
          },
          tabOrder: ['doc1'],
          recentTabs: ['doc1'],
        },
      },
    };

    const newPrimaryEditor: Editor = {
      activeDocumentId: 'doc2',
      documents: {
        doc2: {},
      },
      tabOrder: ['doc2'],
      recentTabs: ['doc2'],
    };

    const endingState = setNewPrimaryEditor(newPrimaryEditor, startingState);
    expect(endingState.activeEditor).toBe(Constants.EDITOR_KEY_PRIMARY);
    expect(endingState.editors[Constants.EDITOR_KEY_PRIMARY].activeDocumentId).toEqual('doc2');
    expect(endingState.editors[Constants.EDITOR_KEY_PRIMARY].tabOrder).toEqual(['doc2']);
    expect(endingState.editors[Constants.EDITOR_KEY_PRIMARY].recentTabs).toEqual(['doc2']);
    expect(Object.keys(endingState.editors[Constants.EDITOR_KEY_PRIMARY].documents)).toContain('doc2');

    expect(endingState.editors[Constants.EDITOR_KEY_SECONDARY].activeDocumentId).toBe(null);
    expect(endingState.editors[Constants.EDITOR_KEY_SECONDARY].documents).toEqual({});
    expect(endingState.editors[Constants.EDITOR_KEY_SECONDARY].recentTabs).toEqual([]);
    expect(endingState.editors[Constants.EDITOR_KEY_SECONDARY].tabOrder).toEqual([]);
  });

  it('setEditorState() functionality', () => {
    const updatedEditor: Editor = {
      activeDocumentId: 'testing',
      documents: {},
      tabOrder: ['testing'],
      recentTabs: ['testing'],
    };
    const newState = setEditorState(Constants.EDITOR_KEY_PRIMARY, updatedEditor, defaultState);
    expect(newState).not.toBe(defaultState);
    expect(newState.editors[Constants.EDITOR_KEY_PRIMARY].activeDocumentId).toBe('testing');
    expect(newState.editors[Constants.EDITOR_KEY_PRIMARY].tabOrder).toEqual(['testing']);
    expect(newState.editors[Constants.EDITOR_KEY_PRIMARY].recentTabs).toEqual(['testing']);
  });

  describe('removeDocumentFromTabGroup() functionality', () => {
    it('removing a document from a tab group', () => {
      const docToRemove = 'doc1';
      const tempEditor: Editor = {
        activeDocumentId: docToRemove,
        documents: {
          [docToRemove]: {},
          doc2: {},
        },
        tabOrder: [docToRemove, 'doc2'],
        recentTabs: [docToRemove, 'doc2'],
      };

      const modifiedEditor = removeDocumentFromTabGroup(tempEditor, docToRemove);
      expect(modifiedEditor).not.toBe(tempEditor);
      expect(modifiedEditor.activeDocumentId).toBe('doc2');
      expect(modifiedEditor.recentTabs).not.toContain(docToRemove);
      expect(modifiedEditor.tabOrder).not.toContain(docToRemove);
      expect(Object.keys(modifiedEditor.documents)).not.toContain(docToRemove);
    });

    it('removing the last document from a tab group', () => {
      const tempEditor: Editor = {
        activeDocumentId: 'doc1',
        documents: {
          doc1: {},
        },
        tabOrder: ['doc1'],
        recentTabs: ['doc1'],
      };

      const modifiedEditor = removeDocumentFromTabGroup(tempEditor, 'doc1');
      expect(modifiedEditor.activeDocumentId).toBe(null);
      expect(modifiedEditor.documents).toEqual({});
      expect(modifiedEditor.recentTabs).toEqual([]);
      expect(modifiedEditor.tabOrder).toEqual([]);
    });
  });

  describe('fixupTabGroups() functionality', () => {
    it('should set secondary tab group as primary & active if primary has no remaining docs', () => {
      const startingState: EditorState = {
        ...defaultState,
        activeEditor: Constants.EDITOR_KEY_SECONDARY,
        editors: {
          ...defaultState.editors,
          [Constants.EDITOR_KEY_PRIMARY]: {
            ...defaultState.editors[Constants.EDITOR_KEY_PRIMARY],
            activeDocumentId: null,
            documents: {},
            recentTabs: [],
            tabOrder: [],
          },
          [Constants.EDITOR_KEY_SECONDARY]: {
            ...defaultState.editors[Constants.EDITOR_KEY_SECONDARY],
            activeDocumentId: 'doc2',
            documents: {
              doc2: {},
            },
            recentTabs: ['doc2'],
            tabOrder: ['doc2'],
          },
        },
      };
      const endState = fixupTabGroups(startingState);
      const primaryEditor = endState.editors[Constants.EDITOR_KEY_PRIMARY];
      const secondaryEditor = endState.editors[Constants.EDITOR_KEY_SECONDARY];
      expect(endState.activeEditor).toBe(Constants.EDITOR_KEY_PRIMARY);

      expect(Object.keys(primaryEditor.documents)).toContain('doc2');
      expect(primaryEditor.activeDocumentId).toBe('doc2');
      expect(primaryEditor.tabOrder).toEqual(['doc2']);
      expect(primaryEditor.recentTabs).toEqual(['doc2']);

      expect(Object.keys(secondaryEditor.documents)).toHaveLength(0);
      expect(secondaryEditor.activeDocumentId).toBe(null);
      expect(secondaryEditor.tabOrder).toEqual([]);
      expect(secondaryEditor.recentTabs).toEqual([]);
    });

    it('should set the primary tab group as active editor if secondary has no remaining docs', () => {
      const startingState: EditorState = {
        ...defaultState,
        activeEditor: Constants.EDITOR_KEY_SECONDARY,
        editors: {
          ...defaultState.editors,
          [Constants.EDITOR_KEY_PRIMARY]: {
            ...defaultState.editors[Constants.EDITOR_KEY_PRIMARY],
            activeDocumentId: 'doc1',
            documents: {
              doc1: {},
            },
            recentTabs: ['doc1'],
            tabOrder: ['doc1'],
          },
          [Constants.EDITOR_KEY_SECONDARY]: {
            ...defaultState.editors[Constants.EDITOR_KEY_SECONDARY],
            activeDocumentId: null,
            documents: {},
            recentTabs: [],
            tabOrder: [],
          },
        },
      };
      const endState = fixupTabGroups(startingState);
      expect(endState.activeEditor).toBe(Constants.EDITOR_KEY_PRIMARY);
    });

    it('should return state unaltered if both tab groups have documents', () => {
      const startingState: EditorState = {
        ...defaultState,
        activeEditor: Constants.EDITOR_KEY_PRIMARY,
        editors: {
          ...defaultState.editors,
          [Constants.EDITOR_KEY_PRIMARY]: {
            ...defaultState.editors[Constants.EDITOR_KEY_PRIMARY],
            activeDocumentId: 'doc1',
            documents: {
              doc1: {},
            },
            recentTabs: ['doc1'],
            tabOrder: ['doc1'],
          },
          [Constants.EDITOR_KEY_SECONDARY]: {
            ...defaultState.editors[Constants.EDITOR_KEY_SECONDARY],
            activeDocumentId: 'doc2',
            documents: {
              doc2: {},
            },
            recentTabs: ['doc2'],
            tabOrder: ['doc2'],
          },
        },
      };
      const endState = fixupTabGroups(startingState);
      expect(endState).toEqual(startingState);
    });
  });

  test('dropping a tab on the left side of the editor', () => {
    const startingState: EditorState = {
      ...defaultState,
      activeEditor: Constants.EDITOR_KEY_PRIMARY,
      editors: {
        [Constants.EDITOR_KEY_PRIMARY]: {
          activeDocumentId: 'doc2',
          documents: {
            doc1: {},
            doc2: {},
            doc3: {},
          },
          recentTabs: ['doc2', 'doc1', 'doc3'],
          tabOrder: ['doc1', 'doc2', 'doc3'],
        },
        [Constants.EDITOR_KEY_SECONDARY]: {},
      },
    };

    const tabIdToDrop = 'doc1';
    const action = dropTabOnLeftOverlay(tabIdToDrop);
    const endingState = editor(startingState, action);

    const primaryEditor = endingState.editors[Constants.EDITOR_KEY_PRIMARY];
    const secondaryEditor = endingState.editors[Constants.EDITOR_KEY_SECONDARY];

    expect(primaryEditor.activeDocumentId).toBe(tabIdToDrop);
    expect(primaryEditor.recentTabs).toHaveLength(1);
    expect(primaryEditor.recentTabs[0]).toBe(tabIdToDrop);
    expect(primaryEditor.tabOrder).toHaveLength(1);
    expect(primaryEditor.tabOrder[0]).toBe(tabIdToDrop);
    expect(Object.keys(primaryEditor.documents)).toHaveLength(1);
    expect(primaryEditor.documents[tabIdToDrop]).toBeTruthy();

    expect(secondaryEditor.activeDocumentId).toBe('doc2');
    expect(secondaryEditor.recentTabs).toHaveLength(2);
    expect(secondaryEditor.recentTabs).toEqual(['doc2', 'doc3']);
    expect(secondaryEditor.tabOrder).toHaveLength(2);
    expect(secondaryEditor.tabOrder).toEqual(['doc2', 'doc3']);
    expect(Object.keys(secondaryEditor.documents)).toHaveLength(2);
    expect(Object.keys(secondaryEditor.documents)).toEqual(['doc2', 'doc3']);
  });
});

function initializeDefaultState() {
  const DEFAULT_STATE: EditorState = {
    activeEditor: null,
    draggingTab: false,
    editors: {
      [Constants.EDITOR_KEY_PRIMARY]: {
        activeDocumentId: null,
        documents: {},
        tabOrder: [],
        recentTabs: [],
      },
      [Constants.EDITOR_KEY_SECONDARY]: {
        activeDocumentId: null,
        documents: {},
        tabOrder: [],
        recentTabs: [],
      },
    },
    docsWithPendingChanges: [],
  };
  defaultState = deepCopySlow(DEFAULT_STATE);
}
