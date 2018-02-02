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

    switch (action.type) {
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
            let sourceEditor = state.editors[action.payload.sourceEditorKey];
            sourceEditor.documents = sourceEditor.documents.filter(doc => doc.documentId !== action.payload.documentId);
            sourceEditor.tabStack = sourceEditor.tabStack.filter(tabId => tabId !== action.payload.documentId);
            sourceEditor.activeDocumentId = sourceEditor.tabStack[0] || null;

            // check for destination editor or create it if non-existent
            const destinationEditorKey = action.payload.sourceEditorKey === 'primary' ? 'secondary' : 'primary';
            let destinationEditor = state.editors[destinationEditorKey] || getNewEditor();
            destinationEditor.activeDocumentId = action.payload.documentId;
            destinationEditor.documents.push({
                documentId: action.payload.documentId,
                contentType: action.payload.contentType
            });
            destinationEditor.tabStack.unshift(action.payload.documentId);

            state = {
                ...state,
                activeEditor: destinationEditorKey,
                editors: {
                    [action.payload.sourceEditorKey]: sourceEditor,
                    [destinationEditorKey]: destinationEditor
                }
            };
            break;

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
