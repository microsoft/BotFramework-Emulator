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

import * as React from 'react';
import { mount, shallow, ShallowWrapper } from 'enzyme';
import ReactWebChat from 'botframework-webchat';
import { CommandServiceImpl } from '../../../../../platform/commands/commandServiceImpl';
import { Chat, getSpeechToken } from './chat';

import webChatStyleOptions from './webChatTheme';

jest.mock('../../../../dialogs', () => ({
  AzureLoginPromptDialogContainer: () => ({ }),
  AzureLoginSuccessDialogContainer: () => ({ }),
  BotCreationDialog: () => ({ }),
  DialogService: { showDialog: () => Promise.resolve(true) },
  SecretPromptDialog: () => ({ })
}));

jest.mock('./chat.scss', () => ({}));

const defaultDocument = {
  directLine: {
    token: 'direct line token'
  },
  botId: '456'
};

function render(overrides: any = {}): ShallowWrapper {
  const props = {
    document: defaultDocument,
    endpoint: {},
    mode: 'livechat',
    onStartConversation: jest.fn(),
    currentUserId: '123',
    locale: 'en-US',
    selectedActivity: null,
    updateSelectedActivity: jest.fn(),
    ...overrides
  };

  return shallow(<Chat {...props} />);
}

describe('<Chat />', () => {
  describe('when there is no direct line client', () => {
    it('renders a `not connected` message', () => {
      const component = render({ document: {} });

      expect(component.text()).toEqual('Not Connected');
    });
  });

  describe('when there is a direct line client', () => {
    it('renders the WebChat component with correct props', () => {
      const webChat = render().find(ReactWebChat);

      expect(webChat.props()).toMatchObject({
        activityMiddleware: expect.any(Function),
        bot: { id: defaultDocument.botId, name: 'Bot' },
        directLine: defaultDocument.directLine,
        locale: 'en-US',
        styleOptions: webChatStyleOptions,
        userId: '123'
      });
    });
  });

  describe('activity middleware', () => {
    it('renders an ActivityWrapper with the contents as children', () => {
      const next = (contents: any) => (kids: any) => kids;
      const card = { activity: { id: 'activity-id' } };
      const children = 'a child node';
      const updateSelectedActivity = jest.fn();
      const webChat = render({ updateSelectedActivity }).find(ReactWebChat);

      const middleware = webChat.prop('activityMiddleware') as any;
      const activityWrapper = mount(middleware()(next)(card)(children));

      expect(activityWrapper.props()).toMatchObject({
        activity: card.activity,
        onClick: updateSelectedActivity,
        isSelected: false
      });
      expect(activityWrapper.text()).toEqual('a child node');
    });
  });
});

describe('getSpeechToken', () => {
  it('should get speech token by calling remotely', async () => {
    const mockRemoteCall = jest.fn().mockResolvedValue('1A2B3C4');

    (CommandServiceImpl as any).remoteCall = mockRemoteCall;

    const speechToken = getSpeechToken({
      appId: 'APP_ID',
      appPassword: 'APP_PASSWORD',
      endpoint: 'http://example.com/',
      id: '123',
      name: 'bot endpoint'
    }, true);

    expect(speechToken).resolves.toBe('1A2B3C4');
    expect(mockRemoteCall).toHaveBeenCalledTimes(1);
  });
});
