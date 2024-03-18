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
  beginAdd,
  closeDocument as closeChatDocument,
  close as closeEditorDocument,
  newNotification,
  openBotViaUrlAction,
  openTranscript,
  SharedConstants,
} from '@bfemulator/app-shared';
import { ChannelService, CommandServiceImpl, CommandServiceInstance } from '@bfemulator/sdk-shared';
import { IEndpointService } from 'botframework-config/lib/schema';
import { Command } from '@bfemulator/sdk-shared';
import { EmulatorMode } from '@bfemulator/sdk-shared';

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
  // NOTE: only called for livechats started from .bot file endpoints
  @Command(Emulator.NewLiveChat)
  protected newLiveChat(endpoint: IEndpointService, mode: EmulatorMode = 'livechat') {
    // extract information normally used to start a conversation via URL
    // and pass it through that flow
    store.dispatch(
      openBotViaUrlAction({
        appId: endpoint.appId,
        appPassword: endpoint.appPassword,
        tenantId: endpoint.tenantId,
        channelService: endpoint.channelService as ChannelService,
        endpoint: endpoint.endpoint,
        isFromBotFile: true,
        mode,
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
          name: 'Transcript Files (.chat, .transcript)',
          extensions: ['chat', 'transcript'],
        },
      ],
    };
    try {
      const { ShowOpenDialog } = SharedConstants.Commands.Electron;
      const filename: string = await this.commandService.remoteCall(ShowOpenDialog, dialogOptions);
      if (filename) {
        store.dispatch(openTranscript(filename));
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
  protected reloadTranscript(filePath: string, filename: string) {
    const tabGroup = getTabGroupForDocument(filePath);
    if (tabGroup) {
      store.dispatch(closeEditorDocument(getTabGroupForDocument(filePath), filePath));
      store.dispatch(closeChatDocument(filePath));
    }
    store.dispatch(openTranscript(filename));
  }
}
