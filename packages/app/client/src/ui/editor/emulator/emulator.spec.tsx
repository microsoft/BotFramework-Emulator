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
import { mount, shallow, ReactWrapper, ShallowWrapper } from 'enzyme';
import { SharedConstants } from '@bfemulator/app-shared';
import base64Url from 'base64url';
import { CommandServiceImpl, CommandServiceInstance } from '@bfemulator/sdk-shared';

import { disable, enable } from '../../../state/actions/presentationActions';
import { clearLog, newConversation, setInspectorObjects } from '../../../state/actions/chatActions';
import { updateDocument } from '../../../state/actions/editorActions';
import { executeCommand } from '../../../state/actions/commandActions';

import { Emulator, RestartConversationOptions } from './emulator';
import { EmulatorContainer } from './emulatorContainer';

const { encode } = base64Url;

let mockCallsMade, mockRemoteCallsMade;
const mockSharedConstants = SharedConstants;
jest.mock('./chatPanel/chatPanel', () => ({
  ChatPanel: jest.fn(() => <div />),
}));
jest.mock('./logPanel/logPanel', () => {
  return jest.fn(() => <div />);
});
jest.mock('./playbackBar/playbackBar', () => {
  return jest.fn(() => <div />);
});
jest.mock('./emulator.scss', () => ({}));
jest.mock('./parts', () => ({
  InspectorContainer: jest.fn(() => <div />),
}));
jest.mock('./toolbar/toolbar', () => ({
  ToolBar: jest.fn(() => <div />),
}));
jest.mock('@bfemulator/sdk-shared/build/utils/misc', () => ({
  uniqueId: () => 'someUniqueId',
  uniqueIdv4: () => 'newUserId',
}));

jest.mock('botframework-webchat', () => ({
  createDirectLine: args => ({ ...args }),
}));

