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

import * as URL from 'url';

import { SharedConstants } from '@bfemulator/app-shared';
import { CommandServiceImpl, CommandServiceInstance, uniqueId } from '@bfemulator/sdk-shared';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Electron = (window as any).require('electron');
const { shell } = Electron;

export class HyperlinkHandler {
  @CommandServiceInstance()
  private static commandService: CommandServiceImpl;

  public static navigate(url = '') {
    const { TrackEvent } = SharedConstants.Commands.Telemetry;
    try {
      const parsed = URL.parse(url) || { protocol: '' };
      if ((parsed.protocol || '').startsWith(SharedConstants.EmulatedOAuthUrlProtocol)) {
        this.navigateEmulatedOAuthUrl(url.substring(8));
      } else if (parsed.protocol.startsWith(SharedConstants.OAuthUrlProtocol)) {
        this.navigateOAuthUrl(url.substring(12));
      } else {
        this.commandService.remoteCall(TrackEvent, 'app_openLink', { url }).catch(_e => void 0);
        // manually create and click a download link for data url's
        if (url.startsWith('data:')) {
          const a = document.createElement('a');
          a.href = url;
          a.download = '';
          a.click();
        } else {
          shell.openExternal(url, { activate: true });
        }
      }
    } catch (e) {
      this.commandService.remoteCall(TrackEvent, 'app_openLink', { url }).catch(_e => void 0);
      shell.openExternal(url, { activate: true });
    }
  }

  private static navigateEmulatedOAuthUrl(oauthParam: string) {
    const { Commands } = SharedConstants;
    const parts = oauthParam.split('&&&');
    this.commandService
      .remoteCall(Commands.OAuth.SendTokenResponse, parts[0], parts[1], 'emulatedToken_' + uniqueId())
      .catch();
  }

  private static navigateOAuthUrl(oauthParam: string) {
    const { Commands } = SharedConstants;
    const parts = oauthParam.split('&&&');
    this.commandService.remoteCall(Commands.OAuth.CreateOAuthWindow, parts[0], parts[1]).catch();
  }
}
