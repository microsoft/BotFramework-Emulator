import { autoUpdater as electronUpdater } from "electron-updater";
import * as path from "path";
import * as process from "process";
import { mainWindow } from './main';
var pjson = require('../../package.json');
import * as semver from 'semver';
import { EventEmitter } from 'events';

export enum UpdateStatus {
  Idle,
  CheckingForUpdate,
  UpdateAvailable,
  UpdateDownloading,
  UpdateReadyToInstall,
}

export const AppUpdater = new class extends EventEmitter {
  private _userInitiated: boolean;
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
    if (process.env.NODE_ENV === "development") {
      electronUpdater.updateConfigPath = path.join(process.cwd(), 'app-update.yml');
    }

    electronUpdater.on('checking-for-update', (ev: Event, ...args: any[]) => {
      this._status = UpdateStatus.CheckingForUpdate;
      this.emit('checking-for-update', ...args);
    });
    electronUpdater.on('update-available', (ev: Event, ...args: any[]) => {
      this._status = UpdateStatus.UpdateAvailable;
      this.emit('update-available', ...args);
    });
    electronUpdater.on('update-not-available', (ev: Event, ...args: any[]) => {
      this._status = UpdateStatus.Idle;
      this.emit('up-to-date', ...args);
    });
    electronUpdater.on('error', (ev: Event, err: Error, ...args: any[]) => {
      this._status = UpdateStatus.Idle;
      this.emit('error', err, ...args);
    });
    electronUpdater.on('download-progress', (ev: Event, ...args: any[]) => {
      this._status = UpdateStatus.UpdateDownloading;
      this.emit('download-progress', ...args);
    });
    electronUpdater.on('update-downloaded', (ev: Event, ...args: any[]) => {
      this._status = UpdateStatus.UpdateReadyToInstall;
      this.emit('update-downloaded', ...args);
    });
  }

  public checkForUpdates(userInitiated: boolean = false) {
    try {
      if (electronUpdater) {
        this._status = UpdateStatus.CheckingForUpdate;
        this._userInitiated = userInitiated;
        electronUpdater.allowPrerelease = this._allowPrerelease;
        electronUpdater.autoDownload = true;
        electronUpdater.allowDowngrade = false;
        electronUpdater.autoInstallOnAppQuit = true;
        electronUpdater.checkForUpdates().catch(err => console.error(err));
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