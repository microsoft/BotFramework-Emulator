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

import * as path from 'path';

import { SharedConstants } from '@bfemulator/app-shared';
import * as BotActions from '@bfemulator/app-shared/built/state/actions/botActions';
import { WatchOptions } from 'chokidar';
import { existsSync, readFileSync, Stats } from 'fs-extra';
import { CommandServiceImpl, CommandServiceInstance } from '@bfemulator/sdk-shared';

import { store } from '../state/store';
import { BotHelpers } from '../botHelpers';

import { FileWatcher } from './fileWatcher';

function findGitIgnore(directory: string): string {
  const filePath = path.resolve(directory, '.gitignore');
  const found = existsSync(filePath);
  if (found) {
    return filePath;
  }

  return null;
}

function readGitIgnore(filePath: string): string[] {
  if (!filePath) {
    return [];
  }
  const text = readFileSync(filePath, 'utf-8');
  return text
    .split(/[\n\r]/)
    .map(x => x.trim())
    .filter(x => x && !(x || '').startsWith('#'));
}

/** Singleton class that will watch one bot project directory at a time */
export class BotProjectFileWatcher extends FileWatcher {
  @CommandServiceInstance()
  private commandService: CommandServiceImpl;

  private botFilePath: string;

  protected onFileAdd = (file: string, fstats?: Stats): void => {
    // TODO - wipe this?
  };

  protected onFileRemove = (file: string, fstats?: Stats): void => {
    // TODO - wipe this?
  };

  protected onFileChange = async (file: string, fstats?: Stats): Promise<any> => {
    if (file !== this.botFilePath || !BotHelpers.getActiveBot()) {
      return;
    }
    // the bot file changed, we should load it and push it to the store
    const bot = await BotHelpers.loadBotWithRetry(this.botFilePath);
    if (!bot) {
      // user dismissed the secret prompt dialog (if it was shown)
      throw new Error('No secret provided to decrypt encrypted bot.');
    }

    // update store
    const botDir = path.dirname(this.botFilePath);
    store.dispatch(BotActions.setActive(bot));
    return Promise.all([
      this.commandService.remoteCall(SharedConstants.Commands.Bot.SetActive, bot, botDir),
      this.commandService.call(SharedConstants.Commands.Bot.RestartEndpointService),
    ]);
  };

  public async watch(botFilePath: string): Promise<true> {
    this.botFilePath = botFilePath;
    // wipe the transcript explorer store
    await this.commandService.remoteCall(SharedConstants.Commands.File.Clear);
    if (botFilePath) {
      return super.watch(botFilePath);
    }
    return true;
  }

  public get options(): WatchOptions {
    const botProjectDir = path.dirname(this.botFilePath);
    const gitIgnoreFile = findGitIgnore(botProjectDir);
    const ignoreGlobs = readGitIgnore(gitIgnoreFile);
    return {
      ignored: ignoreGlobs,
      followSymlinks: false,
    };
  }
}
