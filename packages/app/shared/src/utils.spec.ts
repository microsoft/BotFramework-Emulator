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

import { BotConfigWithPath } from '@bfemulator/sdk-shared';
import { IEndpointService, ServiceTypes } from 'botframework-config/lib/schema';

import {
  isObject,
  deepCopySlow,
  isLinux,
  isMac,
  isWindows,
  newBot,
  newEndpoint,
  getFirstBotEndpoint,
  newNotification,
} from './utils';
import { NotificationType } from './types';

describe('utility function tests', () => {
  test('isObject()', () => {
    const someObj = { a: 1, b: 'someString', c: false };
    const notObj1 = [1, 2, 3];
    const notObj2 = 'someStr';
    const notObj3 = null;

    expect(isObject(someObj)).toBe(true);
    expect(isObject(notObj1)).toBe(false);

    expect(isObject(notObj2)).toBe(false);
    expect(isObject(notObj3)).toBe(false);
  });

  test('deepCopySlow()', () => {
    const a = { outer: 3, inner: { prop: ':)' } };
    const b = deepCopySlow(a);

    expect(b).toEqual(a);
    expect(b).not.toBe(a);
  });

  test('newBot()', () => {
    const bot1 = newBot();
    const bot2: BotConfigWithPath = {
      name: 'someName',
      description: 'someDescription',
      padlock: 'somePadlock',
      services: [],
    };
    const bot3 = newBot(bot2);

    expect(bot1.name).toBe('');
    expect(bot1.description).toBe('');
    expect(bot1.services).toHaveLength(0);

    expect(bot3.name).toBe('someName');
    expect(bot3.description).toBe('someDescription');
    expect(bot3.padlock).toBe('somePadlock');
  });

  test('newEndpoint()', () => {
    const endpoint1 = newEndpoint();
    const endpoint2: IEndpointService = {
      id: 'someId',
      endpoint: 'someEndpoint',
      type: ServiceTypes.Endpoint,
      appId: 'someAppId',
      appPassword: 'someAppPw',
      name: 'someName',
    };
    const endpoint3 = newEndpoint(endpoint2);

    expect(endpoint1.type).toBe(ServiceTypes.Endpoint);
    expect(endpoint1.id).toBeTruthy();
    expect(endpoint1.endpoint).toBe('http://localhost:3978/api/messages');

    expect(endpoint3.id).toBe('someId');
    expect(endpoint3.endpoint).toBe('someEndpoint');
    expect(endpoint3.appId).toBe('someAppId');
    expect(endpoint3.appPassword).toBe('someAppPw');
    expect(endpoint3.name).toBe('someName');
  });

  test('getFirstBotEndpoint()', () => {
    const endpoint: IEndpointService = {
      id: 'someId',
      endpoint: 'someEndpoint',
      type: ServiceTypes.Endpoint,
      appId: 'someAppId',
      appPassword: 'someAppPw',
      name: 'someName',
    };
    const bot: BotConfigWithPath = {
      name: 'someName',
      description: 'someDescription',
      padlock: 'somePadlock',
      services: [endpoint],
    };

    expect(getFirstBotEndpoint(bot)).toBe(endpoint);
  });

  test('newNotification()', () => {
    const notif = newNotification('someMessage');

    expect(notif.message).toBe('someMessage');
    expect(notif.type).toBe(NotificationType.Info);
  });
});

describe('isMac() and isLinux()', () => {
  let originalPlatform;

  beforeEach(() => {
    originalPlatform = process.platform;
  });

  afterEach(() => {
    Object.defineProperty(process, 'platform', { value: originalPlatform });
  });

  it('returns true when platform is darwin', () => {
    Object.defineProperty(process, 'platform', { value: 'darwin' });
    expect(isMac()).toBe(true);
  });

  it('returns false when platform is not darwin', () => {
    Object.defineProperty(process, 'platform', { value: 'something-else' });
    expect(isMac()).toBe(false);
  });

  it('returns true when platform is linux', () => {
    Object.defineProperty(process, 'platform', { value: 'linux' });
    expect(isLinux()).toBe(true);
  });

  it('returns false when platform is not linux', () => {
    Object.defineProperty(process, 'platform', { value: 'something-else' });
    expect(isLinux()).toBe(false);
  });

  it('returns true when platform is windows', () => {
    Object.defineProperty(process, 'platform', { value: 'win32' });
    expect(isWindows()).toBe(true);
  });

  it('returns false when platform is not windows', () => {
    Object.defineProperty(process, 'platform', { value: 'something-else' });
    expect(isWindows()).toBe(false);
  });
});
