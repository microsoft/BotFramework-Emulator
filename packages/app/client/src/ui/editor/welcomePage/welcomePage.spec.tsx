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
  azureAuth,
  azureArmTokenDataChanged,
  bot,
  clientAwareSettings,
  executeCommand,
  load,
  CommandAction,
  CommandActionPayload,
  SharedConstants,
  EXECUTE_COMMAND,
} from '@bfemulator/app-shared';
import { mount } from 'enzyme';
import * as React from 'react';
import { Provider } from 'react-redux';
import { combineReducers, createStore, applyMiddleware } from 'redux';
import sagaMiddlewareFactory from 'redux-saga';

import { commandSagas } from '../../../state/sagas/commandSagas';

import { WelcomePage } from './welcomePage';
import { WelcomePageContainer } from './welcomePageContainer';
import { HowToBuildABotContainer } from './howToBuildABotContainer';
import { HowToBuildABot } from './howToBuildABot';

jest.mock('../../dialogs', () => ({}));

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

const sagaMiddleware = sagaMiddlewareFactory();
const mockStore = createStore(
  combineReducers({ azureAuth, bot, clientAwareSettings }),
  {},
  applyMiddleware(sagaMiddleware)
);
sagaMiddleware.run(commandSagas);

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
describe('The WelcomePageContainer component should', () => {
  let parent;
  let node;
  let instance: any;
  let mockDispatch;
  beforeEach(() => {
    mockStore.dispatch(azureArmTokenDataChanged(mockArmToken));
    mockStore.dispatch(load(bots));

    mockDispatch = jest
      .spyOn(mockStore, 'dispatch')
      .mockImplementation((action: CommandAction<CommandActionPayload>) => {
        if (
          action.type === EXECUTE_COMMAND &&
          action.payload.commandName === SharedConstants.Commands.UI.ShowOpenBotDialog
        ) {
          action.payload.resolver();
        }

        return action;
      });

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
    const mockOnOpenBot = {
      focus: jest.fn(() => {
        return null;
      }),
    };

    instance.openBotButtonRef = mockOnOpenBot;

    await instance.onOpenBotClick();
    expect(mockDispatch).toHaveBeenCalledWith(
      executeCommand(false, SharedConstants.Commands.UI.ShowOpenBotDialog, expect.any(Function))
    );
    expect(mockOnOpenBot.focus).toHaveBeenCalledTimes(1);
  });

  it('should call the appropriate command when openBotInspectorDocs is called', async () => {
    instance.props.openBotInspectorDocs();
    const { Commands, Channels } = SharedConstants;
    expect(mockDispatch).toHaveBeenCalledWith(
      executeCommand(false, Commands.UI.ShowMarkdownPage, null, Channels.ReadmeUrl, Channels.HelpLabel)
    );
  });

  it('should call the appropriate command when onAnchorClick is called', () => {
    instance.props.onAnchorClick('http://blah');
    expect(mockDispatch).toHaveBeenCalledWith(
      executeCommand(true, SharedConstants.Commands.Electron.OpenExternal, null, 'http://blah')
    );
  });

  it('should set a button ref', () => {
    const mockButtonRef: any = {};
    instance.setOpenBotButtonRef(mockButtonRef);
    instance.setNewBotButtonRef(mockButtonRef);
    instance.setSignInToAzureButtonRef(mockButtonRef);

    expect(instance.newBotButtonRef).toBe(mockButtonRef);
    expect(instance.openBotButtonRef).toBe(mockButtonRef);
    expect(instance.signIntoAzureButtonRef).toBe(mockButtonRef);
  });
});

describe('The HowToBuildABotContainer', () => {
  let parent;
  let node;
  let instance: any;
  let mockDispatch;
  beforeEach(() => {
    mockStore.dispatch(azureArmTokenDataChanged(mockArmToken));
    mockStore.dispatch(load(bots));

    mockDispatch = jest
      .spyOn(mockStore, 'dispatch')
      .mockImplementation((action: CommandAction<CommandActionPayload>) => {
        if (
          action.type === EXECUTE_COMMAND &&
          action.payload.commandName === SharedConstants.Commands.UI.ShowOpenBotDialog
        ) {
          action.payload.resolver();
        }

        return action;
      });

    parent = mount(
      <Provider store={mockStore}>
        <HowToBuildABotContainer />
      </Provider>
    );
    node = parent.find(HowToBuildABot);
    instance = node.instance() as HowToBuildABot;
  });

  it('should call the appropriate command when onAnchorClick is called', () => {
    instance.props.onAnchorClick('http://blah');
    expect(mockDispatch).toHaveBeenCalledWith(
      executeCommand(true, SharedConstants.Commands.Electron.OpenExternal, null, 'http://blah')
    );
  });
});
