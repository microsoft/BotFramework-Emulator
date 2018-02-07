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
import * as constants from '../../constants';

const DEFAULT_STATE = {
    activeEditor: 'primary',
    editors: {
        'primary': {
            activeDocumentId: 'emulator:1',
            documents: [{
                contentType: constants.ContentType_Emulator,
                documentId: 'emulator:1'
            }, {
                contentType: constants.ContentType_TestBed,
                documentId: 'testbed:1'
            }],
            tabStack: ['emulator:1', 'testbed:1'],
        },
        'secondary': null
    }
};

export default function documents(state = DEFAULT_STATE, action) {
    const selectedEditor = action.payload ? action.payload.editorKey : null;

    // TODO: refactor some of the larger action handlers (add state utility functions?)
    switch (action.type) {
        case EditorActions.APPEND_TAB:
            // if the tab is being appended to the end of its own editor, use one document array
            if (action.payload.srcEditorKey === action.payload.destEditorKey) {
                var docs = [...state.editors[action.payload.srcEditorKey].documents];

                const docToAppend = docs.find(doc => doc.documentId === action.payload.documentId);
                docs = [...docs.filter(doc => doc.documentId !== action.payload.documentId), docToAppend];

                state = {
                    ...state,
                    editors: {
                        ...state.editors,
                        [action.payload.srcEditorKey]: {
                            ...state.editors[action.payload.srcEditorKey],
                            documents: docs,
                        }
                    }
                };
                break;
            }

            // if the tab is being appended to another editor, we need to track both editors' documents and tabstacks
            var srcDocs = [...state.editors[action.payload.srcEditorKey].documents];
            var srcTabStack = [...state.editors[action.payload.srcEditorKey].tabStack];

            const docToAppend = srcDocs.find(doc => doc.documentId === action.payload.documentId);
            srcDocs = srcDocs.filter(doc => doc.documentId !== action.payload.documentId);
            srcTabStack = srcTabStack.filter(tabId => tabId !== action.payload.documentId);
            var srcEditor = srcDocs.length === 0 ? null : {
                ...state.editors[action.payload.srcEditorKey],
                documents: srcDocs,
                tabStack: srcTabStack
            };

            var destDocs = [...state.editors[action.payload.destEditorKey].documents, docToAppend];
            var destTabStack = [...state.editors[action.payload.destEditorKey].tabStack, action.payload.documentId];

            state = {
                ...state,
                activeEditor: !srcEditor ? action.payload.destEditorKey : state.activeEditor,
                editors: {
                    ...state.editors,
                    [action.payload.srcEditorKey]: srcEditor,
                    [action.payload.destEditorKey]: {
                        ...state.editors[action.payload.destEditorKey],
                        documents: destDocs,
                        tabStack: destTabStack
                    }
                }
            };

            break;

        case EditorActions.CLOSE:
            // TODO: Add logic to check if document has been saved
            // & prompt user to save document if necessary

            var newTabStack = state.editors[selectedEditor].tabStack.filter(tabId => tabId !== action.payload.documentId);
            let newDocumentList = state.editors[selectedEditor].documents.filter(doc => doc.documentId !== action.payload.documentId);
            let newActiveDocumentId = newTabStack[0] || null;

            state = { ...state };

            // close empty editor if there is another one able to take its place
            const newPrimaryEditorKey = selectedEditor === 'primary' ? 'secondary' : 'primary';
            if (!newDocumentList.length && state.editors[newPrimaryEditorKey]) {
                // if the editor being closed is the primary editor, have the secondary editor become the primary
                const tmp = state.editors[newPrimaryEditorKey];
                state.editors[newPrimaryEditorKey] = null;
                state.editors[selectedEditor] = null;
                state.editors['primary'] = tmp;
                state.activeEditor = 'primary';
            } else {
                state.editors[selectedEditor] = {
                    ...state.editors[selectedEditor],
                    documents: newDocumentList,
                    activeDocumentId: newActiveDocumentId,
                    tabStack: newTabStack
                };
            }
            break;

        case EditorActions.OPEN:
            var newTabStack = state.editors[selectedEditor].tabStack.filter(tabId => tabId !== action.payload.documentId);
            newTabStack.unshift(action.payload.documentId);

            if (!documentExists(action.payload.documentId, state.editors[selectedEditor].documents)) {
                state = {
                    ...state,
                    activeEditor: selectedEditor,
                    editors: {
                        ...state.editors,
                        [selectedEditor]: {
                            ...state.editors[selectedEditor],
                            activeDocumentId: action.payload.documentId,
                            documents: [
                                ...state.editors[selectedEditor].documents,
                                {
                                    documentId: action.payload.documentId,
                                    contentType: action.payload.contentType
                                }
                            ],
                            tabStack: newTabStack
                        }
                    }
                };
            } else {
                state = {
                    ...state,
                    activeEditor: selectedEditor,
                    editors: {
                        ...state.editors,
                        [selectedEditor]: {
                            ...state.editors[selectedEditor],
                            activeDocumentId: action.payload.documentId,
                            tabStack: newTabStack
                        }
                    }
                };
            }
            break;

        case EditorActions.SET_ACTIVE_TAB:
            var newTabStack = state.editors[selectedEditor].tabStack.filter(tabId => tabId !== action.payload.documentId);
            newTabStack.unshift(action.payload.documentId);

            state = {
                ...state,
                activeEditor: selectedEditor,
                editors: {
                    ...state.editors,
                    [selectedEditor]: {
                        ...state.editors[selectedEditor],
                        activeDocumentId: action.payload.documentId,
                        tabStack: newTabStack
                    }
                }
            };
            break;

        case EditorActions.SET_ACTIVE_EDITOR:
            state = {
                ...state,
                activeEditor: action.payload
            };
            break;

        case EditorActions.SPLIT_TAB:
            // remove tab from source editor
            let srcEditor = state.editors[action.payload.srcEditorKey];
            srcEditor.documents = srcEditor.documents.filter(doc => doc.documentId !== action.payload.documentId);
            srcEditor.tabStack = srcEditor.tabStack.filter(tabId => tabId !== action.payload.documentId);
            srcEditor.activeDocumentId = srcEditor.tabStack[0] || null;
            if (srcEditor.documents.length === 0) {
                srcEditor = null;
            }

            // check for destination editor or create it if non-existent
            const destEditorKey = action.payload.srcEditorKey === 'primary' ? 'secondary' : 'primary';
            let destEditor = state.editors[destEditorKey] || getNewEditor();
            destEditor.activeDocumentId = action.payload.documentId;
            destEditor.documents.push({
                documentId: action.payload.documentId,
                contentType: action.payload.contentType
            });
            destEditor.tabStack.unshift(action.payload.documentId);

            state = {
                ...state,
                activeEditor: destEditorKey,
                editors: {
                    [action.payload.srcEditorKey]: srcEditor,
                    [destEditorKey]: destEditor
                }
            };
            break;

        case EditorActions.SWAP_TABS:
            // swap tabs within the same editor
            if (action.payload.srcEditorKey === action.payload.destEditorKey) {
                let docs = [...state.editors[action.payload.srcEditorKey].documents];

                const srcTabIndex = docs.findIndex(doc => doc.documentId === action.payload.srcTabId);
                const destTabIndex = docs.findIndex(doc => doc.documentId === action.payload.destTabId);
                let destTab = docs[destTabIndex];

                docs[destTabIndex] = docs[srcTabIndex];
                docs[srcTabIndex] = destTab;

                state = {
                    ...state,
                    editors: {
                        ...state.editors,
                        [action.payload.srcEditorKey]: {
                            ...state.editors[action.payload.srcEditorKey],
                            documents: docs
                        }
                    }
                };
                break;
            }

            // swap tab into different editor
            var srcDocs = [...state.editors[action.payload.srcEditorKey].documents];
            var srcTabStack = [...state.editors[action.payload.srcEditorKey].tabStack];
            var destDocs = [...state.editors[action.payload.destEditorKey].documents];
            var destTabStack = [...state.editors[action.payload.destEditorKey].tabStack];

            const srcTabIndex = srcDocs.findIndex(doc => doc.documentId === action.payload.srcTabId);
            const destTabIndex = destDocs.findIndex(doc => doc.documentId === action.payload.destTabId);

            // remove tab from source editor, and insert into destination editor before the destination tab
            destDocs = [...destDocs.splice(0, destTabIndex), srcDocs[srcTabIndex], ...destDocs];
            destTabStack = [...destTabStack, action.payload.srcTabId];
            srcDocs = srcDocs.filter(doc => doc.documentId !== action.payload.srcTabId);
            srcTabStack = srcTabStack.filter(tabId => tabId !== action.payload.srcTabId);

            var srcEditor = srcDocs.length === 0 ? null : {
                ...state.editors[action.payload.srcEditorKey],
                documents: srcDocs,
                tabStack: srcTabStack
            };

            state = {
                ...state,
                activeEditor: !srcEditor ? action.payload.destEditorKey : state.activeEditor,
                editors: {
                    [action.payload.srcEditorKey]: srcEditor,
                    [action.payload.destEditorKey]: {
                        ...state.editors[action.payload.destEditorKey],
                        documents: destDocs,
                        tabStack: destTabStack
                    }
                }
            };

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
        documents: [],
        tabStack: []
    };
}
