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

import { newNotification, SharedConstants } from '@bfemulator/app-shared';
import { CommandRegistryImpl, uniqueId } from '@bfemulator/sdk-shared';
import { IEndpointService } from 'botframework-config/lib/schema';
import * as Constants from '../constants';
import * as ChatActions from '../data/action/chatActions';
import * as EditorActions from '../data/action/editorActions';
import { beginAdd } from '../data/action/notificationActions';
import { getTabGroupForDocument } from '../data/editorHelpers';
import { store } from '../data/store';
import { CommandServiceImpl } from '../platform/commands/commandServiceImpl';

/** Registers emulator (actual conversation emulation logic) commands */
export function registerCommands(commandRegistry: CommandRegistryImpl) {
  const { Emulator } = SharedConstants.Commands;

  // ---------------------------------------------------------------------------
  // Open a new emulator tabbed document
  commandRegistry.registerCommand(Emulator.NewLiveChat,
    (endpoint: IEndpointService, focusExistingChat: boolean = false) => {
      const state = store.getState();
      let documentId: string;

      if (focusExistingChat && state.chat.chats) {
        const { chats } = state.chat;
        documentId = Object.keys(chats)
          .find((docId) => chats[docId].endpointUrl === endpoint.endpoint);
      }

      if (!documentId) {
        documentId = uniqueId();
        const { currentUserId } = state.clientAwareSettings.users;
        store.dispatch(ChatActions.newDocument(
          documentId,
          'livechat',
          {
            botId: 'bot',
            endpointId: endpoint.id,
            endpointUrl: endpoint.endpoint,
            userId: currentUserId
          }
        ));
      }

      store.dispatch(EditorActions.open(Constants.CONTENT_TYPE_LIVE_CHAT, documentId, false));
      return documentId;
    });

  // ---------------------------------------------------------------------------
  // Open the transcript file in a tabbed document
  commandRegistry.registerCommand(Emulator.OpenTranscript, (filename: string, additionalData?: object) => {
    const tabGroup = getTabGroupForDocument(filename);
    const { currentUserId } = store.getState().clientAwareSettings.users;
    if (!tabGroup) {
      store.dispatch(ChatActions.newDocument(
        filename,
        'transcript',
        {
          ...additionalData,
          botId: 'bot',
          userId: currentUserId
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
  commandRegistry.registerCommand(Emulator.PromptToOpenTranscript, async () => {
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
    try {
      const { ShowOpenDialog } = SharedConstants.Commands.Electron;
      const filename = await CommandServiceImpl.remoteCall(ShowOpenDialog, dialogOptions);
      await CommandServiceImpl.call(Emulator.OpenTranscript, filename);
    } catch (e) {
      const errMsg = `Error while opening transcript file: ${e}`;
      const notification = newNotification(errMsg);
      store.dispatch(beginAdd(notification));
    }
  });

  // ---------------------------------------------------------------------------
  // Same as open transcript, except that it closes the transcript first, before reopening it
  commandRegistry.registerCommand(Emulator.ReloadTranscript, (filename: string, additionalData?: object) => {
    const tabGroup = getTabGroupForDocument(filename);
    const { currentUserId } = store.getState().clientAwareSettings.users;
    if (tabGroup) {
      store.dispatch(EditorActions.close(getTabGroupForDocument(filename), filename));
      store.dispatch(ChatActions.closeDocument(filename));
    }
    store.dispatch(ChatActions.newDocument(
      filename,
      'transcript',
      {
        ...additionalData,
        botId: 'bot',
        userId: currentUserId
      }
    ));
    store.dispatch(EditorActions.open(
      Constants.CONTENT_TYPE_TRANSCRIPT,
      filename,
      false
    ));
  });

  // ---------------------------------------------------------------------------
  // Open the chat file in a tabbed document as a transcript
  commandRegistry.registerCommand(Emulator.OpenChatFile, async (filename: string, reload?: boolean) => {
    try {
      // wait for the main side to use the chatdown library to parse the activities (transcript) out of the .chat file
      const { activities }: { activities: any[] }
        = await CommandServiceImpl.remoteCall(Emulator.OpenChatFile, filename);

      // open or reload the transcript
      if (reload) {
        CommandServiceImpl.call(Emulator.ReloadTranscript, filename,
          { activities, inMemory: true, fileName: filename });
      } else {
        CommandServiceImpl.call(Emulator.OpenTranscript, filename,
          { activities, inMemory: true, fileName: filename });
      }
    } catch (err) {
      throw new Error(`Error while retrieving activities from main side: ${err}`);
    }
  });
}
