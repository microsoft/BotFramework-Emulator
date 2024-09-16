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

import { CommandServiceImpl, CommandServiceInstance, LogLevel, textItem } from '@bfemulator/sdk-shared';
import { mount, ReactWrapper } from 'enzyme';
import * as React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import {
  executeCommand,
  launchConnectedServicePicker,
  setHighlightedObjects,
  setInspectorObjects,
  SharedConstants,
} from '@bfemulator/app-shared';
import { ServiceTypes } from 'botframework-config/lib/schema';

import {
  AzureLoginFailedDialogContainer,
  AzureLoginSuccessDialogContainer,
  ConnectServicePromptDialogContainer,
  GetStartedWithCSDialogContainer,
  ProgressIndicatorContainer,
} from '../../../../dialogs';
import { ConnectedServiceEditorContainer } from '../../../../shell/explorer/servicesExplorer/connectedServiceEditor';
import { ConnectedServicePickerContainer } from '../../../../shell/explorer/servicesExplorer';

import { LogEntry as LogEntryContainer } from './logEntryContainer';
import { LogEntry, LogEntryProps, number2, timestamp } from './logEntry';

jest.mock('../../../../dialogs', () => ({
  BotCreationDialog: () => ({}),
}));

jest.mock('./log.scss', () => ({}));

let mockRemoteCallsMade;
let mockCallsMade;

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

