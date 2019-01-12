import { SharedConstants } from "@bfemulator/app-shared";
import { isTranscriptFile } from "@bfemulator/app-shared";
import { IFileService, ServiceTypes } from "botframework-config/lib/schema";
import { WatchOptions } from "chokidar";
import * as fs from "fs";
import * as path from "path";

import { mainWindow } from "../main";

import { FileWatcher } from "./fileWatcher";

export class TranscriptsWatcher extends FileWatcher {
  private transcriptFiles: { [path: string]: boolean } = {};
  private notificationPending: NodeJS.Timer;

  public get options(): WatchOptions {
    return {
      followSymlinks: false
    };
  }

  public async watch(paths: string | string[]): Promise<true> {
    this.transcriptFiles = {};
    this.invalidateTranscriptFiles();
    return super.watch(paths);
  }

  protected onFileAdd = (file: string, fstats?: fs.Stats): void => {
    if (!isTranscriptFile(file)) {
      return;
    }
    this.transcriptFiles[file] = true;
    this.invalidateTranscriptFiles();
  };

  protected onFileRemove = (file: string, fstats?: fs.Stats): void => {
    if (!isTranscriptFile(file)) {
      return;
    }
    delete this.transcriptFiles[file];
    this.invalidateTranscriptFiles();
  };

  protected onFileChange = (file: string, fstats?: fs.Stats): void => {
    mainWindow.commandService
      .remoteCall(SharedConstants.Commands.File.Changed, file)
      .catch();
  };

  private invalidateTranscriptFiles() {
    clearTimeout(this.notificationPending);
    this.notificationPending = setTimeout(this.validateChatFiles, 250);
  }

  private validateChatFiles = () => {
    const transcriptFiles: IFileService[] = Object.keys(
      this.transcriptFiles
    ).map(key => {
      const { name, ext } = path.parse(key);
      return {
        name: `${name}${ext}`,
        type: ServiceTypes.File,
        id: key,
        path: key
      };
    });
    mainWindow.commandService
      .remoteCall(
        SharedConstants.Commands.Bot.TranscriptFilesUpdated,
        transcriptFiles
      )
      .catch();
    this.notificationPending = null;
  };
}
