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

import { SharedConstants } from '@bfemulator/app-shared';

import { navigate } from './hyperlinkHandler';

let mockParse;
jest.mock('url', () => ({
  get parse() {
    return mockParse;
  },
}));

const mockUniqueId = 'id1234';
jest.mock('@bfemulator/sdk-shared', () => ({
  uniqueId: () => mockUniqueId,
}));

let mockRemoteCallsMade;
let mockRemoteCall;
jest.mock('./platform/commands/commandServiceImpl', () => ({
  CommandServiceImpl: {
    get remoteCall() {
      return mockRemoteCall;
    },
  },
}));

describe('hyperlinkHandler', () => {
  beforeEach(() => {
    mockParse = jest.fn(url => {
      if (url) {
        const parts = url.split(':');
        return { protocol: parts[0] + ':' || '' };
      } else {
        return '';
      }
    });
    mockRemoteCallsMade = [];
    (window as any)._openExternal.mockClear();
    mockRemoteCall = jest.fn((commandName: string, ...args: any[]) => {
      mockRemoteCallsMade.push({ commandName, args });
      return Promise.resolve(true);
    });
  });

  it('should navigate to an emulated ouath url', async () => {
    const url = 'oauth://someoauthurl.com/auth&&&ending';
    await navigate(url);

    expect(mockRemoteCallsMade).toHaveLength(1);
    expect(mockRemoteCallsMade[0].commandName).toBe(SharedConstants.Commands.OAuth.SendTokenResponse);
    expect(mockRemoteCallsMade[0].args).toEqual(['someoauthurl.com/auth', 'ending', 'emulatedToken_' + mockUniqueId]);
  });

  it('should navigate to an ouath url', async () => {
    const url = 'oauthlink://someoauthurl.com/auth&&&ending';
    await navigate(url);

    expect(mockRemoteCallsMade).toHaveLength(1);
    expect(mockRemoteCallsMade[0].commandName).toBe(SharedConstants.Commands.OAuth.CreateOAuthWindow);
    expect(mockRemoteCallsMade[0].args).toEqual(['someoauthurl.com/auth', 'ending']);
  });

  it('should open a data url', async () => {
    const url = 'data:image/png;base64;somedata';
    await navigate(url);

    expect(mockRemoteCallsMade).toHaveLength(1);
    expect(mockRemoteCallsMade[0].commandName).toBe(SharedConstants.Commands.Telemetry.TrackEvent);
    expect(mockRemoteCallsMade[0].args).toEqual(['app_openLink', { url }]);
    expect((window as any)._openExternal).not.toHaveBeenCalled();
  });

  it('should open a normal url', async () => {
    const url = 'https://aka.ms/bot-framework-emulator';
    await navigate(url);

    expect(mockRemoteCallsMade).toHaveLength(1);
    expect(mockRemoteCallsMade[0].commandName).toBe(SharedConstants.Commands.Telemetry.TrackEvent);
    expect(mockRemoteCallsMade[0].args).toEqual(['app_openLink', { url }]);
    expect((window as any)._openExternal).toHaveBeenCalled();
    expect((window as any)._openExternal).toHaveBeenCalledWith(url, { activate: true });
  });

  it('should track opening a url on a throw', async () => {
    mockParse = jest.fn(() => {
      throw new Error();
    });
    const url = '';
    await navigate(url);

    expect(mockRemoteCallsMade).toHaveLength(1);
    expect(mockRemoteCallsMade[0].commandName).toBe(SharedConstants.Commands.Telemetry.TrackEvent);
    expect(mockRemoteCallsMade[0].args).toEqual(['app_openLink', { url }]);
    expect((window as any)._openExternal).toHaveBeenCalled();
    expect((window as any)._openExternal).toHaveBeenCalledWith(url, { activate: true });
  });
});