describe('logEntry component', () => {
  let wrapper: ReactWrapper;
  let node;
  let instance;
  let props: LogEntryProps;
  let mockDispatch;

  let commandService: CommandServiceImpl;
  beforeAll(() => {
    const decorator = CommandServiceInstance();
    const descriptor = decorator({ descriptor: {} }, 'none') as any;
    commandService = descriptor.descriptor.get();
    commandService.remoteCall = (commandName: string, ...args: any[]) => {
      mockRemoteCallsMade.push({ commandName, args });
      return Promise.resolve(true) as any;
    };
    commandService.call = (commandName: string, ...args: any[]) => {
      mockCallsMade.push({ commandName, args });
      return Promise.resolve(true) as any;
    };
  });

  beforeEach(() => {
    mockRemoteCallsMade = [];
    mockCallsMade = [];
    props = {
      document: {
        documentId: 'someDocId',
      },
      entry: {
        timestamp: 0,
        items: [],
      },
    };
    const mockStore = createStore((_state, _action) => ({}));
    mockDispatch = jest.spyOn(mockStore, 'dispatch');
    wrapper = mount(
      <Provider store={mockStore}>
        <LogEntryContainer {...props} />
      </Provider>
    );
    node = wrapper.find(LogEntry);
    instance = node.instance();
  });

  it('should render an outer entry component', () => {
    expect(node.find('div')).toHaveLength(1);
  });

  it('should render a timestamped log entry with multiple items', () => {
    const entry = {
      timestamp: new Date(2018, 1, 1, 12, 34, 56).getTime(),
      items: [textItem(LogLevel.Debug, 'item1'), textItem(LogLevel.Debug, 'item2'), textItem(LogLevel.Debug, 'item3')],
    };
    wrapper = mount(<LogEntry {...props} />);
    wrapper.setProps({ entry });
    expect(wrapper.find('span.timestamp')).toHaveLength(1);
    expect(wrapper.find('span.text-item')).toHaveLength(3);

    const timestampNode = wrapper.find('span.timestamp');
    expect(timestampNode.html()).toContain('12:34:56');
  });

  it('should truncate a number of more than 3 digits to 2 digits', () => {
    const num1 = 5;
    const num2 = 34;
    const num3 = 666;

    expect(number2(num1)).toBe('05');
    expect(number2(num2)).toBe('34');
    expect(number2(num3)).toBe('66');
  });

  it('should properly generate a timestamp', () => {
    const time = Date.now();
    const date = new Date(time);
    const expectedHrs = number2(date.getHours());
    const expectedMins = number2(date.getMinutes());
    const expectedSeconds = number2(date.getSeconds());
    const expectedTimestamp = `${expectedHrs}:${expectedMins}:${expectedSeconds}`;

    expect(timestamp(time)).toBe(expectedTimestamp);
  });

  it('should inspect an object', () => {
    const mockInspectableObj = { some: 'data' };
    instance.inspect(mockInspectableObj);
    expect(mockDispatch).toHaveBeenCalledWith(
      setInspectorObjects('someDocId', {
        ...mockInspectableObj,
        showInInspector: true,
      })
    );
  });

  it('should inspect and highlight an object', () => {
    const mockInspectableObj = { some: 'data', type: 'message', id: 'someId' };
    instance.inspectAndHighlightInWebchat(mockInspectableObj);

    expect(mockDispatch).toHaveBeenLastCalledWith(
      executeCommand(true, SharedConstants.Commands.Telemetry.TrackEvent, null, 'log_inspectActivity', {
        type: 'message',
      })
    );

    mockInspectableObj.type = undefined;
    instance.inspectAndHighlightInWebchat(mockInspectableObj);
  });

  it('should highlight an object', () => {
    const mockInspectableObj = { some: 'data', type: 'message', id: 'someId' } as any;
    instance.highlight(mockInspectableObj);

    expect(mockDispatch).toHaveBeenCalledWith(setHighlightedObjects('someDocId', mockInspectableObj));
  });

  it('should remove highlighting from an object', () => {
    const mockCurrentlyInspectedActivity = { id: 'activity2' };
    wrapper.setProps({
      currentlyInspectedActivity: mockCurrentlyInspectedActivity,
    });
    instance = wrapper.find(LogEntry).instance();
    instance.highlight();

    expect(mockDispatch).toHaveBeenCalledWith(setHighlightedObjects('someDocId', {} as any));
  });

  it('should render a text item', () => {
    wrapper = mount(<LogEntry {...props} />);
    instance = wrapper.instance();
    const textElem = instance.renderItem(
      { type: 'text', payload: { level: LogLevel.Debug, text: 'some text' } },
      'someKey'
    );
    expect(textElem).not.toBeNull();
  });

  it('should render an external link item', () => {
    wrapper = mount(<LogEntry {...props} />);
    instance = wrapper.instance();
    const linkItem = instance.renderItem(
      {
        type: 'external-link',
        payload: { hyperlink: 'https://aka.ms/bf-emulator', text: 'some text' },
      } as any,
      'someKey'
    );
    expect(linkItem).not.toBeNull();
  });

  it('should render an app settings item', () => {
    wrapper = mount(<LogEntry {...props} />);
    instance = wrapper.instance();
    const appSettingsItem = instance.renderItem(
      { type: 'open-app-settings', payload: { text: 'some text' } } as any,
      'someKey'
    );
    expect(appSettingsItem).not.toBeNull();
  });

  it('should render an exception item', () => {
    wrapper = mount(<LogEntry {...props} />);
    instance = wrapper.instance();
    const exceptionItem = instance.renderItem({ type: 'exception', payload: { err: 'some error' } }, 'someKey');
    expect(exceptionItem).not.toBeNull();
  });

  it('should render an inspectable object item', () => {
    wrapper = mount(<LogEntry {...props} />);
    instance = wrapper.instance();
    const inspectableObjItem = instance.renderItem(
      {
        type: 'inspectable-object',
        payload: { obj: { id: 'someId', type: 'message' } },
      },
      'someKey'
    );
    expect(inspectableObjItem).not.toBeNull();
    expect(instance.inspectableObjects.someId).toBe(true);
  });

  it('should render a network request item', () => {
    wrapper = mount(<LogEntry {...props} />);
    instance = wrapper.instance();
    const networkReqItem = instance.renderItem(
      {
        type: 'network-request',
        payload: {
          facility: undefined,
          body: { some: 'data' },
          headers: undefined,
          method: 'GET',
          url: undefined,
        },
      },
      'someKey'
    );
    expect(networkReqItem).not.toBeNull();
  });

  it('should render a network response item', () => {
    wrapper = mount(<LogEntry {...props} />);
    instance = wrapper.instance();
    const networkResItem = instance.renderItem(
      {
        type: 'network-response',
        payload: {
          body: { some: 'data' },
          headers: undefined,
          statusCode: 404,
          statusMessage: undefined,
          srcUrl: undefined,
        },
      },
      'someKey'
    );
    expect(networkResItem).not.toBeNull();
  });

  it('should render a luis editor deep link item', () => {
    wrapper = mount(<LogEntry {...props} />);
    instance = wrapper.instance();
    const luisDeepLinkItem = instance.renderItem(
      { type: 'luis-editor-deep-link', payload: { text: 'some text' } },
      'someKey'
    );
    expect(luisDeepLinkItem).not.toBeNull();
  });

  it('should launch a luis service editor', () => {
    instance.props.launchLuisEditor();

    expect(mockDispatch).toHaveBeenCalledWith(
      launchConnectedServicePicker({
        azureAuthWorkflowComponents: {
          promptDialog: ConnectServicePromptDialogContainer,
          loginSuccessDialog: AzureLoginSuccessDialogContainer,
          loginFailedDialog: AzureLoginFailedDialogContainer,
        },
        pickerComponent: ConnectedServicePickerContainer,
        getStartedDialog: GetStartedWithCSDialogContainer,
        editorComponent: ConnectedServiceEditorContainer,
        progressIndicatorComponent: ProgressIndicatorContainer,
        serviceType: ServiceTypes.Luis,
      })
    );
  });
});
