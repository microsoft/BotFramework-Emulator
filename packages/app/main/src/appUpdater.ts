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

import { autoUpdater as electronUpdater, UpdateInfo } from 'electron-updater';
import * as process from 'process';
import { EventEmitter } from 'events';
import { ProgressInfo } from 'builder-util-runtime';
import { sendNotificationToClient } from './utils/sendNotificationToClient';
import { newNotification, FrameworkSettings } from '@bfemulator/app-shared';
import { mainWindow } from './main';
import { getSettings } from './settingsData/store';

const pjson = require('../package.json');

export enum UpdateStatus {
  Idle,
  UpdateAvailable,
  UpdateDownloading,
  UpdateReadyToInstall
}

export const AppUpdater = new class extends EventEmitter {
  private _userInitiated: boolean;
  private _autoDownload: boolean;
  private _status: UpdateStatus = UpdateStatus.Idle;
  private _allowPrerelease: boolean;
  private _updateDownloaded: boolean;
  private _downloadProgress: number;
  private _installAfterDownload: boolean;

  public get userInitiated(): boolean {
    return this._userInitiated;
  }

  public get status(): UpdateStatus {
    return this._status;
  }

  public get downloadProgress(): number {
    return this._downloadProgress;
  }

  public get updateDownloaded(): boolean {
    return this._updateDownloaded;
  }

  public get autoDownload(): boolean {
    return this._autoDownload;
  }

  public set autoDownload(value: boolean) {
    electronUpdater.autoDownload = value;
    this._autoDownload = value;
  }

  public get allowPrerelease(): boolean {
    return this._allowPrerelease;
  }

  public set allowPrerelease(value: boolean) {
    electronUpdater.allowPrerelease = value;
    this._allowPrerelease = value;
  }

  public get repo(): string {
    if (this.allowPrerelease) {
      return 'BotFramework-Emulator-Nightlies';
    }
    return 'BotFramework-Emulator';
  }

  public startup() {
    const settings: FrameworkSettings = getSettings().framework;
    this.allowPrerelease = settings.usePrereleases || false;
    this.autoDownload = settings.autoUpdate || false;

    electronUpdater.autoInstallOnAppQuit = true;
    electronUpdater.allowDowngrade = false;
    electronUpdater.logger = null;
    
    electronUpdater.setFeedURL({
      repo: this.repo,
      owner: 'Microsoft',
      provider: 'github'
    });

    if (process.env.NODE_ENV === 'development') {
      (electronUpdater as any).currentVersion = (pjson || {}).version;
    }

    electronUpdater.on('checking-for-update', () => {
      this.emit('checking-for-update');
    });
    electronUpdater.on('update-available', (updateInfo: UpdateInfo) => {
      if (!this._autoDownload) {
        this._status = UpdateStatus.Idle;
        this.emit('update-available', updateInfo);
      }
    });
    electronUpdater.on('update-not-available', (updateInfo: UpdateInfo) => {
      this._status = UpdateStatus.Idle;
      this.emit('up-to-date');
    });
    electronUpdater.on('error', (err: Error, message: string) => {
      this._status = UpdateStatus.Idle;
      this.emit('error', err, message);
    });
    electronUpdater.on('download-progress', (progress: ProgressInfo) => {
      this._status = UpdateStatus.UpdateDownloading;
      this._downloadProgress = progress.percent;
      this.emit('download-progress', progress);
    });
    electronUpdater.on('update-downloaded', (updateInfo: UpdateInfo) => {
      if (this._installAfterDownload) {
        this.quitAndInstall();
        return;
      } else {
        this._status = UpdateStatus.UpdateReadyToInstall;
        this._updateDownloaded = true;
        this.emit('update-downloaded', updateInfo);
      }
    });

    if (this.autoDownload) {
      this.checkForUpdates(false);
    }
  }

  public checkForUpdates(userInitiated: boolean) {
    const settings: FrameworkSettings = getSettings().framework;
    this.allowPrerelease = settings.usePrereleases || false;
    this.autoDownload = settings.autoUpdate || false;
    this._userInitiated = userInitiated;

    electronUpdater.setFeedURL({
      repo: this.repo,
      owner: 'Microsoft',
      provider: 'github'
    });

    try {
      electronUpdater.checkForUpdates().catch(err => { throw err; });
    } catch (e) {
      console.error(e);
    }
  }

  public async downloadUpdate(installAfterDownload: boolean): Promise<void> {
    this._installAfterDownload = installAfterDownload;

    try {
      await electronUpdater.downloadUpdate();
    } catch (e) {
      const errMsg = `There was an error while trying to download the latest update: ${e}`;
      const notification = newNotification(errMsg);
      sendNotificationToClient(notification);
    }
  }

  public quitAndInstall() {
    try {
      electronUpdater.quitAndInstall(false, true);
    } catch (e) {
      console.error(e);
    }
  }
};
