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
import { SharedConstants } from '@bfemulator/app-shared';
import { mount } from 'enzyme';
import * as React from 'react';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';

import { azureArmTokenDataChanged } from '../../../state/actions/azureAuthActions';
import * as BotActions from '../../../state/actions/botActions';
import { azureAuth } from '../../../state/reducers/azureAuth';
import { clientAwareSettings } from '../../../state/reducers/clientAwareSettings';
import { bot } from '../../../state/reducers/bot';
import { executeCommand } from '../../../state/actions/commandActions';

import { WelcomePage } from './welcomePage';
import { WelcomePageContainer } from './welcomePageContainer';

const mockStore = createStore(combineReducers({ azureAuth, bot, clientAwareSettings }));
jest.mock('../../dialogs', () => ({}));
jest.mock('../../../state/store', () => ({
  get store() {
    return mockStore;
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

const mockArmToken = 'bm90aGluZw==.eyJ1cG4iOiJnbGFzZ293QHNjb3RsYW5kLmNvbSJ9.7gjdshgfdsk98458205jfds9843fjds';
const bots = [
  {
    path: '/Users/microsoft/Documents/testbot/contoso-cafe-bot.bot',
    displayName: 'contoso-cafe-bot',
    transcriptsPath: '/Users/microsoft/Documents/testbot/transcripts',
    chatsPath: '/Users/microsoft/Documents/testbot/dialogs',
  },
  {
    path: '/Users/microsoft/Documents/testbot/TestBot.bot',
    displayName: 'TestBots',
    transcriptsPath: '/Users/microsoft/Documents/testbot/transcripts',
    chatsPath: '/Users/microsoft/Documents/testbot/dialogs',
  },
];
describe('The AzureLoginFailedDialogContainer component should', () => {
  let parent;
  let node;
  let instance: any;
  let mockDispatch;
  beforeEach(() => {
    mockStore.dispatch(azureArmTokenDataChanged(mockArmToken));
    mockStore.dispatch(BotActions.load(bots));
    mockDispatch = jest.spyOn(mockStore, 'dispatch');
    parent = mount(
      <Provider store={mockStore}>
        <WelcomePageContainer />
      </Provider>
    );
    node = parent.find(WelcomePage);
    instance = node.instance() as WelcomePage;
  });

  it('should render deeply', () => {
    expect(parent.find(WelcomePageContainer)).not.toBe(null);
    expect(parent.find(WelcomePage)).not.toBe(null);
  });

  it('should call the appropriate command when a recent bot is clicked', () => {
    instance.onBotSelected(bots[1]);
    expect(mockDispatch).toHaveBeenCalledWith(
      executeCommand(false, SharedConstants.Commands.Bot.Switch, null, '/Users/microsoft/Documents/testbot/TestBot.bot')
    );
  });

  it('should call the appropriate command when onOpenBotClick is called', async () => {
    await instance.onOpenBotClick();
    expect(mockDispatch).toHaveBeenCalledWith(executeCommand(false, SharedConstants.Commands.UI.ShowOpenBotDialog));
  });

  it('should call the appropriate command when openBotInspectorDocs is called', async () => {
    instance.props.openBotInspectorDocs();
    const { Commands, Channels } = SharedConstants;
    expect(mockDispatch).toHaveBeenCalledWith(
      executeCommand(false, Commands.UI.ShowMarkdownPage, null, Channels.ReadmeUrl, Channels.HelpLabel)
    );
  });
});
