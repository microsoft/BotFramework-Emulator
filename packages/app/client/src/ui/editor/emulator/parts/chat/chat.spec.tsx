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
import { ActivityTypes } from 'botframework-schema';
import { DebugMode, ValueTypes } from '@bfemulator/app-shared';

import { CommandServiceImpl } from '../../../../../platform/commands/commandServiceImpl';

import { Chat } from './chat';
import webChatStyleOptions from './webChatTheme';

jest.mock('../../../../dialogs', () => ({
  AzureLoginPromptDialogContainer: () => ({}),
  AzureLoginSuccessDialogContainer: () => ({}),
  BotCreationDialog: () => ({}),
  DialogService: { showDialog: () => Promise.resolve(true) },
  SecretPromptDialog: () => ({}),
}));

jest.mock('./chat.scss', () => ({}));

const defaultDocument = {
  directLine: {
    token: 'direct line token',
  },
  botId: '456',
};

function render(overrides: any = {}): ShallowWrapper {
  const props = {
    document: defaultDocument,
    endpoint: {},
    mode: 'livechat',
    onStartConversation: jest.fn(),
    currentUser: { id: '123', name: 'Current User' },
    locale: 'en-US',
    selectedActivity: {},
    ...overrides,
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
        userID: '123',
        username: 'Current User',
      });
    });
  });

  describe('activity middleware', () => {
    it('renders an ActivityWrapper with the contents as children', () => {
      const next = () => (kids: any) => kids;
      const card = { activity: { id: 'activity-id' } };
      const children = 'a child node';
      const updateSelectedActivity = jest.fn();
      const webChat = render({ updateSelectedActivity }).find(ReactWebChat);

      const middleware = webChat.prop('activityMiddleware') as any;
      const activityWrapper = mount(middleware()(next)(card)(children));

      expect(activityWrapper.props()).toMatchObject({
        activity: { id: 'activity-id' },
        children: 'a child node',
        'data-activity-id': 'activity-id',
        isSelected: false,
        onClick: jasmine.any(Function),
        onKeyDown: jasmine.any(Function),
      });
      expect(activityWrapper.text()).toEqual('a child node');
    });

    it('should render a trace activity as a message when the debugMode is set to "sidecar"', () => {
      const next = () => (kids: any) => kids;
      const webChat = render({ debugMode: DebugMode.Sidecar }).find(ReactWebChat);
      const card = {
        activity: {
          id: 'activity-id',
          type: ActivityTypes.Trace,
          value: { type: ActivityTypes.Message },
        },
      };
      const middleware = webChat.prop('activityMiddleware') as any;
      const children = 'a child node';
      const activityWrapper = mount(middleware()(next)(card)(children));
      expect(activityWrapper.props()).toMatchObject({
        activity: { type: 'message' },
        children: 'a child node',
        'data-activity-id': 'activity-id',
        isSelected: false,
        onClick: jasmine.any(Function),
        onContextMenu: jasmine.any(Function),
        onKeyDown: jasmine.any(Function),
      });
      expect(activityWrapper.text()).toEqual('a child node');
    });

    it('should render a trace activity as a bot state when the debugMode is set to "sidecar"', () => {
      const next = () => (kids: any) => kids;
      const webChat = render({ debugMode: DebugMode.Sidecar }).find(ReactWebChat);
      const card = {
        activity: {
          valueType: ValueTypes.BotState,
          id: 'activity-id',
          type: ActivityTypes.Trace,
          value: { type: ActivityTypes.Event },
        },
      };
      const middleware = webChat.prop('activityMiddleware') as any;
      const activityWrapper = mount(middleware()(next)(card)(null));
      expect(activityWrapper.props()).toMatchObject({
        'aria-selected': false,
        children: 'Bot State',
        className: undefined,
        'data-activity-id': 'activity-id',
        onClick: jasmine.any(Function),
        onContextMenu: jasmine.any(Function),
        onKeyDown: jasmine.any(Function),
      });
      expect(activityWrapper.text()).toEqual('Bot State');
    });

    ['trace', 'endOfConversation'].forEach((type: string) => {
      it(`does not render ${type} activities`, () => {
        const next = () => (kids: any) => kids;
        const card = { activity: { id: 'activity-id', type } };
        const children = 'a child node';
        const webChat = render().find(ReactWebChat);

        const middleware = webChat.prop('activityMiddleware') as any;
        const activityWrapper = middleware()(next)(card)(children);

        expect(activityWrapper).toBeNull();
      });
    });
  });

  describe('speech services', () => {
    it('displays a message when fetching the speech token', () => {
      (CommandServiceImpl as any).remoteCall = jest.fn();
      const component = render({ pendingSpeechTokenRetrieval: true });
      expect(component.find('div').text()).toEqual('Connecting...');
    });
  });
});

describe('event handlers', () => {
  it('should invoke the appropriate functions defined in the props', () => {
    const next = () => (kids: any) => kids;
    const showContextMenuForActivity = jest.fn();
    const chat = render({
      debugMode: DebugMode.Sidecar,
      showContextMenuForActivity,
    });
    const card = {
      activity: {
        valueType: ValueTypes.BotState,
        id: 'activity-id',
        type: ActivityTypes.Trace,
        value: { type: ActivityTypes.Event },
      },
    };
    const webChat = chat.find(ReactWebChat);
    const middleware = webChat.prop('activityMiddleware') as any;
    const children = 'a child node';
    const updateSelectedActivitySpy = jest.spyOn(chat.instance() as any, 'updateSelectedActivity');
    const activityWrapper = mount(middleware()(next)(card)(children));
    activityWrapper.simulate('keyDown', { key: ' ', target: { tagName: 'DIV', classList: [] } });
    activityWrapper.simulate('click', { target: { tagName: 'DIV', classList: [] } });
    activityWrapper.simulate('contextmenu', { target: { tagName: 'DIV', classList: [] } });
    expect(updateSelectedActivitySpy).toHaveBeenCalled();
    expect(showContextMenuForActivity).toHaveBeenCalled();
  });
});
