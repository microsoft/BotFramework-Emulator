import { BotConfigModel } from 'msbot/bin/models';
import { IBotConfig } from 'msbot/bin/schema';

export interface IBotConfigWithPath extends IBotConfig {
  path?: string;
}

export class BotConfigWithPath extends BotConfigModel implements IBotConfigWithPath {
  public path = '';

  static fromJSON(source: Partial<BotConfigWithPath>): BotConfigWithPath {

    const botConfig = super.fromJSON(source) as Partial<BotConfigWithPath>;
    const { path = '' } = source;
    const botConfigWithPath = new BotConfigWithPath();
    Object.assign(botConfigWithPath, botConfig, { path });

    return botConfigWithPath;
  }
}
