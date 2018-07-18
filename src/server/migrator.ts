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
  public migrateV3Bots(): void {
    const bots: IBot[] = this.getV3Bots();
    if (bots.length) {
      this.convertBotsToBotFiles(bots);
    } else {
      console.log('No bots to migrate. Skipping V3 -> V4 migration.')
    }
  }

  /** Gets list of v3 bots from server.json */
  private getV3Bots(): IBot[] {
    const settings: Settings = getSettings();
    if (!settings.bots || !settings.bots.length) {
      return [];
    }
    return settings.bots;
  }

  /** Converts V3 bot configs to V4 bot files */
  private convertBotsToBotFiles(bots: IBot[]): void {
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
  private populateAndSaveBotFile(bot: IBot, path: string, botName: string): void {
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
  private isLocalhostBot(bot: IBot): boolean {
    const localhostRegex = /^https?:\/\/localhost:/;
    return localhostRegex.test(bot.botUrl);
  }

  /** Extracts the port number from a localhost url */
  private extractLocalhostPort(url: string): string {
    const parsedUrl = Url.parse(url);
    return parsedUrl.port;
  }

  /** Extracts the host name from a remote url */
  private extractRemoteHostName(url: string): string {
    const parsedUrl = Url.parse(url);
    return parsedUrl.host;
  }
}