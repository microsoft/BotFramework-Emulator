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
import { IFileService } from 'botframework-config/lib/schema';
import { Action } from 'redux';

import { ReactComponentClass } from '../../types';

export const TRANSCRIPTS_UPDATED = 'TRANSCRIPTS_UPDATED';
export const TRANSCRIPTS_DIRECTORY_UPDATED = 'TRANSCRIPTS_DIRECTORY_UPDATED';
export const CHAT_FILES_UPDATED = 'CHAT_FILES_UPDATED';
export const CHATS_DIRECTORY_UPDATED = 'CHATS_DIRECTORY_UPDATED';
export const OPEN_CONTEXT_MENU_FOR_RESOURCE = 'OPEN_CONTEXT_MENU_FOR_RESOURCE';
export const EDIT_RESOURCE = 'EDIT_RESOURCE';
export const RENAME_RESOURCE = 'RENAME_RESOURCE';
export const OPEN_RESOURCE = 'OPEN_RESOURCE';
export const OPEN_RESOURCE_SETTINGS = 'OPEN_RESOURCE_SETTINGS';

export interface ResourcesAction<T> extends Action {
  payload: T;
}

export function transcriptsUpdated(payload: IFileService[]): ResourcesAction<IFileService[]> {
  return {
    type: TRANSCRIPTS_UPDATED,
    payload,
  };
}

export function transcriptDirectoryUpdated(payload: string): ResourcesAction<string> {
  return {
    type: TRANSCRIPTS_DIRECTORY_UPDATED,
    payload,
  };
}

export function chatsDirectoryUpdated(payload: string): ResourcesAction<string> {
  return {
    type: CHATS_DIRECTORY_UPDATED,
    payload,
  };
}

export function chatFilesUpdated(payload: IFileService[]): ResourcesAction<IFileService[]> {
  return {
    type: CHAT_FILES_UPDATED,
    payload,
  };
}

export function openContextMenuForResource(payload: IFileService): ResourcesAction<IFileService> {
  return {
    type: OPEN_CONTEXT_MENU_FOR_RESOURCE,
    payload,
  };
}

export function editResource(payload: IFileService): ResourcesAction<IFileService> {
  return {
    type: EDIT_RESOURCE,
    payload,
  };
}

export function renameResource(payload: IFileService): ResourcesAction<IFileService> {
  return {
    type: RENAME_RESOURCE,
    payload,
  };
}

export function openResource(payload: IFileService): ResourcesAction<IFileService> {
  return {
    type: OPEN_RESOURCE,
    payload,
  };
}

declare interface ResourceSettingsPayload {
  dialog: ReactComponentClass<any>;
}

export function openResourcesSettings(payload: ResourceSettingsPayload): ResourcesAction<ResourceSettingsPayload> {
  return {
    type: OPEN_RESOURCE_SETTINGS,
    payload,
  };
}
