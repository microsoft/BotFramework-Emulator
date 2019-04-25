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

import { azureArmTokenDataChanged } from '../../../data/action/azureAuthActions';
import * as BotActions from '../../../data/action/botActions';
import { azureAuth } from '../../../data/reducer/azureAuthReducer';
import { clientAwareSettings } from '../../../data/reducer/clientAwareSettingsReducer';
import { bot } from '../../../data/reducer/bot';
import { CommandServiceImpl } from '../../../platform/commands/commandServiceImpl';

import { WelcomePage } from './welcomePage';
import { WelcomePageContainer } from './welcomePageContainer';

const mockStore = createStore(combineReducers({ azureAuth, bot, clientAwareSettings }));
jest.mock('../../dialogs', () => ({}));
jest.mock('../../../data/store', () => ({
  get store() {
    return mockStore;
  },
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
  beforeEach(() => {
    mockStore.dispatch(azureArmTokenDataChanged(mockArmToken));
    mockStore.dispatch(BotActions.loadBotInfos(bots));
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
    const spy = jest.spyOn(CommandServiceImpl, 'call');
    instance.onBotSelected(bots[1]);
    const { Switch } = SharedConstants.Commands.Bot;
    expect(spy).toHaveBeenCalledWith(Switch, '/Users/microsoft/Documents/testbot/TestBot.bot');
  });

  it('should call the appropriate command when onOpenBotClick is called', async () => {
    const spy = jest.spyOn(CommandServiceImpl, 'call');
    await instance.onOpenBotClick();
    expect(spy).toHaveBeenCalledWith(SharedConstants.Commands.UI.ShowOpenBotDialog);
  });

  it('should call the appropriate command when openBotInspectorDocs is called', async () => {
    const callSpy = jest.spyOn(CommandServiceImpl, 'call');
    instance.props.openBotInspectorDocs();
    expect(callSpy).toHaveBeenCalledWith(
      SharedConstants.Commands.UI.ShowMarkdownPage,
      SharedConstants.Channels.ReadmeUrl,
      SharedConstants.Channels.HelpLabel
    );
  });
});
