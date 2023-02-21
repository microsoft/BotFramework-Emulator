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
import { QnaApiService } from './qnaApiService';

const mockArmToken = 'bm90aGluZw.eyJ1cG4iOiJnbGFzZ293QHNjb3RsYW5kLmNvbSJ9.7gjdshgfdsk98458205jfds9843fjds';
const mockResponsesTemplate = [
  {
    value: [
      {
        id: '/subscriptions/1234',
        subscriptionId: '1234',
        tenantId: '1234',
        displayName: 'Pretty nice Service',
        state: 'Enabled',
        subscriptionPolicies: {
          locationPlacementId: 'Public_2014-09-01',
          quotaId: 'MSDN_2014-09-01',
          spendingLimit: 'On',
        },
        authorizationSource: 'Legacy',
      },
      {
        id: '/subscriptions/1234',
        subscriptionId: '1234',
        tenantId: '43211',
        displayName: 'A useful service',
        state: 'Enabled',
        subscriptionPolicies: {
          locationPlacementId: 'Internal_2014-09-01',
          quotaId: 'Internal_2014-09-01',
          spendingLimit: 'Off',
        },
        authorizationSource: 'RoleBased',
      },
    ],
  },
  {
    value: [
      {
        id: '/subscriptions/1234',
        name: 'QnaMaker',
        type: 'Microsoft.CognitiveServices/accounts',
        etag: "'4321'",
        location: 'westus',
        sku: {
          name: 'F0',
        },
        kind: 'QnAMaker',
        properties: {
          endpoint: 'https://westus.api.cognitive.microsoft.com/qnamaker/v4.0',
          internalId: '0000',
          dateCreated: '2018-08-03T17:06:20.8718086Z',
          apiProperties: {
            qnaRuntimeEndpoint: 'https://juwilabyqnamaker.azurewebsites.net',
          },
          provisioningState: 'Succeeded',
        },
      },
    ],
  },
  {
    value: [
      {
        id: '/subscriptions/12324',
        name: 'FAQ2',
        type: 'Microsoft.CognitiveServices/accounts',
        etag: "'1234'",
        location: 'westus',
        sku: {
          name: 'F0',
        },
        kind: 'QnAMaker',
        properties: {
          endpoint: 'https://westus.api.cognitive.microsoft.com/qnamaker/v4.0',
          internalId: '4321',
          dateCreated: '2018-05-08T14:55:01.0888756Z',
          apiProperties: {
            qnaRuntimeEndpoint: 'https://faq2.azurewebsites.net',
          },
          provisioningState: 'Succeeded',
        },
      },
    ],
  },
  { key1: 4444 },
  { key1: 5555 },
  {
    primaryEndpointKey: 'primary-endpoint-key-1',
    secondaryEndpointKey: 'secondary-endpoint-key-1',
  },
  {
    knowledgebases: [
      {
        id: '1234',
        hostName: 'https://localhost',
        lastAccessedTimestamp: '2018-08-21T20:27:35Z',
        lastChangedTimestamp: '2018-08-03T17:12:44Z',
        name: 'HIThere#1',
        userId: '1234',
        urls: ['https://localhost'],
        sources: [],
      },
    ],
  },
  {
    primaryEndpointKey: 'primary-endpoint-key-2',
    secondaryEndpointKey: 'secondary-endpoint-key-2',
  },
  {
    knowledgebases: [
      {
        id: '9876543',
        hostName: 'https://localhost',
        lastAccessedTimestamp: '2018-08-21T20:27:35Z',
        lastChangedTimestamp: '2018-08-03T17:12:44Z',
        name: 'HIThere#2',
        userId: '9876543',
        urls: ['https://localhost'],
        sources: [],
      },
    ],
  },
];

const mockArgsPassedToFetch = [];
let mockResponses;

(global as any).fetch = jest.fn();
(fetch as any).mockImplementation((url, headers) => {
  mockArgsPassedToFetch.push({ url, headers });

  return {
    ok: true,
    json: async () => mockResponses.shift(),
    text: async () => mockResponses.shift(),
  };
});

