import { SharedConstants } from "@bfemulator/app-shared";
import { isChatFile } from "@bfemulator/app-shared";
import { IFileService, ServiceTypes } from "botframework-config/lib/schema";
import { WatchOptions } from "chokidar";
import * as fs from "fs";
import * as path from "path";

import { mainWindow } from "../main";

import { FileWatcher } from "./fileWatcher";

export class ChatWatcher extends FileWatcher {
  private chatFiles: { [path: string]: boolean } = {};
  private notificationPending: NodeJS.Timer;

  public get options(): WatchOptions {
    return {
      followSymlinks: false
    };
  }

  public async watch(paths: string | string[]): Promise<true> {
    this.chatFiles = {};
    this.invalidateChatFiles();
    return super.watch(paths);
  }

  protected onFileAdd = (file: string, fstats?: fs.Stats): void => {
    if (!isChatFile(file)) {
      return;
    }
    this.chatFiles[file] = true;
    this.invalidateChatFiles();
  };

  protected onFileRemove = (file: string, fstats?: fs.Stats): void => {
    if (!isChatFile(file)) {
      return;
    }
    delete this.chatFiles[file];
    this.invalidateChatFiles();
  };

  protected onFileChange = (file: string, fstats?: fs.Stats): void => {
    mainWindow.commandService
      .remoteCall(SharedConstants.Commands.File.Changed, file)
      .catch();
  };

  /**
   * Batches the file changes to prevent a Chatty Patty
   */
  private invalidateChatFiles() {
    clearTimeout(this.notificationPending);
    this.notificationPending = setTimeout(this.validateChatFiles, 250);
  }

  private validateChatFiles = () => {
    const chatFiles: IFileService[] = Object.keys(this.chatFiles).map(key => {
      const { name, ext } = path.parse(key);
      return {
        name: `${name}${ext}`,
        type: ServiceTypes.File,
        id: key,
        path: key
      };
    });
    mainWindow.commandService
      .remoteCall(SharedConstants.Commands.Bot.ChatFilesUpdated, chatFiles)
      .catch();
    this.notificationPending = null;
  };
}
