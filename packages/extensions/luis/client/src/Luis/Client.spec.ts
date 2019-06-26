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

import { LuisAppInfo } from '../Models/LuisAppInfo';

import { LuisClient } from './Client';

jest.mock('lscache', () => ({
  get: () => null,
  set: () => null,
}));

describe('LUIS API client', () => {
  const appInfo: LuisAppInfo = {
    appId: 'someAppId',
    key: 'someAuthKey',
    appInfo: {
      authorized: true,
      isDispatchApp: false,
      appId: 'someAppId',
    },
  };

  it('should configure the client when initialized', () => {
    const client = new LuisClient(appInfo);

    expect((client as any).luisAppInfo).toBe(appInfo);
    expect((client as any)._client).toBeTruthy();
  });

  describe('calling the API', () => {
    let client: LuisClient;
    const mockGetApp = jest
      .fn()
      .mockResolvedValue({ _response: { status: 200, parsedBody: { activeVersion: '1.0' } } });
    const mockListApps = jest.fn().mockResolvedValue([]);
    const mockListIntents = jest.fn().mockResolvedValue({ _response: { parsedBody: [] } });
    const mockAddExample = jest.fn().mockResolvedValue({ _response: { status: 201 } });
    const mockPublishApp = jest.fn().mockResolvedValue({ _response: { status: 201 } });
    const mockTrainVersion = jest.fn().mockResolvedValue({ _response: { status: 202 } });
    const mockGetStatus = jest.fn().mockResolvedValue({ _response: { status: 200 }, every: () => true });
    const mockClient = {
      apps: {
        get: mockGetApp,
        list: mockListApps,
        publish: mockPublishApp,
      },
      examples: {
        add: mockAddExample,
      },
      model: {
        listIntents: mockListIntents,
      },
      train: {
        getStatus: mockGetStatus,
        trainVersion: mockTrainVersion,
      },
    };

    beforeEach(() => {
      client = new LuisClient(appInfo);
      (client as any).configureClient = jest.fn(() => {
        (client as any)._client = mockClient;
      });
      mockAddExample.mockClear();
      mockGetApp.mockClear();
      mockGetStatus.mockClear();
      mockListApps.mockClear();
      mockListIntents.mockClear();
      mockPublishApp.mockClear();
      mockTrainVersion.mockClear();
    });

    it('should get the apps for the logged in user', async () => {
      expect(await client.getLoggedInUserApps()).toEqual([]);
    });

    it('should get the intents for an application', async () => {
      expect(await client.getApplicationIntents(appInfo.appInfo)).toEqual([]);
    });

    it('should reassign an intent', async () => {
      const mockLuisResponse: any = {
        query: 'i am some utterance',
        entities: [{ type: 'builtin.location', startIndex: 0, endIndex: 5 }],
      };
      try {
        await client.reassignIntent(appInfo.appInfo, mockLuisResponse, 'someIntent');
      } catch (e) {
        // fail test
        throw new Error('Test failed');
      }
    });

    it('should throw if reassigning an intent fails', async () => {
      const mockLuisResponse: any = {
        query: 'i am some utterance',
        entities: [{ type: 'builtin.location', startIndex: 0, endIndex: 5 }],
      };
      mockAddExample.mockResolvedValueOnce({ _response: { status: 401 } });
      try {
        await client.reassignIntent(appInfo.appInfo, mockLuisResponse, 'someIntent');
        // fail test
        throw new Error('Test failed');
      } catch (e) {
        expect(e).toEqual(new Error('Failed to add label - HTTP Status Code: 401'));
      }
    });

    it('should publish an app', async () => {
      const mockAppInfo: any = {
        activeVersion: '1.0',
        appId: 'someAppId',
        endpoints: { PRODUCTION: { endpointRegion: 'westus' } },
      };
      try {
        await client.publish(mockAppInfo, false);
      } catch (e) {
        throw new Error('Test failed');
      }
    });

    it('should throw if publishing an app fails', async () => {
      const mockAppInfo: any = {
        activeVersion: '1.0',
        appId: 'someAppId',
        endpoints: { PRODUCTION: { endpointRegion: 'westus' } },
      };
      mockPublishApp.mockResolvedValueOnce({ _response: { status: 401 } });
      try {
        await client.publish(mockAppInfo, false);
        // fail test
        throw new Error('Test failed');
      } catch (e) {
        expect(e).toEqual(new Error('Publish Failed - HTTP Status Code: 401'));
      }
    });

    it('should throw if no region is provided for publishing', async () => {
      const mockAppInfo: any = { endpoints: { STAGING: {} } };
      try {
        await client.publish(mockAppInfo, true);
        // fail test
        throw new Error('Test failed');
      } catch (e) {
        expect(e).toEqual(new Error('Unknown publishing region'));
      }
    });

    it('should get the info for the application', async () => {
      const info = await client.getApplicationInfo();

      expect(info).toEqual({ activeVersion: '1.0', authorized: true, appId: 'someAppId', isDispatchApp: false });
    });

    it('should return a minimized info object if unauthorized', async () => {
      mockGetApp.mockResolvedValueOnce({ _response: { status: 401 } });
      const info = await client.getApplicationInfo();

      expect(info).toEqual({
        authorized: false,
        activeVersion: 'Unknown',
        name: null,
        appId: 'someAppId',
        endpoints: {},
        isDispatchApp: false,
      });
    });

    it('should return a minimized info object if the app is the built-in Cortana app', async () => {
      mockGetApp.mockResolvedValueOnce({ _response: { status: 401 } });
      (client as any).luisAppInfo.appId = 'c413b2ef-382c-45bd-8ff0-f76d60e2a821';
      const info = await client.getApplicationInfo();

      expect(info).toEqual({
        authorized: false,
        activeVersion: 'Unknown',
        name: null,
        appId: 'c413b2ef-382c-45bd-8ff0-f76d60e2a821',
        endpoints: {},
        isDispatchApp: false,
      });
    });

    it('should throw if getting the application info fails', async () => {
      mockGetApp.mockResolvedValueOnce({ _response: { status: 500 } });
      try {
        await client.getApplicationInfo();
        // fail test
        throw new Error('Test failed');
      } catch (e) {
        expect(e).toEqual(new Error('Failed to get the Azure App Info - HTTP Status Code: 500'));
      }
    });

    it('should train the app', async () => {
      const result = await client.train({} as any);

      expect(result).toBe(undefined);
    });

    it('should throw if queueing the training request fails', async () => {
      mockTrainVersion.mockResolvedValueOnce({ _response: { status: 500 } });
      try {
        await client.train({} as any);
        // fail test
        throw new Error('Test failed');
      } catch (e) {
        expect(e).toEqual(new Error('Failed to queue training request - HTTP Status Code: 500'));
      }
    });

    it('should throw if training fails', async () => {
      mockGetStatus.mockResolvedValue({ _response: { status: 201 } });
      try {
        await client.train({} as any);
        // fail test
        throw new Error('Test failed');
      } catch (e) {
        expect(e).toEqual('Failed to train the application');
      }
    }, 16000 /* polling for training status times out after 15 seconds */);
  });
});
