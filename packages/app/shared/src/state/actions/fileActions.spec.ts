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

import { addFile, clear, removeFile, setRoot, FileActions } from './fileActions';

describe('file actions', () => {
  it('should create an addFile action', () => {
    const payload: any = {};
    const action = addFile(payload);

    expect(action.type).toBe(FileActions.add);
    expect(action.payload).toEqual(payload);
  });

  it('should create a clear action', () => {
    const action = clear();

    expect(action.type).toBe(FileActions.clear);
    expect(action.payload).toEqual({});
  });

  it('should create a removeFile action', () => {
    const path = 'some/path';
    const action = removeFile(path);

    expect(action.type).toBe(FileActions.remove);
    expect(action.payload).toEqual({ path });
  });

  it('should create a setRoot action', () => {
    const path = 'some/path';
    const action = setRoot(path);

    expect(action.type).toBe(FileActions.setRoot);
    expect(action.payload).toEqual({ path });
  });
});
