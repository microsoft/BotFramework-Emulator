import base64Url from 'base64url';
import onErrorResumeNext from 'on-error-resume-next';

import BotEmulatorOptions from '../types/botEmulatorOptions';
import BotEndpoint from './botEndpoint';
import IBotEndpoint from '../types/botEndpoint';

const { decode } = base64Url;

export default class Endpoints {
  constructor(private _options: BotEmulatorOptions) {
    let { defaultEndpoint } = this._options;

    defaultEndpoint && this.addEndpoint(defaultEndpoint);
  }

  private _endpoints: { [key: string]: BotEndpoint } = {};

  addEndpoint(botEndpoint: BotEndpoint | IBotEndpoint): BotEndpoint {
    let botEndpointInstance: BotEndpoint;

    if (botEndpoint instanceof BotEndpoint) {
      botEndpointInstance = botEndpoint;
    } else {
      botEndpointInstance = new BotEndpoint(
        botEndpoint.botId,
        botEndpoint.botUrl,
        botEndpoint.msaAppId,
        botEndpoint.msaPassword,
        botEndpoint.use10Tokens,
        {
          fetch: this._options.fetch
        }
      );
    }

    this._endpoints[botEndpointInstance.endpointId] = botEndpointInstance;

    return botEndpointInstance;
  }

  getDefaultEndpoint(): BotEndpoint {
    const firstEndpointId = Object.keys(this._endpoints)[0];

    return firstEndpointId && this._endpoints[firstEndpointId];
  }

  getEndpoint(endpointId: string): BotEndpoint {
    const savedEndpoint = this._endpoints[endpointId];

    if (savedEndpoint) {
      return savedEndpoint;
    }

    const parsedEndpoint = onErrorResumeNext(() => JSON.parse(decode(endpointId)));

    if (parsedEndpoint) {
      return this.addEndpoint({
        botId: parsedEndpoint.botId,
        botUrl: parsedEndpoint.botUrl,
        msaAppId: parsedEndpoint.appId,
        msaPassword: parsedEndpoint.appPassword,
        use10Tokens: parsedEndpoint.use10Tokens
      });
    }
  }

  getEndpoints(): { [key: string]: BotEndpoint } {
    return { ...this._endpoints };
  }
}
