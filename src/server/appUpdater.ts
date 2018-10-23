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

import { autoUpdater, UpdateInfo } from 'electron-updater';
import { EventEmitter } from 'events';
import { ProgressInfo } from 'builder-util-runtime';

export const AppUpdater = new class extends EventEmitter {
  public startup(): void {
    // hook up to GH
    autoUpdater.setFeedURL({
      repo: 'BotFramework-Emulator',
      owner: 'Microsoft',
      provider: 'github'
    });

    // we only want to grab v4 if it is a release
    autoUpdater.allowPrerelease = true;
    // prompt user explicitly to download
    autoUpdater.autoDownload = false;
    // mute built-in logger
    autoUpdater.logger = null;

    autoUpdater.on('checking-for-update', () => {
      this.emit('checking-for-update');
    });

    autoUpdater.on('update-available', (updateInfo: UpdateInfo) => {
      this.emit('update-available', updateInfo);
    });

    autoUpdater.on('update-not-available', () => {
      this.emit('update-not-available');
    })

    autoUpdater.on('error', (err: Error, message: string) => {
      this.emit('error', err, message);
    });

    autoUpdater.on('download-progress', (progress: ProgressInfo) => {
      this.emit('download-progress', progress);
    });

    autoUpdater.on('update-downloaded', (updateInfo: UpdateInfo) => {
      this.emit('update-downloaded', updateInfo);
    });

    this.checkForUpdate();
  }

  /** Downloads the available update */
  public downloadUpdate(): void {
    this.emit('downloading-update');

    autoUpdater.downloadUpdate()
      .catch(err => console.error('Something went wrong while invoking "downloadUpdate()": ', err));
  }

  /** Installs the available update */
  public installUpdate(openAfterInstall: boolean): void {
    autoUpdater.quitAndInstall(true, openAfterInstall);
  }

  /** Checks the GH repo for available update */
  private checkForUpdate(): void {
    autoUpdater.checkForUpdates()
      .catch(err => console.error('Something went wrong while invoking "checkForUpdates()": ', err));
  }
}
