import { autoUpdater as electronUpdater, UpdateCheckResult, UpdateInfo } from "electron-updater";
import * as path from "path";
import * as process from "process";
import { mainWindow } from './main';
var pjson = require('../../package.json');
import * as semver from 'semver';
import { EventEmitter } from 'events';
import { ProgressInfo } from 'builder-util-runtime';

export enum UpdateStatus {
  Idle,
  CheckingForUpdate,
  UpdateAvailable,
  UpdateDownloading,
  UpdateReadyToInstall,
}

export const AppUpdater = new class extends EventEmitter {
  private _userInitiated: boolean;
  private _autoDownload: boolean;
  private _status: UpdateStatus = UpdateStatus.Idle;
  private _allowPrerelease: boolean;

  public get userInitiated() { return this._userInitiated; }

  public get status(): UpdateStatus { return this._status; }

  startup() {
    let allowUpdateCheck = (process.argv.indexOf("--no-update") == -1);
    this._allowPrerelease = (process.argv.indexOf('--prerelease') >= 0);

    // Allow update to prerelease if this is a prerelease
    const rc = semver.prerelease(pjson.version);
    if (rc && rc.length) {
      this._allowPrerelease = true;
    }

    electronUpdater.logger = null;
    
    electronUpdater.setFeedURL({
      repo: "BotFramework-Emulator",
      owner: "Microsoft",
      provider: "github"
    });
    
    electronUpdater.on('checking-for-update', () => {
      this._status = UpdateStatus.CheckingForUpdate;
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
      this.emit('up-to-date', updateInfo);
    });
    electronUpdater.on('error', (err: Error, message: string) => {
      this._status = UpdateStatus.Idle;
      this.emit('error', err, message);
    });
    electronUpdater.on('download-progress', (progress: ProgressInfo) => {
      this._status = UpdateStatus.UpdateDownloading;
      this.emit('download-progress', progress);
    });
    electronUpdater.on('update-downloaded', (updateInfo: UpdateInfo) => {
      this._status = UpdateStatus.UpdateReadyToInstall;
      this.emit('update-downloaded', updateInfo);
    });
  }

  public checkForUpdates(userInitiated: boolean = false, autoDownload: boolean = false) {
    try {
      if (electronUpdater) {
        this._status = UpdateStatus.CheckingForUpdate;
        this._userInitiated = userInitiated;
        this._autoDownload = autoDownload;
        electronUpdater.allowPrerelease = this._allowPrerelease;
        electronUpdater.autoDownload = autoDownload;
        electronUpdater.allowDowngrade = false;
        electronUpdater.autoInstallOnAppQuit = true;
        if (process.env.NODE_ENV === 'development') {
          (electronUpdater as any).currentVersion = pjson.version;
        }
        electronUpdater.checkForUpdates()
          .catch(err => {
            console.error(err);
          });
      }
    } catch (e) {
      console.error(e);
    }
  }
  
  public quitAndInstall() {
    try {
      electronUpdater.quitAndInstall(true, true);
    } catch (e) {
      console.error(e);
    }
  }
}