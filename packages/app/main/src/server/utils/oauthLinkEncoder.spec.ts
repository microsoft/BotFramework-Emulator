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

import { AttachmentContentTypes } from '@bfemulator/sdk-shared';
import { SharedConstants } from '@bfemulator/app-shared';

import { OAuthLinkEncoder } from './oauthLinkEncoder';

jest.mock('./uniqueId', () => ({
  uniqueId: () => 'fgfdsggf5432534',
}));

const mockArgsSentToFetch = [];
let ok = true;
let statusText = '';
let shouldThrow = false;

describe('The OauthLinkEncoder', () => {
  let encoder: OAuthLinkEncoder;

  beforeAll(() => {
    (global as any).fetch = async (...args) => {
      mockArgsSentToFetch.push(args);
      if (shouldThrow) {
        throw new Error("I'm in your throw!");
      }
      return {
        text: async () => 'im in your text!',
        ok,
        statusText,
      };
    };
  });

  beforeEach(() => {
    ok = true;
    statusText = '';
    shouldThrow = false;
    mockArgsSentToFetch.length = 0;
    const emulatorServer = {
      getServiceUrl: async () => 'http://localhost',
      state: {
        conversations: {
          conversationById: () => ({
            codeVerifier: '5432654365475677647655676542524352563457',
            botEndpoint: {
              botUrl: 'http://botbot.bot',
            },
            conversationId: 'testConversation',
          }),
        },
      },
    };
    encoder = new OAuthLinkEncoder(
      emulatorServer as any,
      'Bearer 54k52n',
      {
        attachments: [{ contentType: AttachmentContentTypes.oAuthCard }],
        text: 'a message',
      },
      'testConversation'
    );
  });

  it('should resolveOAuthCards as expected with the happy path', async () => {
    const mockActivity = {
      attachments: [
        {
          contentType: AttachmentContentTypes.oAuthCard,
          content: {
            buttons: [{ type: 'signin' }],
          },
        },
      ],
      text: 'a message',
    };
    await encoder.resolveOAuthCards(mockActivity);
    expect(mockActivity.attachments[0].content.buttons[0]).toEqual({
      type: 'openUrl',
      value: 'oauthlink://im in your text!&&&testConversation',
    });
  });

  it('should throw when an error occurs retrieving the link while calling resolveOAuthCards, but should also generate an emulated oauth link', async () => {
    ok = false;
    statusText = 'oh noes!';
    const mockActivity = {
      attachments: [
        {
          contentType: AttachmentContentTypes.oAuthCard,
          content: {
            buttons: [{ type: 'signin', value: undefined }],
            connectionName: 'oauth-connection',
          },
        },
      ],
      text: 'a message',
    };
    try {
      await encoder.resolveOAuthCards(mockActivity);
      expect(false);
    } catch (e) {
      expect(e.message).toEqual(`Failed to generate an actual sign-in link: Error: ${statusText}`);
      expect(mockActivity.attachments[0].content.buttons[0].type).toBe('openUrl');
      expect(mockActivity.attachments[0].content.buttons[0].value).toBe(
        SharedConstants.EmulatedOAuthUrlProtocol + '//' + 'oauth-connection' + '&&&' + 'testConversation'
      );
    }
  });

  it('should throw if fetch throws', async () => {
    shouldThrow = true;
    const mockActivity = {
      attachments: [
        {
          contentType: AttachmentContentTypes.oAuthCard,
          content: {
            buttons: [{ type: 'signin' }],
          },
        },
      ],
      text: 'a message',
    };
    try {
      await encoder.resolveOAuthCards(mockActivity);
      expect(false);
    } catch (e) {
      expect(e.message).toEqual(`Failed to generate an actual sign-in link: Error: ${"I'm in your throw!"}`);
    }
  });

  it('should generateCodeVerifier as expected', async () => {
    const v = encoder.generateCodeVerifier('testConversation');
    expect(v).toBe('84731c2a08da84c59261d2a79a2b1a0bc6ca70b1d1fc2ce9eb74f4ad979d7dad');
  });
});
