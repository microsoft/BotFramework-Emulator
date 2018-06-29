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

import store from '../data/store';
import * as ChatActions from '../data/action/chatActions';
import * as EditorActions from '../data/action/editorActions';
import * as Constants from '../constants';
import { IEndpointService } from 'msbot/bin/schema';
import { uniqueId, CommandRegistryImpl } from '@bfemulator/sdk-shared';
import { CommandServiceImpl } from '../platform/commands/commandServiceImpl';
import { getTabGroupForDocument } from '../data/editorHelpers';
import { SharedConstants } from '@bfemulator/app-shared';

/** Registers emulator (actual conversation emulation logic) commands */
export function registerCommands(commandRegistry: CommandRegistryImpl) {
  // ---------------------------------------------------------------------------
  // Adds a transcript
  commandRegistry.registerCommand('transcript:add', (filename: string): void => {
    store.dispatch(ChatActions.addTranscript(filename));
  });

  // ---------------------------------------------------------------------------
  // Removes a transcript
  commandRegistry.registerCommand('transcript:remove', (filename: string): void => {
    store.dispatch(ChatActions.removeTranscript(filename));
  });

  // ---------------------------------------------------------------------------
  // Open a new emulator tabbed document
  commandRegistry.registerCommand('livechat:new', (endpoint: IEndpointService) => {
    const documentId = uniqueId();

    store.dispatch(ChatActions.newDocument(
      documentId,
      'livechat',
      {
        botId: 'bot',
        endpointId: endpoint.id,
        userId: 'default-user'
      }
    ));

    store.dispatch(EditorActions.open(
      Constants.CONTENT_TYPE_LIVE_CHAT,
      documentId,
      false
    ));
  });

  // ---------------------------------------------------------------------------
  // Open the transcript file in a tabbed document
  commandRegistry.registerCommand('transcript:open', (filename: string, additionalData?: object) => {
    const tabGroup = getTabGroupForDocument(filename);
    if (!tabGroup) {
      store.dispatch(ChatActions.newDocument(
        filename,
        'transcript',
        {
          ...additionalData,
          botId: 'bot',
          userId: 'default-user'
        }
      ));
    }
    store.dispatch(EditorActions.open(
      Constants.CONTENT_TYPE_TRANSCRIPT,
      filename,
      false
    ));
  });

  // ---------------------------------------------------------------------------
  // Prompt to open a transcript file, then open it
  commandRegistry.registerCommand('transcript:prompt-open', () => {
    const dialogOptions = {
      title: 'Open transcript file',
      buttonLabel: 'Choose file',
      properties: ['openFile'],
      filters: [
        {
          name: 'Transcript Files',
          extensions: ['transcript']
        }
      ],
    };
    CommandServiceImpl.remoteCall(SharedConstants.Commands.Electron.ShowOpenDialog, dialogOptions)
      .then(filename => {
        if (filename && filename.length) {
          CommandServiceImpl.call('transcript:open', filename);
        }
      })
      .catch(err => console.error(err));
  });
}
