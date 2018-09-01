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
import { IEndpointService } from 'botframework-config/lib/schema';
import { uniqueId, CommandRegistryImpl } from '@bfemulator/sdk-shared';
import { CommandServiceImpl } from '../platform/commands/commandServiceImpl';
import { getTabGroupForDocument } from '../data/editorHelpers';
import { SharedConstants, newNotification } from '@bfemulator/app-shared';
import { beginAdd } from '../data/action/notificationActions';

/** Registers emulator (actual conversation emulation logic) commands */
export function registerCommands(commandRegistry: CommandRegistryImpl) {
  const Commands = SharedConstants.Commands;

  // ---------------------------------------------------------------------------
  // Open a new emulator tabbed document
  commandRegistry.registerCommand(Commands.Emulator.NewLiveChat, (endpoint: IEndpointService) => {
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
  commandRegistry.registerCommand(Commands.Emulator.OpenTranscript, (filename: string, additionalData?: object) => {
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
  commandRegistry.registerCommand(Commands.Emulator.PromptToOpenTranscript, () => {
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
    CommandServiceImpl.remoteCall(Commands.Electron.ShowOpenDialog, dialogOptions)
      .then(filename => {
        if (filename && filename.length) {
          CommandServiceImpl.call(Commands.Emulator.OpenTranscript, filename);
        }
      })
      .catch(err => {
        const errMsg = `Error while opening transcript file: ${err}`;
        const notification = newNotification(errMsg);
        store.dispatch(beginAdd(notification));
      });
  });

  // ---------------------------------------------------------------------------
  // Same as open transcript, except that it closes the transcript first, before reopening it
  commandRegistry.registerCommand(Commands.Emulator.ReloadTranscript, (filename: string, additionalData?: object) => {
    const tabGroup = getTabGroupForDocument(filename);
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
        userId: 'default-user'
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
  commandRegistry.registerCommand(Commands.Emulator.OpenChatFile, async (filename: string, reload?: boolean) => {
    try {
      // wait for the main side to use the chatdown library to parse the activities (transcript) out of the .chat file
      const { activities }: { activities: any[] }
        = await CommandServiceImpl.remoteCall(Commands.Emulator.OpenChatFile, filename);

      // open or reload the transcript
      if (reload) {
        CommandServiceImpl.call(Commands.Emulator.ReloadTranscript, filename,
          { activities, inMemory: true, fileName: filename });
      } else {
        CommandServiceImpl.call(Commands.Emulator.OpenTranscript, filename,
          { activities, inMemory: true, fileName: filename });
      }
    } catch (err) {
      throw new Error(`Error while retrieving activities from main side: ${err}`);
    }
  });
}
