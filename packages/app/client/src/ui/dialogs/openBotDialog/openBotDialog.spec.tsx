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
  ClientAwareSettings,
  newNotification,
  UserSettings,
} from '@bfemulator/app-shared';
import { mount } from 'enzyme';
import * as React from 'react';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';

import * as BotActions from '../../../data/action/botActions';
import { clientAwareSettingsChanged } from '../../../data/action/clientAwareSettingsActions';
import { beginAdd } from '../../../data/action/notificationActions';
import { bot } from '../../../data/reducer/bot';
import { clientAwareSettings } from '../../../data/reducer/clientAwareSettingsReducer';
import { ActiveBotHelper } from '../../helpers/activeBotHelper';
import { DialogService } from '../service';

import { OpenBotDialog } from './openBotDialog';
import { OpenBotDialogContainer } from './openBotDialogContainer';

let mockStore;
jest.mock('./openBotDialog.scss', () => ({}));
jest.mock('../../../data/store', () => ({
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

interface MockFetch {
  url?: string;
  opts?: MockOpts;
}

interface MockOpts {
  headers: Headers;
  method: 'GET' | 'DELETE' | 'POST';
  body?: any;
}

let mockFetchArgs: MockFetch;
let mockFetchOkValue = true;
let mockStatusText = 'ok';
(window as any).fetch = async (url, opts) => {
  mockFetchArgs = { url, opts };
  return {
    ok: mockFetchOkValue,
    json: async () => ({}),
    text: async () => '{}',
    statusText: mockStatusText,
  };
};
(fetch as any).Headers = class {};
(fetch as any).Response = class {};
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
  let dispatchSpy;
  beforeEach(() => {
    mockStore = createStore(combineReducers({ bot, clientAwareSettings }));
    mockStore.dispatch(BotActions.load(bots));
    mockStore.dispatch(
      clientAwareSettingsChanged({
        serverUrl: 'http://localhost:3543',
        users: {
          usersById: { user1: {} },
          currentUserId: 'user1',
        } as UserSettings,
      } as ClientAwareSettings)
    );
    dispatchSpy = jest.spyOn(mockStore, 'dispatch');
    parent = mount(
      <Provider store={mockStore}>
        <OpenBotDialogContainer />
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
        dataset: { prop: 'botUrl' },
        type: 'text',
        value: 'http://localhost:6500/api/messages',
      },
    } as any);

    expect(instance.state.botUrl).toBe('http://localhost:6500/api/messages');

    instance.onInputChange({
      target: {
        type: 'file',
        dataset: { prop: 'botUrl' },
        files: { item: () => ({ path: 'some/path/to/myBot.bot' }) },
      },
    } as any);

    expect(instance.state.botUrl).toBe('some/path/to/myBot.bot');
  });

  it('should select all text in the input when focused', () => {
    const spy = jest.fn();
    const mockInput = {
      value: 'this is some text',
      setSelectionRange: spy,
    };

    instance.onFocus({ target: mockInput } as any);

    expect(spy).toHaveBeenCalledWith(0, 17);
  });

  it('should open a bot when a path is provided', async () => {
    instance.onInputChange({
      target: {
        dataset: { prop: 'botUrl' },
        type: 'file',
        files: { item: () => ({ path: 'some/path/to/myBot.bot' }) },
      },
    } as any);

    const botHelperSpy = jest
      .spyOn(ActiveBotHelper, 'confirmAndOpenBotFromFile')
      .mockResolvedValue(true);
    await instance.onSubmit();

    expect(botHelperSpy).toHaveBeenCalledWith('some/path/to/myBot.bot');
  });

  it('should open an endpoint when a URL is provided', async () => {
    instance.onInputChange({
      target: {
        dataset: { prop: 'botUrl' },
        type: 'text',
        value: 'http://localhost:6500/api/messages',
      },
    } as any);

    await instance.onSubmit();

    const { url, opts } = mockFetchArgs;
    expect(url).toBe(
      'http://localhost:3543/v3/conversations?botEndpoint=http://localhost:6500/api/messages&msaAppId=&msaPassword='
    );

    const { body, headers, method } = opts;
    expect(headers === headers).toBeTruthy();
    expect(method).toBe('POST');
    expect(JSON.parse(body)).toEqual({
      bot: {
        id: jasmine.any(String),
        name: 'Bot',
        role: 'bot',
      },
      members: [{}],
    });
  });

  it('should send a notification if the submit function fails to open ', async () => {
    mockFetchOkValue = false;
    mockStatusText = 'oh noes!';
    instance.onInputChange({
      target: {
        dataset: { prop: 'botUrl' },
        type: 'text',
        value: 'http://localhost:6500/api/messages',
      },
    } as any);

    await instance.onSubmit();
    const notification = newNotification(
      `An Error occurred on the Open Bot Dialog: Error: Failed to create a new conversation: oh noes!`
    );
    notification.id = jasmine.any(String);
    notification.timestamp = jasmine.any(Number);
    expect(dispatchSpy).toHaveBeenCalledWith(beginAdd(notification));
  });

  it('should set the state for appId, appPassword and botUrl when json is pasted in any input field', () => {
    const value = `{
      "appId": "abc123",
      "appPassword": "321cba",
      "endpoint": "http://localhost/api/messages"
    }`;
    const mockEvent = {
      target: {
        value,
      },
      preventDefault: () => void 0,
    };
    const spy = jest.spyOn(mockEvent, 'preventDefault');
    instance.onInputRefChange(mockEvent as any);
    expect(instance.state.appId).toEqual('abc123');
    expect(instance.state.appPassword).toEqual('321cba');
    expect(instance.state.botUrl).toEqual('http://localhost/api/messages');
    expect(spy).toHaveBeenCalled();
  });
});
