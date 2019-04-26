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
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { mount, shallow } from 'enzyme';
import { DebugMode, newNotification, SharedConstants } from '@bfemulator/app-shared';
import base64Url from 'base64url';

import { disable, enable } from '../../../data/action/presentationActions';
import { clearLog, newConversation, setInspectorObjects } from '../../../data/action/chatActions';
import { updateDocument } from '../../../data/action/editorActions';
import { CommandServiceImpl } from '../../../platform/commands/commandServiceImpl';
import { beginAdd } from '../../../data/action/notificationActions';

import { Emulator, RestartConversationOptions } from './emulator';
import { EmulatorContainer } from './emulatorContainer';

const { encode } = base64Url;

let mockCallsMade, mockRemoteCallsMade;
const mockSharedConstants = SharedConstants;
jest.mock('../../../platform/commands/commandServiceImpl', () => ({
  CommandServiceImpl: {
    call: (commandName, ...args) => {
      mockCallsMade.push({ commandName, args });
      return Promise.resolve();
    },
    remoteCall: (commandName, ...args) => {
      mockRemoteCallsMade.push({ commandName, args });
      if (commandName === mockSharedConstants.Commands.Emulator.NewTranscript) {
        return Promise.resolve({ conversationId: 'someConvoId' });
      }
      if (commandName === mockSharedConstants.Commands.Emulator.FeedTranscriptFromDisk) {
        return Promise.resolve({ meta: 'some file info' });
      }
      if (commandName === mockSharedConstants.Commands.Settings.LoadAppSettings) {
        return Promise.resolve({ framework: { userGUID: '' } });
      }

      return Promise.resolve();
    },
  },
}));
jest.mock('./chatPanel/chatPanel', () => {
  return jest.fn(() => <div />);
});
jest.mock('./logPanel/logPanel', () => {
  return jest.fn(() => <div />);
});
jest.mock('./playbackBar/playbackBar', () => {
  return jest.fn(() => <div />);
});
jest.mock('./emulator.scss', () => ({}));
jest.mock('./parts', () => {
  return jest.fn(() => <div />);
});
jest.mock('./toolbar/toolbar', () => {
  return jest.fn(() => <div />);
});
jest.mock('@bfemulator/sdk-shared', () => ({
  uniqueId: () => 'someUniqueId',
  uniqueIdv4: () => 'newUserId',
}));

jest.mock('botframework-webchat', () => ({
  createDirectLine: args => ({ ...args }),
}));

