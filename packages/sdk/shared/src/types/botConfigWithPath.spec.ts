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

import { ServiceTypes } from 'botframework-config/lib/schema';

import { BotConfigWithPathImpl } from './botConfigWithPath';

describe('BotConfigWithPathTypes tests', () => {
  describe('fromJSON() functionality', () => {
    const endpointService = {
      type: ServiceTypes.Endpoint,
      name: 'someEndpointName',
      id: 'someEndpointUrl',
      appId: 'someEndpointAppId',
      appPassword: 'someEndpointAppPw',
      endpoint: 'someEndpointUrl',
    };

    it('should work on object literals', () => {
      const constructedBotConfig = BotConfigWithPathImpl.fromJSON({
        name: 'someBotName',
        description: 'some bot description',
        services: [endpointService],
        path: 'somePath',
        overrides: {
          endpoint: {
            endpoint: 'someOverriddenEndpoint',
            name: 'someOverriddenEndpointName',
            appId: 'someOverriddenEndpointAppId',
          },
        },
      });

      expect(constructedBotConfig.name).toBe('someBotName');
      expect(constructedBotConfig.description).toBe('some bot description');
      expect(constructedBotConfig.path).toBe('somePath');
      expect(constructedBotConfig.services[0]).toEqual(endpointService);
      expect(constructedBotConfig.overrides).toEqual({
        endpoint: {
          endpoint: 'someOverriddenEndpoint',
          name: 'someOverriddenEndpointName',
          appId: 'someOverriddenEndpointAppId',
        },
      });
    });

    it('should not truncate extraneous properties on variables', () => {
      const botConfigVariable = {
        name: 'someBotName',
        description: 'some bot description',
        services: [endpointService],
        path: 'somePath',
        overrides: {
          endpoint: {
            endpoint: 'someOverriddenEndpoint',
            name: 'someOverriddenEndpointName',
            appId: 'someOverriddenEndpointAppId',
          },
        },
        extraneousProp: true,
      };

      const constructedBotConfig = BotConfigWithPathImpl.fromJSON(botConfigVariable);

      expect(constructedBotConfig.name).toBe('someBotName');
      expect(constructedBotConfig.description).toBe('some bot description');
      expect(constructedBotConfig.path).toBe('somePath');
      expect(constructedBotConfig.services[0]).toEqual(endpointService);
      expect(constructedBotConfig.overrides).toEqual({
        endpoint: {
          endpoint: 'someOverriddenEndpoint',
          name: 'someOverriddenEndpointName',
          appId: 'someOverriddenEndpointAppId',
        },
      });
      expect(Object.keys(constructedBotConfig)).toContain('extraneousProp');
    });

    it('should serialize correctly', () => {
      const botConfig = BotConfigWithPathImpl.fromJSON({
        name: 'someBotName',
        description: 'some description',
        path: 'somePath',
        padlock: null,
        services: [],
        overrides: {},
      });

      const serializedVersion = JSON.stringify(botConfig);
      expect(serializedVersion.includes('path')).toBe(true);
    });
  });
});