describe('The QnaApiService happy path', () => {
  let result;

  beforeAll(() => (mockResponses = JSON.parse(JSON.stringify(mockResponsesTemplate))));

  beforeEach(async () => {
    mockArgsPassedToFetch.length = 0;
    result = await getResult();
  });

  it('should retrieve the QnA Kbs when given an arm token', async () => {
    expect(result.services.length).toBe(2);
    expect(mockArgsPassedToFetch.length).toBe(9);
    expect(mockArgsPassedToFetch[0]).toEqual({
      headers: {
        headers: {
          'x-ms-date': expect.any(String),
          Accept: 'application/json, text/plain, */*',
          Authorization: 'Bearer bm90aGluZw.eyJ1cG4iOiJnbGFzZ293QHNjb3RsYW5kLmNvbSJ9.7gjdshgfdsk98458205jfds9843fjds',
        },
      },
      url: 'https://management.azure.com/subscriptions?api-version=2018-07-01',
    });

    expect(mockArgsPassedToFetch[1]).toEqual({
      headers: {
        headers: {
          'x-ms-date': expect.any(String),
          Accept: 'application/json, text/plain, */*',
          Authorization: 'Bearer bm90aGluZw.eyJ1cG4iOiJnbGFzZ293QHNjb3RsYW5kLmNvbSJ9.7gjdshgfdsk98458205jfds9843fjds',
        },
      },
      url:
        'https://management.azure.com//subscriptions/1234/providers' +
        '/Microsoft.CognitiveServices/accounts?api-version=2017-04-18',
    });

    expect(mockArgsPassedToFetch[2]).toEqual({
      headers: {
        headers: {
          'x-ms-date': expect.any(String),
          Accept: 'application/json, text/plain, */*',
          Authorization: 'Bearer bm90aGluZw.eyJ1cG4iOiJnbGFzZ293QHNjb3RsYW5kLmNvbSJ9.7gjdshgfdsk98458205jfds9843fjds',
        },
      },
      url:
        'https://management.azure.com//subscriptions/1234/providers/Microsoft.CognitiveServices/accounts' +
        '?api-version=2017-04-18',
    });

    expect(mockArgsPassedToFetch[3]).toEqual({
      url: 'https://management.azure.com//subscriptions/1234/listKeys?api-version=2017-04-18',
      headers: {
        headers: {
          'x-ms-date': expect.any(String),
          Authorization: 'Bearer bm90aGluZw.eyJ1cG4iOiJnbGFzZ293QHNjb3RsYW5kLmNvbSJ9.7gjdshgfdsk98458205jfds9843fjds',
          Accept: 'application/json, text/plain, */*',
        },
        method: 'POST',
      },
    });

    expect(mockArgsPassedToFetch[4]).toEqual({
      url: 'https://management.azure.com//subscriptions/12324/listKeys?api-version=2017-04-18',
      headers: {
        headers: {
          'x-ms-date': expect.any(String),
          Authorization: 'Bearer bm90aGluZw.eyJ1cG4iOiJnbGFzZ293QHNjb3RsYW5kLmNvbSJ9.7gjdshgfdsk98458205jfds9843fjds',
          Accept: 'application/json, text/plain, */*',
        },
        method: 'POST',
      },
    });

    expect(mockArgsPassedToFetch[5]).toEqual({
      url: 'https://westus.api.cognitive.microsoft.com/qnamaker/v4.0/endpointkeys/',
      headers: {
        headers: {
          'Ocp-Apim-Subscription-Key': 5555,
          'Content-Type': 'application/json; charset=utf-8',
        },
      },
    });

    expect(mockArgsPassedToFetch[6]).toEqual({
      url: 'https://westus.api.cognitive.microsoft.com/qnamaker/v4.0/knowledgebases/',
      headers: {
        headers: {
          'Ocp-Apim-Subscription-Key': 5555,
          'Content-Type': 'application/json; charset=utf-8',
        },
      },
    });

    expect(mockArgsPassedToFetch[7]).toEqual({
      url: 'https://westus.api.cognitive.microsoft.com/qnamaker/v4.0/endpointkeys/',
      headers: {
        headers: {
          'Ocp-Apim-Subscription-Key': 4444,
          'Content-Type': 'application/json; charset=utf-8',
        },
      },
    });

    expect(mockArgsPassedToFetch[8]).toEqual({
      url: 'https://westus.api.cognitive.microsoft.com/qnamaker/v4.0/knowledgebases/',
      headers: {
        headers: {
          'Ocp-Apim-Subscription-Key': 4444,
          'Content-Type': 'application/json; charset=utf-8',
        },
      },
    });

    expect(result.services).toEqual([
      {
        endpointKey: 'primary-endpoint-key-1',
        hostname: 'https://localhost/qnamaker',
        id: '1234',
        kbId: '1234',
        name: 'HIThere#1',
        subscriptionKey: 4444,
        type: 'qna',
      },
      {
        endpointKey: 'primary-endpoint-key-2',
        hostname: 'https://localhost/qnamaker',
        id: '9876543',
        kbId: '9876543',
        name: 'HIThere#2',
        subscriptionKey: 5555,
        type: 'qna',
      },
    ]);
  });
});

describe('The QnAMakerApi sad path', () => {
  beforeEach(() => {
    mockResponses = JSON.parse(JSON.stringify(mockResponsesTemplate));
  });

  it('should return an empty payload with an error if no subscriptions are found', async () => {
    mockResponses = [{ value: [] }, { value: [] }];
    const result = await getResult();
    expect(result).toEqual({ services: [], code: 1 });
  });

  it('should return an empty payload with an error if no accounts are found', async () => {
    mockResponses[1] = mockResponses[2] = { value: [] };
    const result = await getResult();
    expect(result).toEqual({ services: [], code: 2 });
  });

  it('should return an empty payload with an error if no keys are found', async () => {
    mockResponses[3] = mockResponses[4] = { value: [] };
    const result = await getResult();
    expect(result).toEqual({ services: [], code: 2 });
  });

  it('should return an empty payload if endpointKey request fails', async () => {
    (fetch as any).mockImplementation(url => {
      let ok = true;

      if (url.includes('endpointkeys')) {
        ok = false;
        mockResponses.shift();
      }

      return {
        ok,
        json: async () => mockResponses.shift(),
        text: async () => mockResponses.shift(),
      };
    });

    const result = await getResult();
    expect(result).toEqual({ services: [], code: 0 });
  });

  it('should return an empty payload if knowledgebase request fails', async () => {
    (fetch as any).mockImplementation(url => {
      let ok = true;

      if (url.includes('knowledgebases')) {
        ok = false;
        mockResponses.shift();
      }

      return {
        ok,
        json: async () => mockResponses.shift(),
        text: async () => mockResponses.shift(),
      };
    });

    const result = await getResult();
    expect(result).toEqual({ services: [], code: 0 });
  });
});

async function getResult() {
  const it = QnaApiService.getKnowledgeBases(mockArmToken);
  let result = undefined;
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
  return result;
}
