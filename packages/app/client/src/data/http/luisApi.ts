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
// NONINFRINGEM,ENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

export interface LuisModel {
  id: string;
  name: string;
  description: string;
  culture: string;
  usageScenario: string;
  domain: string;
  versionsCount: number;
  createdDateTime: string;
  endpoints: {
    PRODUCTION: any;
    STAGING: any
  };
  endpointHitsCount: number;
  activeVersion: string;
  ownerEmail: string;
}

export class LuisApi {
  public static async getApplicationsList(luisAuthData: { key: string, region: string }, skip?: number, take?: number)
    : Promise<LuisModel[]> {
    const { key: authoringKey, region } = luisAuthData;
    let url = `https://${region}.api.cognitive.microsoft.com/luis/api/v2.0/apps/`;
    const headers = new Headers({
      'Content-Accept': 'application/json',
      'Ocp-Apim-Subscription-Key': authoringKey
    });

    if (skip || take) {
      url += '?';
      if (!isNaN(+skip)) {
        url += `skip=${+skip}`;
      }
      if (!isNaN(+take)) {
        url += !isNaN(+skip) ? `&take=${+take}` : `take=${+take}`;
      }
    }
    const response = await fetch(url, { headers, method: 'get' });
    return await response.json() as LuisModel[];
  }
}
