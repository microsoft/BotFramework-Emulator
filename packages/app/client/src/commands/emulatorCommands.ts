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
// import base64Url from 'base64url';
// import { createDirectLine } from 'botframework-webchat';
import { newNotification, SharedConstants } from '@bfemulator/app-shared';
import { CommandServiceImpl, CommandServiceInstance, isLocalHostUrl, uniqueId } from '@bfemulator/sdk-shared';
import { IEndpointService } from 'botframework-config/lib/schema';
import { Activity } from 'botframework-schema';
import { Command } from '@bfemulator/sdk-shared';
import { EmulatorMode } from '@bfemulator/sdk-shared';

import * as Constants from '../constants';
import * as ChatActions from '../state/actions/chatActions';
import * as EditorActions from '../state/actions/editorActions';
import { beginAdd } from '../state/actions/notificationActions';
import { getTabGroupForDocument } from '../state/helpers/editorHelpers';
import { store } from '../state/store';

const {
  Emulator,
  Telemetry: { TrackEvent },
} = SharedConstants.Commands;

export class EmulatorCommands {
  @CommandServiceInstance()
  private commandService: CommandServiceImpl;

  // ---------------------------------------------------------------------------
  // Open a new emulator tabbed document
  @Command(Emulator.NewLiveChat)
  protected newLiveChat(
    endpoint: IEndpointService,
    focusExistingChat: boolean = false,
    conversationId: string,
    mode: EmulatorMode = 'livechat'
  ) {
    const state = store.getState();
    let documentId: string;

    if (focusExistingChat && state.chat.chats) {
      const { chats } = state.chat;
      documentId = Object.keys(chats).find(docId => {
        const { [docId]: chat } = chats;
        // If we have a conversationId, the match must include it.
        return chat.endpointUrl === endpoint.endpoint && (!conversationId || chat.conversationId === conversationId);
      });
    }

    if (!documentId) {
      documentId = uniqueId();
      const { currentUserId } = state.clientAwareSettings.users;
      const customUserId = state.framework.userGUID;
      const action = ChatActions.newChat(documentId, mode, {
        botId: 'bot',
        endpointId: endpoint.id,
        endpointUrl: endpoint.endpoint,
        userId: customUserId || currentUserId,
        conversationId,
        // directLine: createDirectLine({
        //   secret: base64Url.encode(JSON.stringify({ conversationId, endpointId: endpoint.id })),
        //   domain: `${ state.clientAwareSettings.serverUrl }/v3/directline`,
        //   webSocket: false,
        // })
      });
      if (mode === 'debug') {
        action.payload.ui.horizontalSplitter[0].percentage = 75;
        action.payload.ui.verticalSplitter[0].percentage = 25;
      }
      store.dispatch(action);
    }

    if (!isLocalHostUrl(endpoint.endpoint)) {
      this.commandService.remoteCall(TrackEvent, 'livechat_openRemote').catch(_e => void 0);
    }

    store.dispatch(
      EditorActions.open({
        contentType: mode === 'debug' ? Constants.CONTENT_TYPE_DEBUG : Constants.CONTENT_TYPE_LIVE_CHAT,
        documentId,
        isGlobal: false,
      })
    );
    return documentId;
  }

  // ---------------------------------------------------------------------------
  // Open the transcript file in a tabbed document
  @Command(Emulator.OpenTranscript)
  protected openTranscript(filePath: string, fileName: string, additionalData?: object) {
    const tabGroup = getTabGroupForDocument(filePath);
    const { currentUserId } = store.getState().clientAwareSettings.users;
    if (!tabGroup) {
      store.dispatch(
        ChatActions.newChat(filePath, 'transcript', {
          ...additionalData,
          botId: 'bot',
          userId: currentUserId,
        })
      );
    }

    store.dispatch(
      EditorActions.open({
        contentType: Constants.CONTENT_TYPE_TRANSCRIPT,
        documentId: filePath,
        fileName,
        filePath,
        isGlobal: false,
      })
    );
  }

  // ---------------------------------------------------------------------------
  // Prompt to open a transcript file, then open it
  @Command(Emulator.PromptToOpenTranscript)
  protected async promptToOpenTranscript() {
    const dialogOptions = {
      title: 'Open transcript file',
      buttonLabel: 'Choose file',
      properties: ['openFile'],
      filters: [
        {
          name: 'Transcript Files',
          extensions: ['transcript'],
        },
      ],
    };
    try {
      const { ShowOpenDialog } = SharedConstants.Commands.Electron;
      const filename = await this.commandService.remoteCall(ShowOpenDialog, dialogOptions);
      if (filename) {
        await this.commandService.call(Emulator.OpenTranscript, filename);
        this.commandService
          .remoteCall(TrackEvent, 'transcriptFile_open', {
            method: 'file_menu',
          })
          .catch(_e => void 0);
      }
    } catch (e) {
      const errMsg = `Error while opening transcript file: ${e}`;
      const notification = newNotification(errMsg);
      store.dispatch(beginAdd(notification));
    }
  }

  // ---------------------------------------------------------------------------
  // Same as open transcript, except that it closes the transcript first, before reopening it
  @Command(Emulator.ReloadTranscript)
  protected reloadTranscript(filePath: string, fileName: string, additionalData?: object) {
    const tabGroup = getTabGroupForDocument(filePath);
    const { currentUserId } = store.getState().clientAwareSettings.users;
    if (tabGroup) {
      store.dispatch(EditorActions.close(getTabGroupForDocument(filePath), filePath));
      store.dispatch(ChatActions.closeDocument(filePath));
    }
    store.dispatch(
      ChatActions.newChat(filePath, 'transcript', {
        ...additionalData,
        botId: 'bot',
        userId: currentUserId,
      })
    );
    store.dispatch(
      EditorActions.open({
        contentType: Constants.CONTENT_TYPE_TRANSCRIPT,
        documentId: filePath,
        filePath,
        fileName,
        isGlobal: false,
      })
    );
  }

  // ---------------------------------------------------------------------------
  // Open the chat file in a tabbed document as a transcript
  @Command(Emulator.OpenChatFile)
  protected async openChatFile(filePath: string, reload?: boolean) {
    try {
      // wait for the main side to use the chatdown library to parse the activities (transcript) out of the .chat file
      const {
        activities,
        fileName,
      }: {
        activities: Activity[];
        fileName: string;
      } = await this.commandService.remoteCall<any>(Emulator.OpenChatFile, filePath);

      // open or reload the transcript
      if (reload) {
        await this.commandService.call(Emulator.ReloadTranscript, filePath, fileName, { activities, inMemory: true });
      } else {
        await this.commandService.call(Emulator.OpenTranscript, filePath, fileName, { activities, inMemory: true });
      }
    } catch (err) {
      throw new Error(`Error while retrieving activities from main side: ${err}`);
    }
  }
}
