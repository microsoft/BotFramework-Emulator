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

import { EventEmitter } from 'events';

import { ProgressInfo } from 'builder-util-runtime';
import { autoUpdater as electronUpdater, UpdateInfo } from 'electron-updater';

import { getSettings } from './settingsData/store';

export enum UpdateStatus {
  Idle,
  UpdateAvailable,
  UpdateDownloading,
  UpdateReadyToInstall,
}

class EmulatorUpdater extends EventEmitter {
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
    const settings = getSettings().framework;
    this.allowPrerelease = !!settings.usePrereleases;
    this.autoDownload = !!settings.autoUpdate;

    electronUpdater.allowDowngrade = true; // allow pre-release -> stable release
    electronUpdater.autoInstallOnAppQuit = true;
    electronUpdater.logger = null;

    electronUpdater.on('checking-for-update', () => {
      this.emit('checking-for-update');
    });
    electronUpdater.on('update-available', (updateInfo: UpdateInfo) => {
      if (!this.autoDownload) {
        this._status = UpdateStatus.Idle;
        this.emit('update-available', updateInfo);
      }
      // if this was initiated on startup, download in the background
      if (!this.userInitiated) {
        this.downloadUpdate(false);
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

  public async checkForUpdates(userInitiated: boolean): Promise<void> {
    const settings = getSettings().framework;
    this.allowPrerelease = !!settings.usePrereleases;
    this.autoDownload = !!settings.autoUpdate;
    this._userInitiated = userInitiated;

    electronUpdater.setFeedURL({
      repo: this.repo,
      owner: 'Microsoft',
      provider: 'github',
    });

    try {
      await electronUpdater.checkForUpdates();
    } catch (e) {
      throw new Error(
        `There was an error while checking for the latest update: ${e}`
      );
    }
  }

  public async downloadUpdate(installAfterDownload: boolean): Promise<void> {
    this._installAfterDownload = installAfterDownload;

    try {
      await electronUpdater.downloadUpdate();
    } catch (e) {
      throw new Error(
        `There was an error while trying to download the latest update: ${e}`
      );
    }
  }

  public quitAndInstall() {
    try {
      electronUpdater.quitAndInstall(false, true);
    } catch (e) {
      throw new Error(
        `There was an error while trying to quit and install the latest update: ${e}`
      );
    }
  }
}

export const AppUpdater = new EmulatorUpdater();
