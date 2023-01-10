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
import '../fetchProxy';
import { LuisApi } from './luisApiService';

const mockArmToken = 'bm90aGluZw.eyJ1cG4iOiJnbGFzZ293QHNjb3RsYW5kLmNvbSJ9.7gjdshgfdsk98458205jfds9843fjds';
const mockResponses = [
  'hfdjg459846gjfdhgfdshjg',
  { error: { statusCode: 401, message: 'Oh Noes!' } },
  { error: { statusCode: 401, message: 'Oh Noes!' } },
  [
    {
      id: 'frewrew',
      name: 'My Great Bot',
      description: 'Default Intents for Azure Bot Service V2',
      culture: 'en-us',
      usageScenario: '',
      domain: '',
      versionsCount: 1,
      createdDateTime: '2018-03-13T21:25:49Z',
      endpoints: {
        PRODUCTION: {
          versionId: '0.1',
          isStaging: false,
          endpointUrl: 'https://none',
          region: null,
          assignedEndpointKey: null,
          endpointRegion: 'westus',
          publishedDateTime: '2018-04-11T17:08:32Z',
        },
      },
      endpointHitsCount: 2,
      activeVersion: '0.1',
      ownerEmail: 'none@none.com',
    },
  ],
  {
    services: [
      {
        authoringKey: 'tetrewwt',
        appId: 'gdfdsetrew4',
        id: '5325325325432',
        name: 'My Great Bot',
        subscriptionKey: '54353252532',
        type: 'luis',
        version: '0.1',
      },
    ],
  },
];
let mockArgsPassedToFetch;
jest.mock('node-fetch', () => {
  const fetch = (url, headers) => {
    mockArgsPassedToFetch.push({ url, headers });
    return {
      ok: true,
      json: async () => mockResponses.shift(),
      text: async () => mockResponses.shift(),
    };
  };
  (fetch as any).Headers = class {};
  (fetch as any).Response = class {};
  return fetch;
});

describe('The LuisApiService class', () => {
  let result = undefined;
  beforeEach(async () => {
    mockArgsPassedToFetch = [];
    const it = LuisApi.getServices(mockArmToken);
    result = undefined;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const next = it.next(result);
      if (next.done) {
        result = next.value;
        break;
      }
      try {
        result = await next.value;
      } catch (e) {
        break;
      }
    }
  });
  it('should retrieve the luis models when given an arm token', async () => {
    expect(result.services.length).toBe(1);
    expect(mockArgsPassedToFetch.length).toBe(4);
    expect(mockArgsPassedToFetch[0]).toEqual({
      url: 'https://api.luis.ai/api/v2.0/bots/programmatickey',
      headers: {
        headers: {
          Authorization: 'Bearer bm90aGluZw.eyJ1cG4iOiJnbGFzZ293QHNjb3RsYW5kLmNvbSJ9.7gjdshgfdsk98458205jfds9843fjds',
        },
      },
    });

    expect(mockArgsPassedToFetch[1]).toEqual({
      url: 'https://api.eu.luis.ai/api/v2.0/bots/programmatickey',
      headers: expect.any(Object),
    });

    expect(mockArgsPassedToFetch[2]).toEqual({
      url: 'https://api.au.luis.ai/api/v2.0/bots/programmatickey',
      headers: expect.any(Object),
    });

    expect(mockArgsPassedToFetch[3]).toEqual({
      url: 'https://westus.api.cognitive.microsoft.com/luis/api/v2.0/apps/',
      headers: expect.any(Object),
    });
  });
});
