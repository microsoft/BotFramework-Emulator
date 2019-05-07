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

import { LuisModel, LuisRegion, ServiceCodes } from '@bfemulator/app-shared';
import { ILuisService, ServiceTypes } from 'botframework-config/lib/schema';

export class LuisApi {
  public static *getServices(armToken: string): IterableIterator<any> {
    const payload = { services: [], code: ServiceCodes.OK };
    // 1.
    // We have the arm token which allows us to get the
    // authoring key used to retrieve the apps
    const req: RequestInit = {
      headers: { Authorization: `Bearer ${armToken}` },
    };
    let authoringKeys: string[];
    try {
      yield { label: 'Retrieving key from LUIS…', progress: 25 };
      const urls = [
        'https://api.luis.ai/api/v2.0/bots/programmatickey',
        'https://api.eu.luis.ai/api/v2.0/bots/programmatickey',
        'https://api.au.luis.ai/api/v2.0/bots/programmatickey',
      ];
      const requests = urls.map(url => fetch(url, req));
      const authoringKeyResponses: Response[] = yield Promise.all(requests);
      authoringKeys = yield Promise.all(authoringKeyResponses.map(async response => await response.json()));
    } catch (e) {
      payload.code = ServiceCodes.AccountNotFound;
      return payload;
    }
    // 2.
    // We have 3 regions to check for luis models
    yield { label: 'Checking for LUIS models…', progress: 75 };
    const luisApiPromises: Promise<LuisModel[] | { error: any }>[] = [];
    const regions: LuisRegion[] = ['westus', 'westeurope', 'australiaeast'];
    let i = regions.length;
    while (i--) {
      if (typeof authoringKeys[i] === 'object') {
        continue;
      }
      luisApiPromises.push(LuisApi.getApplicationsForRegion(regions[i], authoringKeys[i]));
    }
    const results = yield Promise.all(luisApiPromises);
    // 3.
    // Filter out errors then combine all results into
    // a single array of LuisModel[]
    const luisModels = results
      .filter(result => !('error' in result))
      .reduce((agg: LuisModel[], models) => (agg.push(...(models as LuisModel[])), agg), []) as LuisModel[];
    // 4.
    // Mutate the list into an array of ILuisService[]
    payload.services = luisModels.map(
      (luisModel: LuisModel): ILuisService => {
        const authoringKey = authoringKeys[regions.indexOf(luisModel.region)];
        return {
          authoringKey,
          appId: luisModel.id,
          id: luisModel.id,
          name: luisModel.name,
          subscriptionKey: authoringKey,
          type: luisModel.activeVersion === 'Dispatch' ? ServiceTypes.Dispatch : ServiceTypes.Luis,
          version: luisModel.activeVersion,
          region: luisModel.region,
          getEndpoint: () => luisModel.region,
        };
      }
    ) as ILuisService[];

    return payload;
  }

  public static async getApplicationsForRegion(region: LuisRegion, key: string): Promise<LuisModel[] | { error: any }> {
    const url = `https://${region}.api.cognitive.microsoft.com/luis/api/v2.0/apps/`;
    const headers = {
      'Content-Accept': 'application/json',
      'Ocp-Apim-Subscription-Key': key,
    };

    const response: Response = await fetch(url, {
      headers,
      method: 'get',
    } as any);
    if (!response.ok) {
      const error = await response.json();
      return { error };
    }
    const luisModels = (await response.json()) as LuisModel[];
    if (luisModels instanceof Array) {
      return luisModels.map(luisModel => ((luisModel.region = region), luisModel));
    }
    return luisModels;
  }
}
