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

import {
  CHAT_FILES_UPDATED,
  CHATS_DIRECTORY_UPDATED,
  EDIT_RESOURCE,
  ResourcesAction,
  TRANSCRIPTS_DIRECTORY_UPDATED,
  TRANSCRIPTS_UPDATED,
} from '../actions/resourcesActions';

export interface ResourcesState {
  transcripts: IFileService[];
  transcriptsPath: string;
  chats: IFileService[];
  chatsPath: string;
  resourceToRename: IFileService;
}

const initialState: ResourcesState = {
  transcripts: [],
  transcriptsPath: '',
  chats: [],
  chatsPath: '',
  resourceToRename: null,
};

declare type ResourceActionType = ResourcesAction<IFileService | IFileService[] | string>;

export function resources(state: ResourcesState = initialState, action: ResourceActionType): ResourcesState {
  switch (action.type) {
    case TRANSCRIPTS_UPDATED:
      return { ...state, transcripts: action.payload as IFileService[] };

    case TRANSCRIPTS_DIRECTORY_UPDATED:
      return { ...state, transcriptsPath: action.payload as string };

    case CHAT_FILES_UPDATED:
      return { ...state, chats: action.payload as IFileService[] };

    case CHATS_DIRECTORY_UPDATED:
      return { ...state, chatsPath: action.payload as string };

    case EDIT_RESOURCE:
      return { ...state, resourceToRename: action.payload as IFileService };

    default:
      return state;
  }
}
