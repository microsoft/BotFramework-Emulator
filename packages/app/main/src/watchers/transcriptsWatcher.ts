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
import * as fs from 'fs';
import * as path from 'path';

import { SharedConstants } from '@bfemulator/app-shared';
import { isTranscriptFile } from '@bfemulator/app-shared';
import { IFileService, ServiceTypes } from 'botframework-config/lib/schema';
import { WatchOptions } from 'chokidar';
import { CommandServiceImpl, CommandServiceInstance } from '@bfemulator/sdk-shared';

import { FileWatcher } from './fileWatcher';

export class TranscriptsWatcher extends FileWatcher {
  @CommandServiceInstance()
  private commandService: CommandServiceImpl;

  private transcriptFiles: { [path: string]: boolean } = {};
  private notificationPending: NodeJS.Timer;

  public get options(): WatchOptions {
    return {
      followSymlinks: false,
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
    this.commandService.remoteCall(SharedConstants.Commands.File.Changed, file).catch();
  };

  private invalidateTranscriptFiles() {
    clearTimeout(this.notificationPending);
    this.notificationPending = setTimeout(this.validateChatFiles, 250);
  }

  private validateChatFiles = () => {
    const transcriptFiles: IFileService[] = Object.keys(this.transcriptFiles).map(key => {
      const { name, ext } = path.parse(key);
      return {
        name: `${name}${ext}`,
        type: ServiceTypes.File,
        id: key,
        path: key,
      };
    });
    this.commandService.remoteCall(SharedConstants.Commands.Bot.TranscriptFilesUpdated, transcriptFiles).catch();
    this.notificationPending = null;
  };
}
