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

import { SharedConstants } from '@bfemulator/app-shared';
import { open } from '@bfemulator/app-shared/built/state/actions/editorActions';

import { getTabGroupForDocument, hasNonGlobalTabs, showWelcomePage } from './editorHelpers';

let mockState;
const mockDispatch = jest.fn(() => null);
const mockGetState = jest.fn(() => mockState);
const mockStore = {
  getState: mockGetState,
  dispatch: mockDispatch,
};
jest.mock('../store', () => ({
  get store() {
    return mockStore;
  },
}));

describe('editorHelpers', () => {
  beforeEach(() => {
    mockState = {};
    mockGetState.mockClear();
    mockDispatch.mockClear();
  });

  test('hasNonGlobalTabs', () => {
    mockState = {
      editor: {
        editors: {
          primary: {
            documents: {
              doc1: {},
              doc2: {
                isGlobal: true,
              },
            },
          },
          secondary: {
            documents: {},
          },
        },
      },
    };

    let result = !!hasNonGlobalTabs();
    expect(result).toBe(true);

    result = !!hasNonGlobalTabs(mockState.editor.editors);
    expect(result).toBe(true);
  });

  test('getTabGroupForDocument', () => {
    mockState = {
      editor: {
        editors: {
          primary: {
            documents: {
              doc1: {},
              doc2: {
                isGlobal: true,
              },
            },
          },
          secondary: {
            documents: {},
          },
        },
      },
    };

    let result = getTabGroupForDocument('doc1');
    expect(result).toBe('primary');

    result = getTabGroupForDocument('doc3', mockState.editor.editors);
    expect(result).toBe(undefined);
  });

  test('showWelcomePage', () => {
    showWelcomePage();

    expect(mockDispatch).toHaveBeenCalledWith(
      open({
        contentType: SharedConstants.ContentTypes.CONTENT_TYPE_WELCOME_PAGE,
        documentId: SharedConstants.DocumentIds.DOCUMENT_ID_WELCOME_PAGE,
        isGlobal: true,
      })
    );
  });
});
