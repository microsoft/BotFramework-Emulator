import { createHash } from 'crypto';
import * as HttpStatus from 'http-status-codes';

import { speech as speechEndpoint, authentication as authenticationEndpoint } from '../authEndpoints';
import { URL, URLSearchParams } from 'url';
import IBotEndpointOptions from '../types/botEndpointOptions';
import ISpeechTokenInfo from '../types/speechToken';
import statusCodeFamily from '../utils/statusCodeFamily';

// We will refresh if the token is going to expire within 5 minutes
const TIME_TO_REFRESH = 5 * 60 * 1000;

function hashObject(obj, algorithm = 'sha256') {
  const hash = createHash(algorithm);

  hash.update(JSON.stringify(obj));

  return hash.digest('base64');
}

export default class BotEndpoint {
  constructor(
    public botId: string,
    public botUrl: string,
    public msaAppId: string,
    public msaPassword: string,
    public use10Tokens: boolean,
    private _options: IBotEndpointOptions
  ) {
    if (this.msaAppId) {
      this.endpointId = this.msaAppId;
    } else {
      this.endpointId = hashObject({
        botId,
        botUrl,
        msaAppId,
        msaPassword,
        use10Tokens
      });
    }
  }

  accessToken: string;
  accessTokenExpires: number;
  endpointId: string;
  speechToken: string;

  async fetchWithAuth(url, fetchOptions: any = {}, forceRefresh: boolean = false) {
    if (this.msaAppId) {
      fetchOptions.headers = {
        ...fetchOptions.headers,
        Authorization: `Bearer ${await this.getAccessToken(forceRefresh)}`
      };
    }

    const response = await this._options.fetch(url, fetchOptions);

    if (
      (response.status === HttpStatus.UNAUTHORIZED || response.status === HttpStatus.FORBIDDEN)
      && (!forceRefresh && this.msaAppId)
    ) {
      return await this.fetchWithAuth(url, fetchOptions, true);
    }

    return response;
  }

  private async getAccessToken(forceRefresh: boolean = false): Promise<string> {
    if (!forceRefresh && this.accessToken && Date.now() < this.accessTokenExpires - TIME_TO_REFRESH) {
      return this.accessToken;
    }

    // Refresh access token
    const resp = await this._options.fetch(authenticationEndpoint.tokenEndpoint, {
      method: 'POST',
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.msaAppId,
        client_secret: this.msaPassword,
        scope: `${ this.msaAppId }/.default`,
        // flag to request a version 1.0 token
        ...this.use10Tokens ? { atver: 1 } : {}
      } as { [key: string]: string }).toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (statusCodeFamily(resp.status, 200)) {
      // Subtract 5 minutes from expires_in so they'll we'll get a
      // new token before it expires.
      const oauthResponse = await resp.json();

      this.accessToken = oauthResponse.access_token;
      this.accessTokenExpires = Date.now() + oauthResponse.expires_in * 1000;

      return this.accessToken;
    } else {
      // this.facilities.logger.logError(this.conversationId, 'Error: The bot\'s MSA appId or password is incorrect.');
      // this.facilities.logger.logError(this.conversationId, makeBotSettingsLink('Edit your bot\'s MSA info'));

      throw new Error('Refresh access token failed with status code: ' + resp.status);
    }
  }

  public async getSpeechToken(refresh: boolean = false, duration: number = 10) {
    if (this.speechToken && !refresh) {
      return this.speechToken;
    }

    if (!this.msaAppId || !this.msaPassword) {
      throw new Error('bot must have Microsoft App ID and password');
    }

    const query = new URLSearchParams({ goodForInMinutes: duration } as any);
    const res = this.fetchWithAuth(new URL(`?${query.toString()}`, speechEndpoint.tokenEndpoint).toString());

    if (statusCodeFamily(res.status, 200)) {
      const body = res.json() as ISpeechTokenInfo;

      this.speechToken = body.access_Token;

      return this.speechToken;
    } else if (res.status === 401) {
      throw new Error('not authorized to use Cognitive Services Speech API');
    } else {
      throw new Error('cannot retrieve speech token');
    }
  }
}
