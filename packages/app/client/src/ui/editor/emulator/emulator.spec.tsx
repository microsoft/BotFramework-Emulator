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
import {
  disable as disablePresentationMode,
  enable as enablePresentationMode,
  executeCommand,
  restartConversation,
  SharedConstants,
  RestartConversationStatus,
} from '@bfemulator/app-shared';
import { CommandServiceImpl, CommandServiceInstance } from '@bfemulator/sdk-shared';
import { RestartConversationOptions } from '@bfemulator/app-shared';

import { Emulator } from './emulator';
import { EmulatorContainer } from './emulatorContainer';

let mockCallsMade, mockRemoteCallsMade;
const replayConversationText = 'Stop Replaying Conversation';
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
        restartStatus: {},
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

  it('should render the presentation view', () => {
    wrapper = shallow(
      <Emulator createErrorNotification={jest.fn(() => null)} documentId={'doc1'} mode={'transcript'} />
    );
    instance = wrapper.instance();
    const presentationView = instance.renderPresentationView();

    expect(presentationView).not.toBeNull();
  });

  it('should render the default view', () => {
    wrapper = shallow(
      <Emulator createErrorNotification={jest.fn(() => null)} documentId={'doc1'} mode={'transcript'} />
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
      <Emulator createErrorNotification={jest.fn(() => null)} documentId={'doc1'} mode={'transcript'} ui={ui} />
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
      <Emulator createErrorNotification={jest.fn(() => null)} documentId={'doc1'} mode={'transcript'} ui={ui} />
    );
    instance = wrapper.instance();
    const horizontalSplitterSizes = instance.getHorizontalSplitterSizes();

    expect(horizontalSplitterSizes[0]).toBe('46');
  });

  it('should restart the conversation on Ctrl/Cmd + Shift + R', () => {
    wrapper = shallow(
      <Emulator
        activeDocumentId={'doc1'}
        createErrorNotification={jest.fn(() => null)}
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

    expect(mockDispatch).toHaveBeenCalledWith(enablePresentationMode());
  });

  it('should disable presentation mode', () => {
    instance.onPresentationClick(false);

    expect(mockDispatch).toHaveBeenCalledWith(disablePresentationMode());
  });

  it('should export a transcript', async () => {
    await instance.onExportTranscriptClick();

    expect(mockDispatch).toHaveBeenCalledWith(
      executeCommand(
        true,
        SharedConstants.Commands.Emulator.SaveTranscriptToFile,
        expect.any(Function) as any,
        32,
        'convo1'
      )
    );
  });

  it('should start over a conversation with a new user id on click', () => {
    const mockStore = createStore((_state, _action) => mockStoreState);
    mockDispatch = jest.spyOn(mockStore, 'dispatch').mockImplementation((action: any) => {
      if (action && action.payload && action.payload.resolver) {
        action.payload.resolver();
      }
      return action;
    });
    wrapper = mount(
      <Provider store={mockStore}>
        <EmulatorContainer
          documentId={'doc1'}
          url={'someUrl'}
          mode={'livechat'}
          conversationId={'convo1'}
          currentRestartConversationOption={RestartConversationOptions.NewUserId}
        />
      </Provider>
    );

    node = wrapper.find(Emulator);
    instance = node.instance();
    instance.onStartOverClick();

    expect(mockDispatch).toHaveBeenCalledWith(
      executeCommand(true, SharedConstants.Commands.Telemetry.TrackEvent, null, 'conversation_restart', {
        userId: 'new',
      })
    );
    expect(mockDispatch).toHaveBeenCalledWith(restartConversation('doc1', true, true));
  });

  it('should start over a conversation with the same user id on click', () => {
    const mockStore = createStore((_state, _action) => mockStoreState);
    mockDispatch = jest.spyOn(mockStore, 'dispatch').mockImplementation((action: any) => {
      if (action && action.payload && action.payload.resolver) {
        action.payload.resolver();
      }
      return action;
    });
    wrapper = mount(
      <Provider store={mockStore}>
        <EmulatorContainer
          documentId={'doc1'}
          url={'someUrl'}
          mode={'livechat'}
          conversationId={'convo1'}
          currentRestartConversationOption={RestartConversationOptions.SameUserId}
        />
      </Provider>
    );

    node = wrapper.find(Emulator);
    instance = node.instance();
    instance.onStartOverClick();

    expect(mockDispatch).toHaveBeenCalledWith(
      executeCommand(true, SharedConstants.Commands.Telemetry.TrackEvent, null, 'conversation_restart', {
        userId: 'same',
      })
    );
    expect(mockDispatch).toHaveBeenCalledWith(restartConversation('doc1', true, false));
  });

  it('should show "Stop Replaying Conversation" when in Replay mode', () => {
    let emulatorProps = {
      documentId: 'doc1',
      url: 'some-url',
      mode: 'livechat',
      conversationId: '123',
      presentationModeEnabled: false,
      restartStatus: RestartConversationStatus.Started,
      onSetRestartConversationOptionClick: jest.fn(),
      ui: {},
    };
    const mockStore = createStore((_state, _action) => mockStoreState);
    wrapper = mount(
      <Provider store={mockStore}>
        <Emulator {...emulatorProps} />
      </Provider>
    );
    node = wrapper.find(Emulator);
    expect(wrapper.text().includes(replayConversationText)).toBeTruthy();

    emulatorProps = {
      ...emulatorProps,
      restartStatus: RestartConversationStatus.Stop,
    };
    wrapper.setProps({
      children: <Emulator {...emulatorProps} />,
    });
    expect(wrapper.text().includes(replayConversationText)).toBeFalsy();

    emulatorProps = {
      ...emulatorProps,
      restartStatus: undefined,
    };
    wrapper.setProps({
      children: <Emulator {...emulatorProps} />,
    });
    expect(wrapper.text().includes(replayConversationText)).toBeFalsy();

    emulatorProps = {
      ...emulatorProps,
      restartStatus: RestartConversationStatus.Rejected,
    };
    wrapper.setProps({
      children: <Emulator {...emulatorProps} />,
    });
    expect(wrapper.text().includes(replayConversationText)).toBeFalsy();

    emulatorProps = {
      ...emulatorProps,
      restartStatus: RestartConversationStatus.Started,
    };
    wrapper.setProps({
      children: <Emulator {...emulatorProps} />,
    });
    expect(wrapper.text().includes(replayConversationText)).toBeTruthy();
  });
});
