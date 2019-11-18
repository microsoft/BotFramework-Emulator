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

import { EndpointSet } from './endpointSet';
import { BotEndpoint } from './botEndpoint';

const mockId = '1234';
jest.mock('../utils/uniqueId', () => ({
  uniqueId: jest.fn(() => mockId),
}));
let mockDecodedToken;
jest.mock('on-error-resume-next', () => jest.fn(() => mockDecodedToken));

describe('Endpoints', () => {
  let endpoints: EndpointSet;
  const mockFetch = jest.fn(() => null);

  beforeEach(() => {
    endpoints = new EndpointSet(mockFetch);
    mockDecodedToken = { endpointId: 'someOtherId' };
  });

  it('should push an endpoint', () => {
    const id = 'someId';
    const botEndpoint = {
      botId: 'someBotId',
      botUrl: 'someBotUrl',
      msaAppId: 'someMsaAppId',
      msaPassword: 'someMsaPassword',
      use10Tokens: false,
      channelService: undefined,
    };
    // with an id
    let pushedEndpoint = endpoints.set(id, botEndpoint);

    expect(pushedEndpoint).toEqual(
      new BotEndpoint(
        id,
        botEndpoint.botId,
        botEndpoint.botUrl,
        botEndpoint.msaAppId,
        botEndpoint.msaPassword,
        botEndpoint.use10Tokens,
        botEndpoint.channelService,
        {
          fetch: mockFetch,
        }
      )
    );
    expect((endpoints as any)._endpoints[id]).toEqual(pushedEndpoint);

    // with no id
    pushedEndpoint = endpoints.set('', botEndpoint);

    expect(pushedEndpoint).toEqual(
      new BotEndpoint(
        botEndpoint.botUrl, // url will be used in place of id
        botEndpoint.botId,
        botEndpoint.botUrl,
        botEndpoint.msaAppId,
        botEndpoint.msaPassword,
        botEndpoint.use10Tokens,
        botEndpoint.channelService,
        {
          fetch: mockFetch,
        }
      )
    );
    expect((endpoints as any)._endpoints[botEndpoint.botUrl]).toEqual(pushedEndpoint);

    // with no id or url
    botEndpoint.botUrl = '';
    pushedEndpoint = endpoints.set('', botEndpoint);

    expect(pushedEndpoint).toEqual(
      new BotEndpoint(
        mockId, // unique id will be used in place of id
        botEndpoint.botId,
        botEndpoint.botUrl,
        botEndpoint.msaAppId,
        botEndpoint.msaPassword,
        botEndpoint.use10Tokens,
        botEndpoint.channelService,
        {
          fetch: mockFetch,
        }
      )
    );
    expect((endpoints as any)._endpoints[mockId]).toEqual(pushedEndpoint);
  });

  it('should reset the endpoints store', () => {
    const endpoint = { botUrl: 'http://localhost:3978/api/messages' };
    (endpoints as any)._endpoints['someId'] = endpoint;

    expect((endpoints as any)._endpoints['someId']).toBe(endpoint);
    endpoints.clear();
    expect((endpoints as any)._endpoints['someId']).toBe(undefined);
  });

  it('should get a default endpoint', () => {
    const endpoint1 = { botUrl: 'http://localhost:3978/api/messages' };
    const endpoint2 = { botUrl: 'https://mybot.azurewebsites.net/api/messages' };
    (endpoints as any)._endpoints['id1'] = endpoint1;
    (endpoints as any)._endpoints['id2'] = endpoint2;

    expect(endpoints.getDefault()).toBe(endpoint1);
  });

  it('should get an endpoint if it is already in the store indexed by id', () => {
    const endpoint = { botUrl: 'http://localhost:3978/api/messages' };
    (endpoints as any)._endpoints['id1'] = endpoint;

    expect(endpoints.get('id1')).toBe(endpoint);
  });

  it('should get an endpoint if it is already in the store, but the id is encoded in base64 ', () => {
    const endpoint = { botUrl: 'http://localhost:3978/api/messages' };
    (endpoints as any)._endpoints['someOtherId'] = endpoint;

    expect(endpoints.get('id1')).toBe(endpoint);
  });

  it('should return null if the endpoint is not in the store', () => {
    mockDecodedToken = {};

    expect(endpoints.get('id1')).toBe(null);
  });

  it('should get an endpoint by MSA app id', () => {
    const endpoint = { botUrl: 'http://localhost:3978/api/messages', msaAppId: 'someMsaAppId' };
    (endpoints as any)._endpoints['someId'] = endpoint;

    expect(endpoints.getByAppId('someMsaAppId')).toBe(endpoint);
  });

  it('should get all endpoints', () => {
    const endpoint1 = {
      botId: 'botId1',
      botUrl: 'botUrl1',
      msaAppId: 'msaAppId1',
      msaPassword: 'msaPassword1',
      use10Tokens: 'use10Tokens1',
    };
    const endpoint2 = {
      botId: 'botId2',
      botUrl: 'botUrl2',
      msaAppId: 'msaAppId2',
      msaPassword: 'msaPassword2',
      use10Tokens: 'use10Tokens2',
    };
    const endpoint3 = {
      botId: 'botId3',
      botUrl: 'botUrl3',
      msaAppId: 'msaAppId3',
      msaPassword: 'msaPassword3',
      use10Tokens: 'use10Tokens3',
    };
    (endpoints as any)._endpoints['id1'] = endpoint1;
    (endpoints as any)._endpoints['id2'] = endpoint2;
    (endpoints as any)._endpoints['id3'] = endpoint3;

    expect(endpoints.getAll()).toEqual({
      id1: endpoint1,
      id2: endpoint2,
      id3: endpoint3,
    });
  });
});
