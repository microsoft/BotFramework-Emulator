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
import { mount, ReactWrapper, shallow, ShallowWrapper } from 'enzyme';
import { Provider } from 'react-redux';
import ReactWebChat, { createDirectLine, createStyleSet } from 'botframework-webchat';
import { ActivityTypes } from 'botframework-schema';
import {
  bot,
  chat,
  clientAwareSettings,
  editor,
  setInspectorObjects,
  showContextMenuForActivity,
  setHighlightedObjects,
  ValueTypes,
  RestartConversationStatus,
} from '@bfemulator/app-shared';
import { combineReducers, createStore } from 'redux';
import { CommandServiceImpl, CommandServiceInstance } from '@bfemulator/sdk-shared';

import { BotCommands } from '../../../../../commands/botCommands';

import webChatStyleOptions from './webChatTheme';
import { ChatContainer } from './chatContainer';
import { ChatProps, Chat } from './chat';

jest.mock('./chat.scss', () => ({
  get bubbleContentColor() {
    return '#fff';
  },
  get bubbleBackground() {
    return '#ff0000';
  },
}));

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

const defaultDocument = {
  directLine: createDirectLine({
    secret: '1234',
    domain: 'http://localhost/v3/directline',
    webSocket: false,
  }),
  inspectorObjects: [],
  botId: '456',
  mode: 'livechat',
  userId: 'user1',
};

const mockStore = createStore(combineReducers({ bot, chat, clientAwareSettings, editor }), {
  chat: {
    chats: {
      doc1: defaultDocument,
    },
    restartStatus: {},
    pendingSpeechTokenRetrieval: false,
    webChatStores: {},
    webSpeechFactories: {},
  },
  directLine: {},
});

jest.mock('../../../../../state/store', () => ({
  get store() {
    return mockStore;
  },
}));

describe('<ChatContainer />', () => {
  let wrapper: ReactWrapper<any, any, Chat> | ShallowWrapper<any, any, Chat>;

  let commandService: CommandServiceImpl;
  beforeAll(() => {
    new BotCommands();
    const decorator = CommandServiceInstance();
    const descriptor = decorator({ descriptor: {} }, 'none') as any;
    commandService = descriptor.descriptor.get();
  });

  let props;

  beforeEach(() => {
    props = {
      documentId: 'doc1',
      endpoint: {},
      mode: 'livechat',
      onStartConversation: jest.fn(),
      locale: 'en-US',
      selectedActivity: {},
      restartStatus: undefined,
    } as ChatProps;
    wrapper = mount(
      <Provider store={mockStore}>
        <ChatContainer {...props} />
      </Provider>
    );
  });

  it('should disable webchat if chat window is in restart conversation flow', () => {
    let updatedProps = {
      ...props,
      restartStatus: RestartConversationStatus.Started,
    };

    wrapper.setProps({
      children: <ChatContainer {...updatedProps} />,
    });
    expect(wrapper.find(ReactWebChat).props().disabled).toBeTruthy();

    updatedProps = {
      ...props,
      restartStatus: RestartConversationStatus.Rejected,
    };

    wrapper.setProps({
      children: <ChatContainer {...updatedProps} />,
    });
    expect(wrapper.find(ReactWebChat).props().disabled).toBeFalsy();

    updatedProps = {
      ...props,
      restartStatus: RestartConversationStatus.Completed,
    };

    wrapper.setProps({
      children: <ChatContainer {...updatedProps} />,
    });
    expect(wrapper.find(ReactWebChat).props().disabled).toBeFalsy();

    updatedProps = {
      ...props,
      restartStatus: undefined,
    };

    wrapper.setProps({
      children: <ChatContainer {...updatedProps} />,
    });
    expect(wrapper.find(ReactWebChat).props().disabled).toBeFalsy();

    updatedProps = {
      ...props,
      restartStatus: RestartConversationStatus.Stop,
    };

    wrapper.setProps({
      children: <ChatContainer {...updatedProps} />,
    });
    expect(wrapper.find(ReactWebChat).props().disabled).toBeFalsy();

    updatedProps = {
      ...props,
      restartStatus: RestartConversationStatus.Started,
    };

    wrapper.setProps({
      children: <ChatContainer {...updatedProps} />,
    });
    expect(wrapper.find(ReactWebChat).props().disabled).toBeTruthy();
  });

  describe('when there is no direct line client', () => {
    it('renders a `not connected` message', () => {
      wrapper = shallow(<Chat directLine={undefined} />);

      expect(wrapper.text()).toEqual('Not Connected');
    });
  });

  describe('when there is a direct line client', () => {
    it('renders the WebChat component', () => {
      const webChat = wrapper.find(ReactWebChat);
      const styleSet = createStyleSet({ ...webChatStyleOptions });

      styleSet.fileContent = {
        ...styleSet.fileContent,
        background: '#ff0000',
        '& .webchat__fileContent__badge': { padding: '4px' },
        '& .webchat__fileContent__downloadIcon': { fill: '#fff' },
        '& .webchat__fileContent__fileName': { color: '#fff' },
        '& .webchat__fileContent__size': { color: '#fff' },
      };

      expect(webChat.exists()).toBe(true);
      const wcProps = webChat.props();
      expect(wcProps.bot).toEqual({ id: defaultDocument.botId, name: 'Bot' });
      expect(wcProps.directLine).toEqual(defaultDocument.directLine);
      expect(wcProps.locale).toBe('en-US');
      expect(wcProps.styleSet).toEqual(styleSet);
      expect(wcProps.userID).toBe('user1');
      expect(wcProps.username).toBe('User');
    });
  });

  describe('activity middleware', () => {
    it('should render an activity wrapper', () => {
      wrapper = shallow(<Chat />);
      const middleware = card => children => <div>{children}</div>;
      const mockCard = { activity: { type: ActivityTypes.Message, valueType: ValueTypes.Activity } };
      const activityWrapper = (wrapper.instance() as any).createActivityMiddleware()(middleware)(mockCard)(<span />);
      expect(activityWrapper).toBeTruthy();
    });

    it('should render nothing at the end of conversation', () => {
      wrapper = shallow(<Chat />);
      const middleware = card => children => <div>{children}</div>;
      const mockCard = { activity: { type: ActivityTypes.EndOfConversation, valueType: ValueTypes.Activity } };
      const activityWrapper = (wrapper.instance() as any).createActivityMiddleware()(middleware)(mockCard)(<span />);
      expect(activityWrapper).toBe(null);
    });

    it('should render a trace activity', () => {
      wrapper = shallow(<Chat />);
      const middleware = card => children => <div>{children}</div>;
      const mockCard = { activity: { type: ActivityTypes.Trace, valueType: ValueTypes.Debug } };
      const activityWrapper = (wrapper.instance() as any).createActivityMiddleware()(middleware)(mockCard)(<span />);
      expect(activityWrapper).toBeTruthy();
    });
  });
});

