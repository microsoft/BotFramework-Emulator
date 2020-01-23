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
import { ServiceTypes } from 'botframework-config/lib/schema';
import { BotConfigWithPathImpl } from '@bfemulator/sdk-shared';
import { bot, chatFilesUpdated, load, setActive, resources, transcriptsUpdated } from '@bfemulator/app-shared';

import { ResourcesBar } from './resourcesBar';
import { ResourcesBarContainer } from './resourcesBarContainer';
const mockClass = class {};
const mockStore = createStore(combineReducers({ resources, bot }), {});
jest.mock('../../../dialogs/resourcesSettings/resourcesSettings.scss', () => ({}));
jest.mock('./resourcesBar.scss', () => ({}));
jest.mock('../explorerStyles.scss', () => ({}));
jest.mock('../servicePane/servicePane.scss', () => ({}));
jest.mock('../resourceExplorer/resourceExplorer.scss', () => ({}));
jest.mock('../../../dialogs', () => ({
  DialogService: {
    showDialog: () => Promise.resolve(true),
    hideDialog: () => Promise.resolve(false),
  },
  get ResourcesSettingsContainer() {
    return mockClass;
  },
}));
describe('The ServicesExplorer component should', () => {
  let parent;
  let node;
  let mockChat;
  let mockTranscript;
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
            "appPassword": "jxZjGcOpyfM4q75vp2paNQd",
            "endpoint": "https://testbot.botframework.com/api/messagesv3"
        }]
      }`);

    mockChat = BotConfigWithPathImpl.serviceFromJSON({
      type: ServiceTypes.File,
      path: 'the/file/path/chat.chat',
      name: 'testChat',
    } as any);

    mockTranscript = BotConfigWithPathImpl.serviceFromJSON({
      type: ServiceTypes.File,
      path: 'the/file/path/transcript.transcript',
      name: 'testTranscript',
    } as any);

    mockStore.dispatch(load([mockBot]));
    mockStore.dispatch(setActive(mockBot));
    mockStore.dispatch(transcriptsUpdated([mockTranscript]));
    mockStore.dispatch(chatFilesUpdated([mockChat]));
    parent = mount(
      <Provider store={mockStore}>
        <ResourcesBarContainer />
      </Provider>
    );
    node = parent.find(ResourcesBar);
  });

  it('should render deeply', () => {
    expect(parent.find(ResourcesBarContainer)).not.toBe(null);
    expect(node).not.toBe(null);
  });
});
