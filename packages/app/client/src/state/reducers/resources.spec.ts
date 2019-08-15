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

import {
  transcriptsUpdated,
  transcriptDirectoryUpdated,
  chatFilesUpdated,
  chatsDirectoryUpdated,
  editResource,
} from '../actions/resourcesActions';

import { resources } from './resources';

describe('resources reducer', () => {
  it('should return the unmodified state on unrecognized action', () => {
    expect(resources(undefined, { type: '' } as any)).toEqual({
      transcripts: [],
      transcriptsPath: '',
      chats: [],
      chatsPath: '',
      resourceToRename: null,
    });
  });

  it('should handle a transcripts updated action', () => {
    const payload: any = [{ name: 'file.transcript' }];
    const action = transcriptsUpdated(payload);
    const state = resources({} as any, action);

    expect(state).toEqual({ transcripts: payload });
  });

  it('should handle a transcript directory updated action', () => {
    const action = transcriptDirectoryUpdated('/new/dir');
    const state = resources({} as any, action);

    expect(state).toEqual({ transcriptsPath: '/new/dir' });
  });

  it('should handle a chat files updated action', () => {
    const action = chatsDirectoryUpdated('/new/dir');
    const state = resources({} as any, action);

    expect(state).toEqual({ chatsPath: '/new/dir' });
  });

  it('should handle a chat directory updated action', () => {
    const payload: any = [{ name: 'file.chat' }];
    const action = chatFilesUpdated(payload);
    const state = resources({} as any, action);

    expect(state).toEqual({ chats: payload });
  });

  it('should handle an edit resource action', () => {
    const payload: any = { name: 'file.chat' };
    const action = editResource(payload);
    const state = resources({} as any, action);

    expect(state).toEqual({ resourceToRename: payload });
  });
});
