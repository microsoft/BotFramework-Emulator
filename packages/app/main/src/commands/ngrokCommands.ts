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

import { open as openInEditor, SharedConstants } from '@bfemulator/app-shared';
import { Command } from '@bfemulator/sdk-shared';

import { store } from '../state/store';
import { Emulator } from '../emulator';
import { TelemetryService } from '../telemetry';

const Commands = SharedConstants.Commands.Ngrok;

/** Registers ngrok commands */
export class NgrokCommands {
  // Attempts to reconnect to a new ngrok tunnel
  @Command(Commands.Reconnect)
  protected async reconnectToNgrok(): Promise<any> {
    const emulator = Emulator.getInstance();
    try {
      await emulator.ngrok.recycle();
      emulator.ngrok.broadcastNgrokReconnected();
      TelemetryService.trackEvent('ngrok_reconnect');
    } catch (e) {
      throw new Error(`There was an error while trying to reconnect ngrok: ${e}`);
    }
  }

  @Command(Commands.KillProcess)
  protected killNgrokProcess() {
    Emulator.getInstance().ngrok.kill();
  }

  @Command(Commands.PingTunnel)
  protected pingForStatusOfTunnel() {
    Emulator.getInstance().ngrok.pingTunnel();
  }

  @Command(Commands.OpenStatusViewer)
  protected openStatusViewer(makeActiveByDefault: boolean = true) {
    store.dispatch(
      openInEditor({
        contentType: SharedConstants.ContentTypes.CONTENT_TYPE_NGROK_DEBUGGER,
        documentId: SharedConstants.DocumentIds.DOCUMENT_ID_NGROK_DEBUGGER,
        isGlobal: true,
        meta: {
          makeActiveByDefault,
        },
      })
    );
  }
}
