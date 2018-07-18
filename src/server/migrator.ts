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

import { getSettings } from './settings';
import { Settings } from '../types/serverSettingsTypes';
import { BotConfig, IEndpointService } from 'msbot';
import { ServiceType } from 'msbot/bin/schema';
import { IBot } from '../types/botTypes';
import  * as Url from 'url';
import * as Mkdirp from 'mkdirp';
import * as Path from 'path';
import * as Fs from 'fs';
import { ensureStoragePath } from '../shared/utils';

/** Migrates V3 bots to V4 bots */
export class Migrator {
  /** Carries out the migration process from V3 bots to V4 bots */
  public static migrateV3Bots(): void {
    const bots: IBot[] = this.getV3Bots();
    if (bots.length) {
      this.convertBotsToBotFiles(bots);
    } else {
      console.log('No bots to migrate. Skipping V3 -> V4 migration.')
    }
  }

  /** Gets list of v3 bots from server.json */
  private static getV3Bots(): IBot[] {
    const settings: Settings = getSettings();
    if (!settings.bots || !settings.bots.length) {
      return [];
    }
    return settings.bots;
  }

  /** Converts V3 bot configs to V4 bot files */
  private static convertBotsToBotFiles(bots: IBot[]): void {
    // if there is no /migration/ folder, create it
    const migrationDirPath = Path.join(ensureStoragePath(), 'migration');
    Mkdirp.sync(migrationDirPath);

    // iterate through each bot and convert / save it to a .bot file
    bots.forEach(bot => {
      if (!bot.botUrl) {
        return;
      }

      if (this.isLocalhostBot(bot)) {
        const port = this.extractLocalhostPort(bot.botUrl);
        let botFileName = `localhost_${port}.bot`;
        let botPath = Path.join(migrationDirPath, botFileName);
        // append number to botFileName if a dupe already exists
        for (let i = 1; Fs.existsSync(botPath); i++) {
          botFileName = `localhost_${port}(${i}).bot`
          botPath = Path.join(migrationDirPath, botFileName);
        }

        // myBotFile.bot -> myBotFile
        const botName = botFileName.substring(0, botFileName.length - 4);
        this.populateAndSaveBotFile(bot, botPath, botName);
      } else {
        const hostname = this.extractRemoteHostName(bot.botUrl);
        let botFileName = `${hostname}.bot`;  
        let botPath = Path.join(migrationDirPath, botFileName);
        // append number to botFileName if a dupe already exists
        for (let i = 1; Fs.existsSync(botPath); i++) {
          botFileName = `${hostname}(${i}).bot`
          botPath = Path.join(migrationDirPath, botFileName);
        }

        // myBotFile.bot -> myBotFile
        const botName = botFileName.substring(0, botFileName.length - 4);
        this.populateAndSaveBotFile(bot, botPath, botName);
      }
    });
  }

  /** Maps a V3 bot config to a V4 bot file and saves it at path */
  private static populateAndSaveBotFile(bot: IBot, path: string, botName: string): void {
    const botFile = new BotConfig();
    const endpoint: IEndpointService = {
      id: bot.botUrl,
      name: bot.botUrl,
      appId: bot.msaAppId,
      appPassword: bot.msaPassword,
      endpoint: bot.botUrl,
      type: ServiceType.Endpoint
    };
    botFile.services.push(endpoint);
    botFile.name = botName;
    botFile.save(path);
  }

  /** Returns true if the bot has a localhost url */
  private static isLocalhostBot(bot: IBot): boolean {
    const localhostRegex = /^https?:\/\/localhost:/;
    return localhostRegex.test(bot.botUrl);
  }

  /** Extracts the port number from a localhost url */
  private static extractLocalhostPort(url: string): string {
    const parsedUrl = Url.parse(url);
    return parsedUrl.port;
  }

  /** Extracts the host name from a remote url */
  private static extractRemoteHostName(url: string): string {
    const parsedUrl = Url.parse(url);
    return parsedUrl.host;
  }
}