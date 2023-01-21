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
  beginAdd,
  bot,
  chat,
  executeCommand,
  newNotification,
  CommandAction,
  CommandActionPayload,
  SharedConstants,
  EXECUTE_COMMAND,
} from '@bfemulator/app-shared';
import { mount } from 'enzyme';
import * as React from 'react';
import { Provider } from 'react-redux';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import sagaMiddlewareFactory from 'redux-saga';

import { commandSagas } from '../../../../state/sagas/commandSagas';
import { ActiveBotHelper } from '../../../helpers/activeBotHelper';

import { BotNotOpenExplorer } from './botNotOpenExplorer';
import { BotNotOpenExplorerContainer } from './botNotOpenExplorerContainer';

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
const mockStore = createStore(combineReducers({ bot, chat }), {}, applyMiddleware(sagaMiddleware));
sagaMiddleware.run(commandSagas);

jest.mock('../../../../state/store', () => ({
  get store() {
    return mockStore;
  },
}));

describe('The EndpointExplorer component should', () => {
  let parent;
  let node;
  let mockDispatch;
  let instance;

  beforeEach(() => {
    mockDispatch = jest
      .spyOn(mockStore, 'dispatch')
      .mockImplementation((action: CommandAction<CommandActionPayload>) => {
        if (
          action.type === EXECUTE_COMMAND &&
          action.payload.commandName === SharedConstants.Commands.UI.ShowBotCreationDialog
        ) {
          action.payload.resolver();
        }

        return action;
      });

    parent = mount(
      <Provider store={mockStore}>
        <BotNotOpenExplorerContainer />
      </Provider>
    );
    node = parent.find(BotNotOpenExplorer);
    instance = node.instance();
  });

  it('should make the appropriate calls when onCreateNewBotClick in called', async () => {
    const mockCreateNewBotButton = {
      focus: jest.fn(() => {
        return null;
      }),
    };
    instance.createNewBotButtonRef = mockCreateNewBotButton;

    await instance.onCreateNewBotClick();
    expect(mockDispatch).toHaveBeenCalledWith(
      executeCommand(false, SharedConstants.Commands.UI.ShowBotCreationDialog, expect.any(Function))
    );
    expect(mockCreateNewBotButton.focus).toHaveBeenCalledTimes(1);
  });

  it('should make the appropriate calls when onOpenBotFileClick in called', async () => {
    const spy = jest.spyOn(ActiveBotHelper, 'confirmAndOpenBotFromFile').mockResolvedValue(true);
    await instance.onOpenBotFileClick();
    expect(spy).toHaveBeenCalled();
  });

  it('should send a notification when onOpenBotFileClick fails', async () => {
    const spy = jest.spyOn(ActiveBotHelper, 'confirmAndOpenBotFromFile').mockRejectedValue('oh noes!');
    await instance.onOpenBotFileClick();
    const message = `An Error occurred on the Bot Not Open Explorer: oh noes!`;
    const notification = newNotification(message);
    const action = beginAdd(notification);
    notification.timestamp = expect.any(Number) as any;
    notification.id = expect.any(String) as any;
    expect(mockDispatch).toHaveBeenLastCalledWith(action);

    expect(spy).toHaveBeenCalled();
  });
});