jest.mock('electron', () => ({
  remote: {
    app: {
      isPackaged: false,
    },
  },
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

describe('<EmulatorContainer/>', () => {
  let wrapper: ReactWrapper<any, any, any> | ShallowWrapper<any, any, any>;
  let node;
  let instance;
  let mockDispatch;
  let mockStoreState;
  const mockUnsubscribe = jest.fn(() => null);

  let commandService: CommandServiceImpl;

  beforeAll(() => {
    const decorator = CommandServiceInstance();
    const descriptor = decorator({ descriptor: {} }, 'none') as any;
    commandService = descriptor.descriptor.get();
    commandService.call = (commandName, ...args) => {
      mockCallsMade.push({ commandName, args });
      return Promise.resolve() as any;
    };
    commandService.remoteCall = (commandName, ...args) => {
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
      return Promise.resolve() as any;
    };
  });

  beforeEach(() => {
    mockUnsubscribe.mockClear();
    mockCallsMade = [];
    mockRemoteCallsMade = [];
    mockStoreState = {
      clientAwareSettings: {
        serverUrl: 'http://localhost',
        users: {
          usersById: {},
        },
      },
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
        pendingSpeechTokenRetrieval: null,
        webChatStores: {},
        webSpeechFactories: {},
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
    };
    const mockStore = createStore((_state, _action) => mockStoreState);
    mockDispatch = jest.spyOn(mockStore, 'dispatch').mockImplementation((action: any) => {
      if (action && action.payload && action.payload.resolver) {
        action.payload.resolver();
      }
      return action;
    });
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
    wrapper = shallow(
      <Emulator
        conversationId={'convo1'}
        createErrorNotification={jest.fn(() => null)}
        documentId={'doc1'}
        mode={'transcript'}
        newConversation={jest.fn(() => null)}
      />
    );
    instance = wrapper.instance();
    expect(instance.shouldStartNewConversation()).toBe(true);
    wrapper.setProps({ directLine: { conversationId: 'convo2' } });
    expect(instance.shouldStartNewConversation()).toBe(true);
    wrapper.setProps({ directLine: { conversationId: 'convo1' } });
    expect(instance.shouldStartNewConversation()).toBe(false);
  });

  it('should render the presentation view', () => {
    wrapper = shallow(
      <Emulator
        createErrorNotification={jest.fn(() => null)}
        documentId={'doc1'}
        mode={'transcript'}
        newConversation={jest.fn(() => null)}
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
        documentId={'doc1'}
        mode={'transcript'}
        newConversation={jest.fn(() => null)}
      />
    );
    instance = wrapper.instance();
    const defaultView = instance.renderDefaultView();

    expect(defaultView).not.toBeNull();
  });

  it('should get the veritcal splitter sizes', () => {
    const ui = {
      horizontalSplitter: [],
      verticalSplitter: [
        {
          absolute: undefined,
          percentage: 55,
        },
      ],
    };
    wrapper = shallow(
      <Emulator
        createErrorNotification={jest.fn(() => null)}
        documentId={'doc1'}
        mode={'transcript'}
        newConversation={jest.fn(() => null)}
        ui={ui}
      />
    );
    instance = wrapper.instance();
    const verticalSplitterSizes = instance.getVerticalSplitterSizes();

    expect(verticalSplitterSizes[0]).toBe('55');
  });

  it('should get the veritcal splitter sizes', () => {
    const ui = {
      horizontalSplitter: [
        {
          absolute: undefined,
          percentage: 46,
        },
      ],
      verticalSplitter: [],
    };
    wrapper = shallow(
      <Emulator
        createErrorNotification={jest.fn(() => null)}
        documentId={'doc1'}
        mode={'transcript'}
        newConversation={jest.fn(() => null)}
        ui={ui}
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
        documentId={'doc1'}
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

  it('should export a transcript', async () => {
    await instance.onExportTranscriptClick();

    expect(mockRemoteCallsMade).toHaveLength(1);
    expect(mockDispatch).toHaveBeenCalledWith(
      executeCommand(true, SharedConstants.Commands.Emulator.SaveTranscriptToFile, null, 32, 'convo1')
    );
  });

  it('should start a new conversation', async () => {
    wrapper = shallow(
      <Emulator
        createErrorNotification={jest.fn(() => null)}
        newConversation={jest.fn(() => null)}
        mode={'livechat'}
        documentId={'doc1'}
        endpointId={'endpoint1'}
      />
    );
    instance = wrapper.instance();
    const options = {
      conversationId: 'someUniqueId|livechat',
      mode: 'livechat',
      endpointId: 'endpoint1',
      userId: 'newUserId',
    };

    // wait for componentWillMount to start conversation for the first time
    await new Promise(resolve => {
      setTimeout(resolve, 500);
    });

    const initConversationSpy = jest.spyOn(instance, 'initConversation');
    instance.conversationInitRequested = false;
    mockRemoteCallsMade = [];
    await instance.startNewConversation(undefined, true, true);
    expect(mockRemoteCallsMade).toHaveLength(1);
    expect(initConversationSpy).toHaveBeenCalledWith(instance.props, options);
  });

  it('should start a new conversation when a new document is given as props', async () => {
    const startNewConversationSpy = jest.spyOn(instance, 'startNewConversation');
    const nextProps = { document: { documentId: 'newDoc' } };
    instance.componentWillReceiveProps(nextProps);
    expect(startNewConversationSpy).toHaveBeenCalledWith(nextProps);
  });

  it('should start a new conversation with a new conversation id', async () => {
    wrapper = shallow(
      <Emulator
        createErrorNotification={jest.fn(() => null)}
        newConversation={jest.fn(() => null)}
        mode={'livechat'}
        documentId={'doc1'}
        endpointId={'endpoint1'}
        userId={'someUserId'}
      />
    );
    instance = wrapper.instance();
    const mockInitConversation = jest.fn(() => null);
    instance.initConversation = mockInitConversation;
    const options = {
      conversationId: 'someUniqueId|livechat',
      mode: instance.props.mode,
      endpointId: instance.props.endpointId,
      userId: 'someUserId',
    };

    // wait for componentWillMount to start conversation for the first time
    await new Promise(resolve => {
      setTimeout(resolve, 500);
    });
    mockInitConversation.mockClear();

    await instance.startNewConversation(undefined, true, false);

    expect(mockInitConversation).toHaveBeenCalledWith(instance.props, options);
  });

  it('should start a new conversation with a new user id', async () => {
    wrapper = shallow(
      <Emulator
        conversationId={undefined}
        createErrorNotification={jest.fn(() => null)}
        documentId={'doc1'}
        endpointId={'endpoint1'}
        mode={'livechat'}
        newConversation={jest.fn(() => null)}
      />
    );
    instance = wrapper.instance();
    const mockInitConversation = jest.fn(() => null);
    instance.initConversation = mockInitConversation;
    const options = {
      conversationId: 'someUniqueId|livechat',
      mode: instance.props.mode,
      endpointId: instance.props.endpointId,
      userId: 'newUserId',
    };

    // wait for componentWillMount to start conversation for the first time
    await new Promise(resolve => {
      setTimeout(resolve, 500);
    });
    mockInitConversation.mockClear();
    mockRemoteCallsMade = [];

    await instance.startNewConversation(undefined, false, true);

    expect(mockRemoteCallsMade).toHaveLength(1);
    expect(mockRemoteCallsMade[0].commandName).toBe(SharedConstants.Commands.Emulator.SetCurrentUser);
    expect(mockRemoteCallsMade[0].args[0]).toBe('newUserId');
    expect(mockInitConversation).toHaveBeenCalledWith(instance.props, options);
  });

  it('should start over a conversation with a new user id on click', async () => {
    const mockStartNewConversation = jest.fn(async () => Promise.resolve(true));
    instance.startNewConversation = mockStartNewConversation;
    await instance.onStartOverClick();
    expect(mockDispatch).toHaveBeenCalledWith(clearLog('doc1', jasmine.any(Function)));
    expect(mockDispatch).toHaveBeenCalledWith(setInspectorObjects('doc1', []));
    expect(mockDispatch).toHaveBeenCalledWith(
      executeCommand(true, SharedConstants.Commands.Telemetry.TrackEvent, null, 'conversation_restart', {
        userId: 'new',
      })
    );
    expect(mockStartNewConversation).toHaveBeenCalledWith(undefined, true, true);
  });

  it('should start over a conversation with the same user id on click', async () => {
    const mockStartNewConversation = jest.fn(async () => Promise.resolve(true));
    instance.startNewConversation = mockStartNewConversation;
    await instance.onStartOverClick(RestartConversationOptions.SameUserId);

    expect(mockDispatch).toHaveBeenCalledWith(clearLog('doc1', jasmine.any(Function)));
    expect(mockDispatch).toHaveBeenCalledWith(setInspectorObjects('doc1', []));
    expect(mockDispatch).toHaveBeenCalledWith(
      executeCommand(true, SharedConstants.Commands.Telemetry.TrackEvent, null, 'conversation_restart', {
        userId: 'same',
      })
    );
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
    const remoteCallSpy = jest
      .spyOn(commandService, 'remoteCall')
      .mockResolvedValueOnce() // SetCurrentUser
      .mockResolvedValueOnce({ conversationId: 'someConvoId' }); // NewTranscript

    wrapper = shallow(
      <Emulator
        activities={[]}
        botId={'someBotId'}
        documentId={'someDocId'}
        inMemory={true}
        mode={'transcript'}
        newConversation={jest.fn()}
        userId={'someUserId'}
      />
    );

    // wait for the startNewConversation method to finish
    await new Promise(resolve => {
      setTimeout(resolve, 500);
    });

    expect(remoteCallSpy).toHaveBeenCalledWith(
      SharedConstants.Commands.Emulator.NewTranscript,
      'someUniqueId|transcript'
    );
    expect(remoteCallSpy).toHaveBeenCalledWith(
      SharedConstants.Commands.Emulator.FeedTranscriptFromMemory,
      'someConvoId',
      'someBotId',
      'someUserId',
      []
    );
    remoteCallSpy.mockClear();
  });

  it('should start a new conversation from transcript on disk', async () => {
    const mockUpdateDocument = jest.fn((docId, fileInfo) => {
      mockDispatch(updateDocument(docId, fileInfo));
    });
    const remoteCallSpy = jest
      .spyOn(commandService, 'remoteCall')
      .mockResolvedValueOnce() // SetCurrentUser
      .mockResolvedValueOnce({ conversationId: 'someConvoId' }) // NewTranscript
      .mockResolvedValueOnce({ meta: 'some file info' }); // FeedTranscriptFromDisk

    wrapper = shallow(
      <Emulator
        activities={[]}
        botId={'someBotId'}
        documentId={'someDocId'}
        inMemory={false}
        mode={'transcript'}
        newConversation={jest.fn()}
        updateDocument={mockUpdateDocument}
        userId={'someUserId'}
      />
    );

    // wait for the startNewConversation method to finish
    await new Promise(resolve => {
      setTimeout(resolve, 500);
    });

    expect(remoteCallSpy).toHaveBeenCalledWith(
      SharedConstants.Commands.Emulator.NewTranscript,
      'someUniqueId|transcript'
    );
    expect(remoteCallSpy).toHaveBeenCalledWith(
      SharedConstants.Commands.Emulator.FeedTranscriptFromDisk,
      'someConvoId',
      'someBotId',
      'someUserId',
      'someDocId'
    );
    expect(mockDispatch).toHaveBeenCalledWith(updateDocument('someDocId', { meta: 'some file info' }));
  });

  it('should set a restart button ref', () => {
    const mockButtonRef: any = {};
    instance.setRestartButtonRef(mockButtonRef);

    expect(instance.restartButtonRef).toBe(mockButtonRef);
  });
});
