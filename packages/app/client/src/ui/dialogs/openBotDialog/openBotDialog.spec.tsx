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

import {
  bot,
  clientAwareSettings,
  clientAwareSettingsChanged,
  executeCommand,
  load,
  ClientAwareSettings,
  SharedConstants,
} from '@bfemulator/app-shared';
import * as botActions from '@bfemulator/app-shared/built/state/actions/botActions';
import { mount } from 'enzyme';
import * as React from 'react';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';

import { DialogService } from '../service';

import { OpenBotDialog } from './openBotDialog';
import { OpenBotDialogContainer } from './openBotDialogContainer';

let mockStore;
jest.mock('./openBotDialog.scss', () => ({}));
jest.mock('../../../state/store', () => ({
  get store() {
    return mockStore;
  },
}));
jest.mock('../service', () => ({
  DialogService: {
    showDialog: () => Promise.resolve(true),
    hideDialog: () => Promise.resolve(false),
  },
}));
jest.mock('../dialogStyles.scss', () => ({}));
jest.mock('../../editor/recentBotsList/recentBotsList.scss', () => ({}));
jest.mock('../', () => ({}));

const bots = [
  {
    path: '/some/path',
    displayName: 'mockMock',
    transcriptsPath: '/Users/microsoft/Documents/testbot/transcripts',
    chatsPath: '/Users/microsoft/Documents/testbot/dialogs',
  },
];

describe('The OpenBotDialog', () => {
  let node;
  let parent;
  let instance;
  let mockDispatch;
  beforeEach(() => {
    mockStore = createStore(combineReducers({ bot, clientAwareSettings }));
    mockStore.dispatch(load(bots));
    mockStore.dispatch(
      clientAwareSettingsChanged({
        serverUrl: 'http://localhost:3543',
      } as ClientAwareSettings)
    );
    mockDispatch = jest.spyOn(mockStore, 'dispatch');
    parent = mount(
      <Provider store={mockStore}>
        <OpenBotDialogContainer isDebug={false} mode={'livechat'} savedBotUrls={['http://localhost/api/messages']} />
      </Provider>
    );
    node = parent.find(OpenBotDialog);
    instance = node.instance();
  });

  it('should hide the dialog when cancel is clicked', () => {
    const spy = jest.spyOn(DialogService, 'hideDialog');
    instance.props.onDialogCancel();
    expect(spy).toHaveBeenCalled();
  });

  it('should properly set the state when the input changes', () => {
    instance.onInputChange({
      target: {
        name: 'botUrl',
        type: 'text',
        value: 'http://localhost:6500/api/messages',
      },
    } as any);

    expect(instance.state.botUrl).toBe('http://localhost:6500/api/messages');

    instance.onInputChange({
      target: {
        type: 'file',
        name: 'botUrl',
        files: { item: () => ({ path: 'some/path/to/myBot.bot' }) },
      },
    } as any);

    expect(instance.state.botUrl).toBe('some/path/to/myBot.bot');
  });

  it('should properly set the state when the "debug" checkbox is clicked', () => {
    instance.onDebugCheckboxClick({
      currentTarget: {
        name: 'mode',
        type: 'input',
        checked: 'true',
      },
    } as any);

    expect(instance.state.mode).toBe('debug');
    expect(instance.state.isDebug).toBeTruthy();
  });

  it('should properly set the state when the "Azure Gov" checkbox is clicked', () => {
    instance.onChannelServiceCheckboxClick({
      currentTarget: {
        name: 'isAzureGov',
        type: 'input',
        checked: 'true',
      },
    } as any);

    expect(instance.state.isAzureGov).toBeTruthy();
  });

  it('should not show the "Browse" button if either the "debug" or "Azure Gov" checkboxes are clicked', () => {
    instance.setState({
      isAzureGov: true,
    } as any);
    expect(instance.browseButton).toBe(null);

    instance.setState({
      isDebug: true,
      isAzureGov: false,
    } as any);
    expect(instance.browseButton).toBe(null);

    instance.setState({
      isDebug: true,
      isAzureGov: true,
    } as any);
    expect(instance.browseButton).toBe(null);

    instance.setState({
      isDebug: false,
      isAzureGov: false,
    } as any);
    expect(instance.browseButton).not.toBe(null);
  });

  it('should open a bot when a path is provided', async () => {
    instance.onInputChange({
      target: {
        name: 'botUrl',
        type: 'file',
        files: { item: () => ({ path: 'some/path/to/myBot.bot' }) },
      },
    } as any);

    const spy = jest.spyOn(botActions, 'openBotViaFilePathAction');
    await instance.onSubmit();

    expect(spy).toHaveBeenCalledWith('some/path/to/myBot.bot');
  });

  it('should open a bot when a URL is provided', async () => {
    instance.onInputChange({
      target: {
        name: 'botUrl',
        type: 'text',
        value: 'http://localhost',
      },
    } as any);
    instance.onInputChange({
      target: {
        name: 'speechRegion',
        type: 'text',
        value: 'westus',
      },
    } as any);
    instance.onInputChange({
      target: {
        name: 'speechKey',
        type: 'text',
        value: 'i-am-a-speech-key',
      },
    } as any);

    const spy = jest.spyOn(botActions, 'openBotViaUrlAction');
    await instance.onSubmit();

    expect(spy).toHaveBeenCalledWith({
      appId: '',
      appPassword: '',
      channelService: 'public',
      endpoint: 'http://localhost',
      mode: 'livechat',
      speechKey: 'i-am-a-speech-key',
      speechRegion: 'westus',
      tenantId: '',
    });
  });

  it('should open a gov bot when a URL is provided and isAzureGov is true', async () => {
    instance.onInputChange({
      target: {
        name: 'botUrl',
        type: 'text',
        value: 'http://localhost',
      },
    } as any);

    instance.setState({
      isAzureGov: true,
    } as any);

    const spy = jest.spyOn(botActions, 'openBotViaUrlAction');
    await instance.onSubmit();

    expect(spy).toHaveBeenCalledWith({
      appId: '',
      appPassword: '',
      channelService: 'azureusgovernment',
      endpoint: 'http://localhost',
      mode: 'livechat',
      speechKey: '',
      speechRegion: '',
      tenantId: '',
    });
  });

  it('should handle a bot url change', () => {
    instance.onBotUrlChange('http://localhost:3978');

    expect(instance.state.botUrl).toBe('http://localhost:3978');
  });

  it('should call the appropriate command when onAnchorClick is called', () => {
    instance.props.onAnchorClick('http://blah');
    expect(mockDispatch).toHaveBeenCalledWith(
      executeCommand(true, SharedConstants.Commands.Electron.OpenExternal, null, 'http://blah')
    );
  });
});
