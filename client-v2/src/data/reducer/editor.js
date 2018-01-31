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
    activeDocumentId: 'emulator:1',
    documents: [{
        contentType: constants.ContentType_Emulator,
        documentId: 'emulator:1'
    }, {
        contentType: constants.ContentType_TestBed,
        documentId: 'testbed:1'
    }],
    tabStack: ['emulator:1', 'testbed:1']
};

export default function documents(state = DEFAULT_STATE, action) {
    switch (action.type) {
        case EditorActions.CLOSE:
            // TODO: Add logic to check if document has been saved
            // & prompt user to save document if necessary
            var newTabStack = state.tabStack.filter(tabId => tabId !== action.payload);
            let newDocumentList = state.documents.filter(doc => doc.documentId !== action.payload);
            let newActiveDocumentId = newTabStack[0] || null;

            state = {
                ...state,
                documents: newDocumentList,
                activeDocumentId: newActiveDocumentId,
                tabStack: newTabStack
            };
            break;

        case EditorActions.OPEN:
            var newTabStack = state.tabStack.filter(tabId => tabId !== action.payload.documentId);
            newTabStack.unshift(action.payload.documentId);

            if (!documentExists(action.payload.documentId, state.documents)) {
                state = {
                    ...state,
                    activeDocumentId: action.payload.documentId,
                    documents: [
                        ...state.documents,
                        action.payload
                    ],
                    tabStack: newTabStack
                };
            } else {
                state = {
                    ...state,
                    activeDocumentId: action.payload.documentId,
                    tabStack: newTabStack
                };
            }
            break;

        case EditorActions.SET_ACTIVE:
            var newTabStack = state.tabStack.filter(tabId => tabId !== action.payload);
            newTabStack.unshift(action.payload);

            state = {
                ...state,
                activeDocumentId: action.payload,
                tabStack: newTabStack
            };
            break;

        default: break;
    }

    return state;
}

function documentExists(id, documents = []) {
    return documents.some(doc => doc.documentId === id);
}
