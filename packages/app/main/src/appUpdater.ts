import { autoUpdater } from "electron";
import * as os from "os";
import * as process from "process";
import BrowserWindow = Electron.BrowserWindow;
import { mainWindow } from './main';
var pjson = require('../../package.json');
import * as semver from 'semver';
import { auto } from 'async';

export class AppUpdater {
  startup(window: BrowserWindow) {
    let allowUpdateCheck = (process.argv.indexOf("--no-update") == -1);
    let allowPrerelease = (process.argv.indexOf('--prerelease') >= 0);

    /**
     * For now, always allow pre-release when version is 4.
     * TODO: Remove this when 4 becomes stable. 
     */
    const major = semver.major(pjson.version);
    if (major === 4) {
      allowPrerelease = true;
    }

    autoUpdater.addListener("update-available", (event: any) => {
      //logger.debug("A new version is available. Downloading it now. You will be notified when download completes.");
    });
    autoUpdater.addListener("update-downloaded" as any, (event: any, releaseNotes: string, releaseName: string, releaseDate: string, updateURL: string) => {
      mainWindow.commandService.remoteCall('shell:update-downloaded');
      //logger.debug("Download complete.", logger.makeCommandLink("Restart", 'autoUpdater.quitAndInstall', "Quit and install the update"), "the application to update.");
    });
    autoUpdater.addListener("error", (error: any) => {
      //if (typeof error.message === "string" && !error.message.includes("AggregateException"))
      //    logger.error(error.message, error);
    });
    autoUpdater.addListener("checking-for-update", (event: any) => {
      //logger.debug("Checking for new version...");
    });
    autoUpdater.addListener("update-not-available", () => {
      //logger.debug("Application is up to date.");
    });

    if (allowUpdateCheck) {
      if (allowPrerelease) {
        autoUpdater.setFeedURL(`https://emulator.botframework.com/update/channel/rc/${os.platform()}/${pjson.version}`);
      } else {
        autoUpdater.setFeedURL(`https://emulator.botframework.com/update/${os.platform()}/${pjson.version}`);
      }
    }

    window.once("ready-to-show", (event: any) => {
      try {
        if (allowUpdateCheck) {
          autoUpdater.checkForUpdates();
        }
      } catch (e) { }
    });
  }

  quitAndInstall() {
    try {
      autoUpdater.quitAndInstall();
    }
    catch (e) { }
  }
}