describe('<EmulatorContainer/>', () => {
  let wrapper;
  let node;
  let instance;
  let mockDispatch;
  let mockStoreState;
  const mockUnsubscribe = jest.fn(() => null);

  beforeEach(() => {
    mockUnsubscribe.mockClear();
    mockCallsMade = [];
    mockRemoteCallsMade = [];
    mockStoreState = {
      chat: {
        chats: {
          doc1: {
            conversationId: 'convo1',
            documentId: 'doc1',
            endpointId: 'endpoint1',
            userId: 'someUserId',
            subscription: { unsubscribe: mockUnsubscribe },
          },
        },
      },
      editor: {
        activeEditor: 'primary',
        editors: {
          primary: {
            activeDocumentId: 'doc1',
          },
        },
      },
      presentation: { enabled: true },
      clientAwareSettings: { debugMode: DebugMode.Normal },
    };
    const mockStore = createStore((_state, _action) => mockStoreState);
    mockDispatch = jest.spyOn(mockStore, 'dispatch');
    wrapper = mount(
      <Provider store={mockStore}>
        <EmulatorContainer documentId={'doc1'} url={'someUrl'} mode={'livechat'} conversationId={'convo1'} />
      </Provider>
    );
    node = wrapper.find(Emulator);
    instance = node.instance();
  });

  it('should render properly', () => {
    expect(instance).not.toBe(true);
  });

  it('should determine when to start a new conversation', () => {
    expect(instance.shouldStartNewConversation()).toBe(true);
    mockStoreState.chat.chats.doc1.directLine = { conversationId: 'convo2' };
    expect(instance.shouldStartNewConversation()).toBe(true);
    mockStoreState.chat.chats.doc1.directLine = { conversationId: 'convo1' };
    expect(instance.shouldStartNewConversation()).toBe(false);
  });

  it('should render the presentation view', () => {
    wrapper = shallow(
      <Emulator
        createErrorNotification={jest.fn(() => null)}
        newConversation={jest.fn(() => null)}
        mode={'transcript'}
        document={mockStoreState.chat.chats.doc1}
      />
    );
    instance = wrapper.instance();
    const presentationView = instance.renderPresentationView();

    expect(presentationView).not.toBeNull();
  });

  it('should render the default view', () => {
    wrapper = shallow(
      <Emulator
        createErrorNotification={jest.fn(() => null)}
        newConversation={jest.fn(() => null)}
        mode={'transcript'}
        document={mockStoreState.chat.chats.doc1}
      />
    );
    instance = wrapper.instance();
    const defaultView = instance.renderDefaultView();

    expect(defaultView).not.toBeNull();
    expect(defaultView.key).toEqual('convo1');
  });

  it('should get the veritcal splitter sizes', () => {
    mockStoreState.chat.chats.doc1.ui = {
      verticalSplitter: {
        0: {
          percentage: '55',
        },
      },
    };
    wrapper = shallow(
      <Emulator
        createErrorNotification={jest.fn(() => null)}
        newConversation={jest.fn(() => null)}
        mode={'transcript'}
        document={mockStoreState.chat.chats.doc1}
      />
    );
    instance = wrapper.instance();
    const verticalSplitterSizes = instance.getVerticalSplitterSizes();

    expect(verticalSplitterSizes[0]).toBe('55');
  });

  it('should get the veritcal splitter sizes', () => {
    mockStoreState.chat.chats.doc1.ui = {
      horizontalSplitter: {
        0: {
          percentage: '46',
        },
      },
    };
    wrapper = shallow(
      <Emulator
        createErrorNotification={jest.fn(() => null)}
        newConversation={jest.fn(() => null)}
        mode={'transcript'}
        document={mockStoreState.chat.chats.doc1}
      />
    );
    instance = wrapper.instance();
    const horizontalSplitterSizes = instance.getHorizontalSplitterSizes();

    expect(horizontalSplitterSizes[0]).toBe('46');
  });

  it('should restart the conversation on Ctrl/Cmd + Shift + R', () => {
    wrapper = shallow(
      <Emulator
        createErrorNotification={jest.fn(() => null)}
        newConversation={jest.fn(() => null)}
        mode={'transcript'}
        document={mockStoreState.chat.chats.doc1}
      />
    );
    instance = wrapper.instance();
    const mockOnStartOverClick = jest.fn(() => null);
    instance.onStartOverClick = mockOnStartOverClick;
    let mockGetModifierState = jest.fn(modifier => {
      if (modifier === 'Control') {
        return true;
      } else if (modifier === 'Shift') {
        return true;
      }
      return true;
    });
    const mockEvent = {
      getModifierState: mockGetModifierState,
      key: 'R',
    };
    instance.keyboardEventListener(mockEvent);

    expect(mockOnStartOverClick).toHaveBeenCalledTimes(1);

    mockGetModifierState = jest.fn(modifier => {
      if (modifier === 'Control') {
        return false;
      } else if (modifier === 'Shift') {
        return true;
      } else {
        return true; // Cmd / Meta
      }
    });
    instance.keyboardEventListener(mockEvent);

    expect(mockOnStartOverClick).toHaveBeenCalledTimes(2);
  });

  it('should enable presentation mode', () => {
    instance.onPresentationClick(true);

    expect(mockDispatch).toHaveBeenCalledWith(enable());
  });

  it('should disable presentation mode', () => {
    instance.onPresentationClick(false);

    expect(mockDispatch).toHaveBeenCalledWith(disable());
  });

  it('should export a transcript', () => {
    instance.onExportTranscriptClick();

    expect(mockRemoteCallsMade).toHaveLength(3);
    expect(mockRemoteCallsMade[2].commandName).toBe(SharedConstants.Commands.Emulator.SaveTranscriptToFile);
    expect(mockRemoteCallsMade[0].args).toEqual([16, 'convo1']);
  });

  it('should report a notification when exporting a transcript fails', async () => {
    jest.spyOn(CommandServiceImpl, 'remoteCall').mockRejectedValueOnce({ message: 'oh noes!' });
    await instance.onExportTranscriptClick();
    const notification = newNotification('oh noes!');
    notification.timestamp = jasmine.any(Number) as any;

    expect(mockDispatch).toHaveBeenCalledWith(beginAdd(notification));
  });

  it('should start a new conversation', async () => {
    const initConversationSpy = jest.spyOn(instance, 'initConversation');
    const options = {
      conversationId: 'someUniqueId|livechat',
      conversationMode: 'livechat',
      endpointId: 'endpoint1',
      userId: 'newUserId',
    };
    await instance.startNewConversation(undefined, true, true);

    expect(mockRemoteCallsMade).toHaveLength(4);
    expect(initConversationSpy).toHaveBeenCalledWith(instance.props, options);
  });

  it('should start a new conversation when a new document is given as props', async () => {
    const startNewConversationSpy = jest.spyOn(instance, 'startNewConversation');
    const nextProps = { document: { documentId: 'newDoc' } };
    instance.componentWillReceiveProps(nextProps);
    expect(startNewConversationSpy).toHaveBeenCalledWith(nextProps);
  });

  it('should start a new conversation with a new conversation id', async () => {
    const mockInitConversation = jest.fn(() => null);
    instance.initConversation = mockInitConversation;
    const options = {
      conversationId: 'someUniqueId|livechat',
      conversationMode: instance.props.mode,
      endpointId: instance.props.endpointId,
      userId: 'someUserId',
    };
    await instance.startNewConversation(undefined, true, false);

    expect(mockInitConversation).toHaveBeenCalledWith(instance.props, options);
  });

  it('should start a new conversation with a new user id', async () => {
    const mockInitConversation = jest.fn(() => null);
    instance.initConversation = mockInitConversation;
    instance.props.document.conversationId = undefined;
    const options = {
      conversationId: 'someUniqueId|livechat',
      conversationMode: instance.props.mode,
      endpointId: instance.props.endpointId,
      userId: 'newUserId',
    };
    await instance.startNewConversation(undefined, false, true);

    expect(mockRemoteCallsMade).toHaveLength(4);
    expect(mockRemoteCallsMade[3].commandName).toBe(SharedConstants.Commands.Emulator.SetCurrentUser);
    expect(mockRemoteCallsMade[3].args).toEqual([options.userId]);
    expect(mockInitConversation).toHaveBeenCalledWith(instance.props, options);
  });

  it('should start over a conversation with a new user id on click', async () => {
    const mockStartNewConversation = jest.fn(async () => Promise.resolve(true));
    instance.startNewConversation = mockStartNewConversation;
    await instance.onStartOverClick();

    expect(mockDispatch).toHaveBeenCalledWith(clearLog('doc1'));
    expect(mockDispatch).toHaveBeenCalledWith(setInspectorObjects('doc1', []));
    expect(mockRemoteCallsMade).toHaveLength(3);
    expect(mockRemoteCallsMade[2].commandName).toBe(SharedConstants.Commands.Telemetry.TrackEvent);
    expect(mockRemoteCallsMade[2].args).toEqual(['conversation_restart', { userId: 'new' }]);
    expect(mockStartNewConversation).toHaveBeenCalledWith(undefined, true, true);
  });

  it('should start over a conversation with the same user id on click', async () => {
    const mockStartNewConversation = jest.fn(async () => Promise.resolve(true));
    instance.startNewConversation = mockStartNewConversation;
    await instance.onStartOverClick(RestartConversationOptions.SameUserId);

    expect(mockDispatch).toHaveBeenCalledWith(clearLog('doc1'));
    expect(mockDispatch).toHaveBeenCalledWith(setInspectorObjects('doc1', []));
    expect(mockRemoteCallsMade).toHaveLength(3);
    expect(mockRemoteCallsMade[2].commandName).toBe(SharedConstants.Commands.Telemetry.TrackEvent);
    expect(mockRemoteCallsMade[2].args).toEqual(['conversation_restart', { userId: 'same' }]);
    expect(mockStartNewConversation).toHaveBeenCalledWith(undefined, true, false);
  });

  it('should init a conversation', () => {
    const mockProps = {
      documentId: 'doc1',
      url: 'someUrl',
    };
    const mockOptions = { conversationId: 'convo1' };
    const encodedOptions = encode(JSON.stringify(mockOptions));
    instance.initConversation(mockProps, mockOptions, {}, {});

    expect(mockDispatch).toHaveBeenCalledWith(
      newConversation('doc1', {
        conversationId: 'convo1',
        directLine: {
          secret: encodedOptions,
          domain: 'someUrl/v3/directline',
          webSocket: false,
        },
      })
    );
  });

  it('should start a new conversation from transcript in memory', async () => {
    const mockInitConversation = jest.fn(() => null);
    instance.initConversation = mockInitConversation;
    const mockProps = {
      document: {
        activities: [],
        botId: 'someBotId',
        inMemory: true,
        userId: 'someUserId',
      },
      mode: 'transcript',
    };

    await instance.startNewConversation(mockProps);

    expect(mockRemoteCallsMade).toHaveLength(6);
    expect(mockRemoteCallsMade[4].commandName).toBe(SharedConstants.Commands.Emulator.NewTranscript);
    expect(mockRemoteCallsMade[4].args).toEqual(['someUniqueId|transcript']);
    expect(mockRemoteCallsMade[5].commandName).toBe(SharedConstants.Commands.Emulator.FeedTranscriptFromMemory);
    expect(mockRemoteCallsMade[5].args).toEqual(['someConvoId', 'someBotId', 'someUserId', []]);
  });

  it('should start a new conversation from transcript on disk', async () => {
    const mockInitConversation = jest.fn(() => null);
    instance.initConversation = mockInitConversation;
    const mockProps = {
      document: {
        activities: [],
        botId: 'someBotId',
        documentId: 'someDocId',
        inMemory: false,
        userId: 'someUserId',
      },
      documentId: 'someDocId',
      mode: 'transcript',
    };

    await instance.startNewConversation(mockProps);

    expect(mockRemoteCallsMade).toHaveLength(6);
    expect(mockRemoteCallsMade[4].commandName).toBe(SharedConstants.Commands.Emulator.NewTranscript);
    expect(mockRemoteCallsMade[4].args).toEqual(['someUniqueId|transcript']);
    expect(mockRemoteCallsMade[5].commandName).toBe(SharedConstants.Commands.Emulator.FeedTranscriptFromDisk);
    expect(mockRemoteCallsMade[5].args).toEqual(['someConvoId', 'someBotId', 'someUserId', 'someDocId']);
    expect(mockDispatch).toHaveBeenCalledWith(updateDocument('someDocId', { meta: 'some file info' }));
  });
});
