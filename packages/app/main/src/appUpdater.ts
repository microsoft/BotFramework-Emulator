import { autoUpdater } from "electron";
import * as os from "os";
import * as process from "process";
import BrowserWindow = Electron.BrowserWindow;
import { mainWindow } from './main';
var pjson = require('../../package.json');
import * as semver from 'semver';

export class AppUpdater {
  private _availableUpdateInfo: any = null;

  public get isUpdateAvailable(): boolean { return this._availableUpdateInfo != null; }

  startup(window: BrowserWindow) {
    let allowUpdateCheck = (process.argv.indexOf("--no-update") == -1);
    let allowPrerelease = (process.argv.indexOf('--prerelease') >= 0);

    // Allow update to prerelease if this is a prerelease
    const rc = semver.prerelease(pjson.version);
    if (rc && rc.length) {
      allowPrerelease = true;
    }

    autoUpdater.addListener("update-available", () => {
      //logger.debug("A new version is available. Downloading it now. You will be notified when download completes.");
    });
    autoUpdater.addListener("update-downloaded" as any, (event: any, releaseNotes: string, releaseName: string, releaseDate: string, updateURL: string) => {
      this._availableUpdateInfo = {
        releaseNotes,
        releaseName,
        releaseDate,
        updateURL
      };
      mainWindow.commandService.remoteCall('shell:update-downloaded', releaseNotes, releaseName, releaseDate, updateURL);
      //logger.debug("Download complete.", logger.makeCommandLink("Restart", 'autoUpdater.quitAndInstall', "Quit and install the update"), "the application to update.");
    });
    autoUpdater.addListener("error", (error: any) => {
      //if (typeof error.message === "string" && !error.message.includes("AggregateException"))
      //    logger.error(error.message, error);
    });
    autoUpdater.addListener("checking-for-update", () => {
      //logger.debug("Checking for new version...");
    });
    autoUpdater.addListener("update-not-available", () => {
      mainWindow.commandService.remoteCall('shell:update-not-available');
    });

    if (allowUpdateCheck) {
      if (allowPrerelease) {
        autoUpdater.setFeedURL(`https://emulator.botframework.com/update/channel/rc/${os.platform()}/${pjson.version}`);
      } else {
        autoUpdater.setFeedURL(`https://emulator.botframework.com/update/${os.platform()}/${pjson.version}`);
      }
    }

    window.once("ready-to-show", (event: any) => {
      if (allowUpdateCheck) {
        this.checkForUpdates();
      }
    });
  }

  public checkForUpdates() {
    try {
      autoUpdater.checkForUpdates();
    } catch (e) { }
  }

  public quitAndInstall() {
    try {
      autoUpdater.quitAndInstall();
    } catch (e) { }
  }
}
