import base64Url from 'base64url';
import onErrorResumeNext from 'on-error-resume-next';

import BotEmulatorOptions from '../types/botEmulatorOptions';
import BotEndpoint from './botEndpoint';
import IBotEndpoint from '../types/botEndpoint';
import uniqueId from '../utils/uniqueId';

const { decode } = base64Url;

function mapMap<T, U>(map: { [key: string]: T }, mapper: (T, string) => U ): { [key: string]: U } {
  return Object.keys(map).reduce((nextMap, key) => ({
    ...nextMap,
    [key]: mapper.call(map, map[key], key)
  }), {});
}

export default class Endpoints {
  constructor(private _options: BotEmulatorOptions) {}

  private _endpoints: { [key: string]: BotEndpoint } = {};

  push(id: string, botEndpoint: IBotEndpoint): BotEndpoint {
    id = id || botEndpoint.botUrl || uniqueId();

    const botEndpointInstance = new BotEndpoint(
      id,
      botEndpoint.botId,
      botEndpoint.botUrl,
      botEndpoint.msaAppId,
      botEndpoint.msaPassword,
      botEndpoint.use10Tokens,
      {
        fetch: this._options.fetch
      }
    );

    this._endpoints[id] = botEndpointInstance;

    return botEndpointInstance;
  }

  reset() {
    this._endpoints = {};
  }

  // TODO: Deprecate this
  getDefault(): BotEndpoint {
    return this._endpoints[Object.keys(this._endpoints)[0]];
  }

  get(id: string): BotEndpoint {
    // TODO: We need to remove parsing from BASE64, find a better way
    const savedEndpoint = this._endpoints[id];

    if (savedEndpoint) {
      return savedEndpoint;
    }

    const token = onErrorResumeNext(() => JSON.parse(decode(id)));

    if (token && token.endpointId) {
      return this.get(token.endpointId);
    }
  }

  // TODO: Check if this can be deprecated, try to deprecate this
  getByAppId(msaAppId: string): BotEndpoint {
    return this._endpoints[Object.keys(this._endpoints).find(id => this._endpoints[id].msaAppId === msaAppId)];
  }

  getAll(): { [key: string]: IBotEndpoint } {
    return mapMap<BotEndpoint, IBotEndpoint>(this._endpoints, value => ({
      botId: value.botId,
      botUrl: value.botUrl,
      msaAppId: value.msaAppId,
      msaPassword: value.msaPassword,
      use10Tokens: value.use10Tokens
    }));
  }
}
