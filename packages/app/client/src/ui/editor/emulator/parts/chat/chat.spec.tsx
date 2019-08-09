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
import { mount, ReactWrapper, shallow } from 'enzyme';
import { Provider } from 'react-redux';
import ReactWebChat, { createDirectLine } from 'botframework-webchat';
import { ActivityTypes } from 'botframework-schema';
import { ValueTypes } from '@bfemulator/app-shared';
import { combineReducers, createStore } from 'redux';
import { CommandServiceImpl, CommandServiceInstance } from '@bfemulator/sdk-shared';

import { bot } from '../../../../../state/reducers/bot';
import { chat } from '../../../../../state/reducers/chat';
import { editor } from '../../../../../state/reducers/editor';
import { clientAwareSettings } from '../../../../../state/reducers/clientAwareSettings';
import { BotCommands } from '../../../../../commands/botCommands';
import {
  setInspectorObjects,
  showContextMenuForActivity,
  setHighlightedObjects,
} from '../../../../../state/actions/chatActions';

import webChatStyleOptions from './webChatTheme';
import { ChatContainer } from './chatContainer';
import { ChatProps, Chat } from './chat';

jest.mock('electron', () => ({
  ipcMain: new Proxy(
    {},
    {
      get(): any {
        return () => ({});
      },
      has() {
        return true;
      },
    }
  ),
  ipcRenderer: new Proxy(
    {},
    {
      get(): any {
        return () => ({});
      },
      has() {
        return true;
      },
    }
  ),
}));

const mockStore = createStore(combineReducers({ bot, chat, clientAwareSettings, editor }), {
  clientAwareSettings: {
    currentUser: { id: '123', name: 'Current User' },
    users: {
      currentUserId: '123',
      usersById: { '123': { id: '123', name: 'Current User' } },
    },
  },
});

jest.mock('../../../../../state/store', () => ({
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
  mode: 'livechat',
};

function render(overrides: Partial<ChatProps> = {}): ReactWrapper {
  const props = {
    document: defaultDocument,
    endpoint: {},
    mode: 'livechat',
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
  let commandService: CommandServiceImpl;
  beforeAll(() => {
    new BotCommands();
    const decorator = CommandServiceInstance();
    const descriptor = decorator({ descriptor: {} }, 'none') as any;
    commandService = descriptor.descriptor.get();
  });

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

    it('should render a trace activity as a message when the mode is set to "debug"', () => {
      const next = () => (kids: any) => kids;
      const webChat = render({ document: { ...defaultDocument, mode: 'debug' } as any }).find(ReactWebChat);
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

    it('should render a trace activity as a bot state when the mode is set to "debug"', () => {
      const next = () => (kids: any) => kids;
      const webChat = render({ document: { ...defaultDocument, mode: 'debug' } as any }).find(ReactWebChat);
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
      commandService.remoteCall = jest.fn().mockResolvedValueOnce(true);
      const component = render({ pendingSpeechTokenRetrieval: true });
      expect(component.find('div').text()).toEqual('Connecting...');
    });
  });

  it('should be able to tell when a click within an activity was on an Adaptive Card input', () => {
    const wrapper = shallow(
      <Chat
        document={{} as any}
        mode={'livechat'}
        currentUser={null}
        locale={'en-US'}
        showContextMenuForActivity={() => null}
        setInspectorObject={() => null}
        webchatStore={null}
      />
    );
    const instance: any = wrapper.instance();
    const mockElement = { tagName: 'SELECT', parentElement: undefined };

    expect(instance.elementIsAnAdaptiveCardInput(mockElement)).toBe(true);

    mockElement.tagName = 'OPTION';
    expect(instance.elementIsAnAdaptiveCardInput(mockElement)).toBe(true);

    mockElement.tagName = 'INPUT';
    expect(instance.elementIsAnAdaptiveCardInput(mockElement)).toBe(true);

    mockElement.tagName = 'TEXTAREA';
    expect(instance.elementIsAnAdaptiveCardInput(mockElement)).toBe(true);

    mockElement.tagName = 'P';
    mockElement.parentElement = { tagName: 'LABEL' };
    expect(instance.elementIsAnAdaptiveCardInput(mockElement)).toBe(true);

    mockElement.parentElement = undefined;
    mockElement.tagName = 'SPAN';
    expect(instance.elementIsAnAdaptiveCardInput(mockElement)).toBe(false);
  });
});

describe('event handlers', () => {
  let dispatchSpy: jest.SpyInstance;

  beforeEach(() => {
    dispatchSpy = jest.spyOn(mockStore, 'dispatch').mockReturnValue(true);
  });

  it('should invoke the appropriate functions defined in the props', () => {
    const next = () => (kids: any) => kids;
    const chat = render({ document: { ...defaultDocument, mode: 'debug' } as any });
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

    // keydown on activity
    activityWrapper.simulate('keyDown', { key: ' ', target: { tagName: 'DIV', classList: [] } });
    expect(dispatchSpy).toHaveBeenCalledWith(setHighlightedObjects(undefined, []));
    expect(dispatchSpy).toHaveBeenCalledWith(
      setInspectorObjects(undefined, { ...card.activity, showInInspector: true })
    );

    // hitting spacebar on input field within adaptive card
    dispatchSpy.mockClear();
    activityWrapper.simulate('keyDown', { key: ' ', target: { tagName: 'INPUT', classList: [] } });
    expect(dispatchSpy).not.toHaveBeenCalled();

    // click on activity
    dispatchSpy.mockClear();
    activityWrapper.simulate('click', { target: { tagName: 'DIV', classList: [] } });
    expect(dispatchSpy).toHaveBeenCalledWith(setHighlightedObjects(undefined, []));
    expect(dispatchSpy).toHaveBeenCalledWith(
      setInspectorObjects(undefined, { ...card.activity, showInInspector: true })
    );

    // click on input field within adaptive card
    dispatchSpy.mockClear();
    activityWrapper.simulate('click', { target: { tagName: 'INPUT', classList: [] } });
    expect(dispatchSpy).not.toHaveBeenCalled();

    // show context menu for activity
    dispatchSpy.mockClear();
    activityWrapper.simulate('contextmenu', { target: { tagName: 'DIV', classList: [] } });
    expect(dispatchSpy).toHaveBeenCalledWith(showContextMenuForActivity(card.activity));
  });
});
