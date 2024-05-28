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

import { URL, URLSearchParams } from 'url';

import { BotEndpointOptions, SpeechAuthenticationToken } from '@bfemulator/sdk-shared';
import * as HttpStatus from 'http-status-codes';

import { authentication, speech as speechEndpoint, usGovernmentAuthentication } from '../constants/authEndpoints';
import { statusCodeFamily } from '../utils/statusCodeFamily';

// We will refresh if the token is going to expire within 5 minutes
const TIME_TO_REFRESH = 5 * 60 * 1000;

export class BotEndpoint {
  public accessToken?: string;
  public accessTokenExpires?: number;
  public appId?: string;
  public appPassword?: string;
  public speechAuthenticationToken?: SpeechAuthenticationToken;
  public tenantId?: string;

  constructor(
    public id?: string,
    public botId?: string,
    public botUrl?: string,
    public msaAppId?: string,
    public msaPassword?: string,
    public use10Tokens?: boolean,
    public channelService?: string,
    private _options?: BotEndpointOptions,
    public msaTenantId?: string
  ) {
    this.appId = msaAppId;
    this.appPassword = msaPassword;
    this.tenantId = msaTenantId;
  }

  private willTokenExpireWithin(millisecondsToExpire: number): boolean {
    return Date.now() + millisecondsToExpire >= this.speechAuthenticationToken.expireAt;
  }

  private async fetchSpeechToken(): Promise<string> {
    const res = await this.fetchWithAuth(new URL(speechEndpoint.tokenEndpoint).toString());
    if (statusCodeFamily(res.status, 200)) {
      let body;
      try {
        body = (await res.json()) as SpeechAuthenticationToken;
      } catch (e) {
        throw new Error(`Couldn't read speech token response: ${e}`);
      }

      if (body.access_Token) {
        this.speechAuthenticationToken = {
          accessToken: body.access_Token,
          region: body.region,
          expireAt: body.expireAt,
          tokenLife: body.tokenLife,
        };

        return this.speechAuthenticationToken.accessToken;
      } else {
        throw new Error(body.error || 'Could not retrieve speech token');
      }
    } else if (res.status === 401) {
      throw new Error('Not authorized to use Cognitive Services Speech API');
    } else {
      throw new Error(`Can't retrieve speech token`);
    }
  }

  public async getSpeechToken(refresh = false): Promise<string> {
    if (!this.msaAppId || !this.msaPassword) {
      throw new Error('Bot must have a valid Microsoft App ID and password');
    }

    if (this.speechAuthenticationToken && !refresh) {
      const tokenIsExpired = Date.now() >= this.speechAuthenticationToken.expireAt;

      // Refresh the token if it is expired, or if it is past its half life
      if (tokenIsExpired || this.willTokenExpireWithin(this.speechAuthenticationToken.tokenLife / 2)) {
        return this.fetchSpeechToken();
      }

      return this.speechAuthenticationToken.accessToken;
    } else {
      // refresh token
      return this.fetchSpeechToken();
    }
  }

  public async fetchWithAuth(url: string, fetchOptions: any = {}, forceRefresh = false) {
    if (this.msaAppId) {
      try {
        fetchOptions.headers = {
          ...fetchOptions.headers,
          Authorization: `Bearer ${await this.getAccessToken(forceRefresh)}`,
        };
      } catch (e) {
        return {
          status: e.status,
          message:
            "The bot's Microsoft App ID, Microsoft App Password, or Microsoft Tenant ID (Single Tenant apps) is incorrect.",
        };
      }
    }

    const response = await this._options.fetch(url, fetchOptions);

    if (
      (response.status === HttpStatus.UNAUTHORIZED || response.status === HttpStatus.FORBIDDEN) &&
      !forceRefresh &&
      this.msaAppId
    ) {
      return this.fetchWithAuth(url, fetchOptions, true);
    }

    return response;
  }

  private async getAccessToken(forceRefresh = false): Promise<string> {
    if (!forceRefresh && this.accessToken && Date.now() < this.accessTokenExpires - TIME_TO_REFRESH) {
      return this.accessToken;
    }

    let tokenEndpoint;

    // Refresh access token
    if (this.channelService === usGovernmentAuthentication.channelService) {
      tokenEndpoint = usGovernmentAuthentication.tokenEndpoint;
    } else if (this.tenantId) {
      tokenEndpoint = authentication.tokenEndpointSingleTenant.replace('{tenant-id}', this.tenantId);
    } else {
      tokenEndpoint = authentication.tokenEndpoint;
    }

    const resp = await this._options.fetch(tokenEndpoint, {
      method: 'POST',
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.msaAppId,
        client_secret: this.msaPassword,
        scope: `${this.msaAppId}/.default`,
        // flag to request a version 1.0 token
        ...(this.use10Tokens ? { atver: '1' } : {}),
      } as { [key: string]: string }).toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (statusCodeFamily(resp.status, 200)) {
      // Subtract 5 minutes from expires_in so they'll we'll get a
      // new token before it expires.
      const oauthResponse = await resp.json();

      this.accessToken = oauthResponse.access_token;
      this.accessTokenExpires = Date.now() + oauthResponse.expires_in * 1000;

      return this.accessToken;
    } else {
      throw {
        message: 'Refresh access token failed with status code: ' + resp.status,
        status: resp.status,
        body: resp.body,
      };
    }
  }
}
