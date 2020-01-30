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
  TRANSCRIPTS_UPDATED,
  TRANSCRIPTS_DIRECTORY_UPDATED,
  CHAT_FILES_UPDATED,
  CHATS_DIRECTORY_UPDATED,
  OPEN_CONTEXT_MENU_FOR_RESOURCE,
  EDIT_RESOURCE,
  RENAME_RESOURCE,
  OPEN_RESOURCE,
  OPEN_RESOURCE_SETTINGS,
  transcriptsUpdated,
  transcriptDirectoryUpdated,
  chatsDirectoryUpdated,
  chatFilesUpdated,
  openContextMenuForResource,
  editResource,
  renameResource,
  openResource,
  openResourcesSettings,
} from './resourcesActions';

describe('resources actions', () => {
  it('should create a transcriptsUpdated action', () => {
    const payload = [{ name: 'blah.transcript', path: 'some/path/blah.transcript' }];
    const action = transcriptsUpdated(payload);

    expect(action.type).toBe(TRANSCRIPTS_UPDATED);
    expect(action.payload).toEqual(payload);
  });

  it('should create a transcriptDirectoryUpdated action', () => {
    const dir = '/some/dir';
    const action = transcriptDirectoryUpdated(dir);

    expect(action.type).toBe(TRANSCRIPTS_DIRECTORY_UPDATED);
    expect(action.payload).toBe(dir);
  });

  it('should a chatsDirectoryUpdated action', () => {
    const dir = '/some/dir';
    const action = chatsDirectoryUpdated(dir);

    expect(action.type).toBe(CHATS_DIRECTORY_UPDATED);
    expect(action.payload).toBe(dir);
  });

  it('should create a chatFilesUpdated action', () => {
    const payload = [{ name: 'blah.chat', path: 'some/path/blah.chat' }];
    const action = chatFilesUpdated(payload);

    expect(action.type).toBe(CHAT_FILES_UPDATED);
    expect(action.payload).toBe(payload);
  });

  it('should create an openContextMenuForResource action', () => {
    const payload = { name: 'blah.chat', path: 'some/path/blah.chat' };
    const action = openContextMenuForResource(payload);

    expect(action.type).toBe(OPEN_CONTEXT_MENU_FOR_RESOURCE);
    expect(action.payload).toBe(payload);
  });

  it('should create an editResource action', () => {
    const payload = { name: 'blah.chat', path: 'some/path/blah.chat' };
    const action = editResource(payload);

    expect(action.type).toBe(EDIT_RESOURCE);
    expect(action.payload).toEqual(payload);
  });

  it('should create a renameResource action', () => {
    const payload = { name: 'blah.chat', path: 'some/path/blah.chat' };
    const action = renameResource(payload);

    expect(action.type).toBe(RENAME_RESOURCE);
    expect(action.payload).toEqual(payload);
  });

  it('should create an openResource action', () => {
    const payload = { name: 'blah.chat', path: 'some/path/blah.chat' };
    const action = openResource(payload);

    expect(action.type).toBe(OPEN_RESOURCE);
    expect(action.payload).toEqual(payload);
  });

  it('should create an openResourcesSettings action', () => {
    const payload: any = {};
    const action = openResourcesSettings(payload);

    expect(action.type).toBe(OPEN_RESOURCE_SETTINGS);
    expect(action.payload).toEqual(payload);
  });
});