describe('event handlers', () => {
  let dispatchSpy: jest.SpyInstance;
  let wrapper: ReactWrapper<any, any, Chat> | ShallowWrapper<any, any, Chat>;
  let instance: Chat;

  let commandService: CommandServiceImpl;
  beforeAll(() => {
    new BotCommands();
    const decorator = CommandServiceInstance();
    const descriptor = decorator({ descriptor: {} }, 'none') as any;
    commandService = descriptor.descriptor.get();
    dispatchSpy = jest.spyOn(mockStore, 'dispatch').mockImplementation((action: any) => {
      // don't block on awaited commands
      if (action.payload && action.payload.resolver) {
        action.payload.resolver();
        return action;
      }
    });
    const props = {
      documentId: 'doc1',
      endpoint: {},
      mode: 'livechat',
      onStartConversation: jest.fn(),
      locale: 'en-US',
      selectedActivity: {},
    } as ChatProps;
    wrapper = mount(
      <Provider store={mockStore}>
        <ChatContainer {...props} />
      </Provider>
    );
    instance = wrapper.find(Chat).instance();
  });

  beforeEach(() => {
    dispatchSpy.mockClear();
  });

  it('should handle an item renderer click', () => {
    const selectedActivity = {};
    (instance as any).activityMap = { activity1: selectedActivity };
    const mockEvent = { currentTarget: { dataset: { activityId: 'activity1' } } };
    (instance as any).onItemRendererClick(mockEvent);

    expect(dispatchSpy).toHaveBeenCalledWith(setHighlightedObjects('doc1', []));
    expect(dispatchSpy).toHaveBeenCalledWith(
      setInspectorObjects('doc1', { ...selectedActivity, showInInspector: true } as any)
    );
  });

  it('should handle a non-space or -enter key press', () => {
    (instance as any).onItemRendererKeyDown({ key: 'A' });
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('should handle a space or enter key press', () => {
    const selectedActivity = {};
    (instance as any).activityMap = { activity1: selectedActivity };
    const mockEvent = { currentTarget: { dataset: { activityId: 'activity1' } }, key: 'Enter' };
    (instance as any).onItemRendererKeyDown(mockEvent);

    expect(dispatchSpy).toHaveBeenCalledWith(setHighlightedObjects('doc1', []));
    expect(dispatchSpy).toHaveBeenCalledWith(
      setInspectorObjects('doc1', { ...selectedActivity, showInInspector: true } as any)
    );
  });

  it('should open a context menu for an activity', () => {
    const selectedActivity = {};
    (instance as any).activityMap = { activity1: selectedActivity };
    const mockEvent = { currentTarget: { dataset: { activityId: 'activity1' } } };
    (instance as any).onContextMenu(mockEvent);

    expect(dispatchSpy).toHaveBeenCalledWith(setHighlightedObjects('doc1', []));
    expect(dispatchSpy).toHaveBeenCalledWith(
      setInspectorObjects('doc1', { ...selectedActivity, showInInspector: true } as any)
    );
    expect(dispatchSpy).toHaveBeenCalledWith(showContextMenuForActivity(selectedActivity));
  });
});
