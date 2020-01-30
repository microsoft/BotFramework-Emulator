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

import * as Path from 'path';

import { BotInfo, SharedConstants } from '@bfemulator/app-shared';
import * as BotActions from '@bfemulator/app-shared/built/state/actions/botActions';
import { BotConfiguration } from 'botframework-config';
import { app } from 'electron';
import * as Fs from 'fs-extra';
import { sync as mkdirp } from 'mkdirp';
import { CommandServiceImpl, CommandServiceInstance } from '@bfemulator/sdk-shared';

import { store } from './state/store';
import { BotHelpers } from './botHelpers';
import { ensureStoragePath, getFilesInDir, writeFile } from './utils';

/** Performs the V4 side of migration from V3 -> V4 bots */
export class Migrator {
  @CommandServiceInstance()
  private static commandService: CommandServiceImpl;
  private static readonly _migrationMarkerName = 'migration_marker.txt';

  /** Runs the V4 side of migration if necessary */
  public static async startup(): Promise<void> {
    if (!(await this.migrationHasBeenPerformed())) {
      const migrationResult = await this.migrateBots();
      if (migrationResult) {
        this.leaveMigrationMarker();
      }
    }
  }

  /** Adds the bot files in the /migration/ dir
   *  to the MRU bots list and displays an overview page
   */
  public static async migrateBots(): Promise<boolean> {
    // - app data path in v3 will be %appdata%/botframework-emulator/botframework-emulator
    // - v4 path will be %appdata%/@bfemulator/main/botframework-emulator
    let botFilesDirectory =
      // %appdata%/@bfemulator/main
      app
        .getPath('userData')
        // %appdata%/botframework-emulator/botframework-emulator
        .replace(Path.join('@bfemulator', 'main'), Path.join('botframework-emulator', 'botframework-emulator'));
    // %appdata%/botframework-emulator/botframework-emulator/migration
    botFilesDirectory = Path.join(botFilesDirectory, 'migration');

    // if the /migration/ directory does not exist then abort migration
    if (!(await Fs.pathExists(botFilesDirectory))) {
      return false;
    }
    // read bots to be migrated from directory
    const botFiles = (getFilesInDir(botFilesDirectory) || []) as string[];
    if (botFiles.length) {
      const recentBotsList: BotInfo[] = [];
      for (let i = 0; i < botFiles.length; i++) {
        const botFile = botFiles[i];
        // read the bot file and create a bot info item from it
        try {
          // v3 path
          const oldPath = Path.join(botFilesDirectory, botFile);
          // v4 path
          const newPathBase = Path.join(ensureStoragePath(), 'migration');
          if (!(await Fs.pathExists(newPathBase))) {
            mkdirp(newPathBase);
          }
          const newPath = Path.join(newPathBase, botFile);

          // load bot from old path, then change its path to the new path
          const botWithOldPath = await BotConfiguration.load(oldPath);
          const bot = BotHelpers.cloneBot(botWithOldPath);
          bot.path = newPath;
          await BotHelpers.saveBot(bot);

          const botInfo: BotInfo = {
            path: newPath,
            displayName: bot.name,
          };
          recentBotsList.unshift(botInfo);
        } catch (err) {
          throw new Error(`Error while trying to populate bots list with migrated V3 bots: ${err}`);
        }
      }

      // load the bots into the recent bots list
      store.dispatch(BotActions.load(recentBotsList));

      // show post-migration page
      const { ShowPostMigrationDialog } = SharedConstants.Commands.UI;
      await Migrator.commandService.remoteCall(ShowPostMigrationDialog).catch();
      return true;
    }
    return false;
  }

  /** Writes a file to app data that prevents migration from being performed again */
  private static leaveMigrationMarker(): void {
    writeFile(Path.join(ensureStoragePath(), this._migrationMarkerName), '');
  }

  /** Checks for the migration marker to determine if it has already been performed */
  private static async migrationHasBeenPerformed(): Promise<boolean> {
    return Fs.pathExists(Path.join(ensureStoragePath(), this._migrationMarkerName));
  }
}
