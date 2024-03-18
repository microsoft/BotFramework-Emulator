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

import base64Url from 'base64url';
import onErrorResumeNext from 'on-error-resume-next';

import { uniqueId } from '../utils/uniqueId';

import { BotEndpoint } from './botEndpoint';

const { decode } = base64Url;

export class EndpointSet {
  private _endpoints: { [key: string]: BotEndpoint } = {};
  constructor(private _fetch: (url: string, options?: any) => Promise<any>) {}

  public set(id: string, botEndpoint: Partial<BotEndpoint>): BotEndpoint {
    id = id || botEndpoint.botUrl || uniqueId();

    const botEndpointInstance = new BotEndpoint(
      id,
      botEndpoint.botId,
      botEndpoint.botUrl,
      botEndpoint.msaAppId,
      botEndpoint.msaPassword,
      botEndpoint.use10Tokens,
      botEndpoint.channelService,
      {
        fetch: this._fetch,
      },
      botEndpoint.tenantId
    );

    this._endpoints[id] = botEndpointInstance;

    return botEndpointInstance;
  }

  public clear() {
    this._endpoints = {};
  }

  // TODO: Deprecate this
  public getDefault(): BotEndpoint {
    return this._endpoints[Object.keys(this._endpoints)[0]];
  }

  public get(id: string): BotEndpoint {
    // TODO: We need to remove parsing from BASE64, find a better way
    const savedEndpoint = this._endpoints[id];

    if (savedEndpoint) {
      return savedEndpoint;
    }

    const token = onErrorResumeNext(() => JSON.parse(decode(id)));

    if (token && token.endpointId) {
      return this.get(token.endpointId);
    }
    return null;
  }

  // TODO: Check if this can be deprecated, try to deprecate this
  public getByAppId(msaAppId: string): BotEndpoint {
    return this._endpoints[Object.keys(this._endpoints).find(id => this._endpoints[id].msaAppId === msaAppId)];
  }

  public getAll(): { [key: string]: BotEndpoint } {
    return this._endpoints;
  }
}
