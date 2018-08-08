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

import { LuisModel } from '@bfemulator/app-shared';
import * as fetch from 'electron-fetch';

export class LuisApi {
  public static async getApplicationsList(armToken: string): Promise<LuisModel[]> {
    // We have the arm token which allows us to get the
    // authoring key used to retrieve the apps
    const req: RequestInit = { headers: { Authorization: `Bearer ${armToken}` } };
    let authoringKey: string;
    try {
      const authoringKeyResponse = await (fetch as any)
        .default('https://api.luis.ai/api/v2.0/bots/programmatickey', req);
      authoringKey = await authoringKeyResponse.text();
    } catch (e) {
      return null;
    }
    const luisModels: LuisModel[] = [];
    ['westus', 'westeurope', 'australiaeast'].forEach(async region => {
      try {
        const models = await this.getApplicationsForRegion(region, authoringKey);
        luisModels.push(...models);
      } catch {
        // Skip this
      }
      return null;
    });
    return luisModels;
  }

  public static async getApplicationsForRegion(region: string, authoringKey: string): Promise<LuisModel[]> {
    let url = `https://${region}.api.cognitive.microsoft.com/luis/api/v2.0/apps/`;
    const headers = new Headers({
      'Content-Accept': 'application/json',
      'Ocp-Apim-Subscription-Key': authoringKey
    });

    const response = await fetch(url, { headers, method: 'get' } as any);
    return await response.json() as LuisModel[];
  }
}
