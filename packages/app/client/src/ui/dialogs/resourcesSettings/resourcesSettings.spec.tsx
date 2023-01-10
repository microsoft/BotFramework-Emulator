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
import { mount } from 'enzyme';
import { combineReducers, createStore } from 'redux';
import { bot, executeCommand, load, resources, setActive, SharedConstants } from '@bfemulator/app-shared';

import { ResourcesSettings } from './resourcesSettings';
import { ResourcesSettingsContainer } from './resourcesSettingsContainer';

const mockStore = createStore(combineReducers({ resources, bot }));

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

jest.mock('../service', () => ({
  DialogService: {
    showDialog: () => Promise.resolve(true),
    hideDialog: () => Promise.resolve(false),
  },
}));

jest.mock('../../../state/store', () => ({
  RootState: () => ({}),
  get store() {
    return mockStore;
  },
}));

jest.mock('../../../state/helpers/botHelpers', () => ({
  getBotInfoByPath: () => ({}),
}));

describe('The ResourcesSettings component should', () => {
  let parent;
  let node;
  let dispatchSpy;

  beforeEach(() => {
    const mockBot = JSON.parse(`{
        "name": "TestBot",
        "description": "",
        "padlock": "",
        "services": [{
            "type": "luis",
            "name": "https://testbot.botframework.com/api/messagesv3",
            "id": "https://testbot.botframework.com/api/messagesv3",
            "appId": "51fc2648-1190-44fa-9559-87b11b1d0014",
            "appPassword": "MOCK_TEST_SECRET",
            "endpoint": "https://testbot.botframework.com/api/messagesv3"
        }]
      }`);

    mockStore.dispatch(load([mockBot]));
    mockStore.dispatch(setActive(mockBot));
    dispatchSpy = jest.spyOn(mockStore, 'dispatch');
    parent = mount(
      <Provider store={mockStore}>
        <ResourcesSettingsContainer label="test" progress={50} />
      </Provider>
    );
    node = parent.find(ResourcesSettings);
  });

  it('should render deeply', () => {
    expect(parent.find(ResourcesSettingsContainer)).not.toBe(null);
    expect(parent.find(ResourcesSettings)).not.toBe(null);
  });

  it('should contain a cancel function in the props', () => {
    expect(typeof (node.props() as any).cancel).toBe('function');
    expect(typeof (node.props() as any).save).toBe('function');
    expect(typeof (node.props() as any).showOpenDialog).toBe('function');
  });

  it('should update the state when the chat input is changed', () => {
    const instance = node.instance();
    expect(instance.state.chatsPath).toBeUndefined();
    const mockEvent = {
      target: { value: 'hello', dataset: { prop: 'chatsPath' } },
    };
    instance.onInputChange(mockEvent as any);
    expect(instance.state.chatsPath).toBe('hello');
  });

  it('should update the state when the transcript input is changed', () => {
    const instance = node.instance();
    expect(instance.state.transcriptsPath).toBeUndefined();
    const mockEvent = {
      target: { value: 'hello', dataset: { prop: 'transcriptsPath' } },
    };
    instance.onInputChange(mockEvent as any);
    expect(instance.state.transcriptsPath).toBe('hello');
  });

  it('should open the browse dialog when the browse anchor is clicked', async () => {
    const instance = node.instance();
    // don't wait on this method because the resolver will never be called due
    // to the fact that the actual command saga isn't being called
    instance.onBrowseClick({
      currentTarget: { getAttribute: () => 'attr' },
    } as any);
    expect(dispatchSpy).toHaveBeenCalledWith(
      executeCommand(true, SharedConstants.Commands.Electron.ShowOpenDialog, expect.any(Function), {
        properties: ['openDirectory'],
      })
    );
  });
});
