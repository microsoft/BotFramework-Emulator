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
import { mount, ReactWrapper } from 'enzyme';
import { Provider } from 'react-redux';
import ReactWebChat, { createDirectLine } from 'botframework-webchat';
import { ActivityTypes } from 'botframework-schema';
import { DebugMode, ValueTypes } from '@bfemulator/app-shared';
import { combineReducers, createStore } from 'redux';

import { CommandServiceImpl } from '../../../../../platform/commands/commandServiceImpl';
import { EmulatorMode } from '../../emulator';
import { bot } from '../../../../../data/reducer/bot';
import { chat } from '../../../../../data/reducer/chat';
import { editor } from '../../../../../data/reducer/editor';
import { clientAwareSettings } from '../../../../../data/reducer/clientAwareSettingsReducer';

import webChatStyleOptions from './webChatTheme';
import { ChatContainer } from './chatContainer';
import { ChatProps } from './chat';

const mockStore = createStore(combineReducers({ bot, chat, clientAwareSettings, editor }), {
  clientAwareSettings: {
    currentUser: { id: '123', name: 'Current User' },
    users: {
      currentUserId: '123',
      usersById: { '123': { id: '123', name: 'Current User' } },
    },
  },
});

jest.mock('../../../../../data/store', () => ({
  get store() {
    return mockStore;
  },
}));

const defaultDocument = {
  directLine: createDirectLine({
    secret: '1234',
    domain: 'http://localhost/v3/directline',
    webSocket: false,
  }),
  inspectorObjects: [],
  botId: '456',
};

function render(overrides: Partial<ChatProps> = {}): ReactWrapper {
  const props = {
    document: defaultDocument,
    endpoint: {},
    mode: 'livechat' as EmulatorMode,
    onStartConversation: jest.fn(),
    locale: 'en-US',
    selectedActivity: {},
    ...overrides,
  } as ChatProps;

  return mount(
    <Provider store={mockStore}>
      <ChatContainer {...props} />
    </Provider>
  );
}

describe('<ChatContainer />', () => {
  describe('when there is no direct line client', () => {
    it('renders a `not connected` message', () => {
      const component = render({ document: {} } as any);

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
      const webChat = render({} as any).find(ReactWebChat);

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
          valueType: ValueTypes.Activity,
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
  let dispatchSpy;
  beforeEach(() => {
    dispatchSpy = jest.spyOn(mockStore, 'dispatch').mockReturnValue(true);
  });
  it('should invoke the appropriate functions defined in the props', () => {
    const next = () => (kids: any) => kids;
    const chat = render({
      debugMode: DebugMode.Sidecar,
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
    const activityWrapper = mount(middleware()(next)(card)(children));
    activityWrapper.simulate('keyDown', { key: ' ', target: { tagName: 'DIV', classList: [] } });
    expect(dispatchSpy).toHaveBeenCalledWith({
      payload: {
        documentId: undefined,
        objs: [
          {
            id: 'activity-id',
            showInInspector: true,
            type: 'trace',
            value: { type: 'event' },
            valueType: 'https://www.botframework.com/schemas/botState',
          },
        ],
      },
      type: 'CHAT/INSPECTOR/OBJECTS/SET',
    });
    activityWrapper.simulate('click', { target: { tagName: 'DIV', classList: [] } });
    expect(dispatchSpy).toHaveBeenCalledWith({
      payload: {
        documentId: undefined,
        objs: [{ showInInspector: true }],
      },
      type: 'CHAT/INSPECTOR/OBJECTS/SET',
    });
    activityWrapper.simulate('contextmenu', { target: { tagName: 'DIV', classList: [] } });
    expect(dispatchSpy).toHaveBeenCalledWith({ payload: undefined, type: 'CHAT/CONTEXT_MENU/SHOW' });
  });
});
