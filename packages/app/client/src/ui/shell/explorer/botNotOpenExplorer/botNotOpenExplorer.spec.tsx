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

import { newNotification, SharedConstants } from '@bfemulator/app-shared';
import { mount } from 'enzyme';
import * as React from 'react';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';
import { beginAdd } from '../../../../data/action/notificationActions';
import { bot } from '../../../../data/reducer/bot';
import { chat } from '../../../../data/reducer/chat';
import { CommandServiceImpl } from '../../../../platform/commands/commandServiceImpl';
import { BotNotOpenExplorer } from './botNotOpenExplorer';
import { BotNotOpenExplorerContainer } from './botNotOpenExplorerContainer';

const mockStore = createStore(combineReducers({ bot, chat }), {});

jest.mock('../../../dialogs', () => ({
  DialogService: {
    showDialog: () => Promise.resolve(true),
    hideDialog: () => Promise.resolve(false),
  }
}));

jest.mock('./botNotOpenExplorer.scss', () => ({}));
jest.mock('../../../../data/store', () => ({
  get store() {
    return mockStore;
  }
}));

describe('The EndpointExplorer component should', () => {
  let parent;
  let node;
  let mockDispatch;

  beforeEach(() => {
    mockDispatch = jest.spyOn(mockStore, 'dispatch');
    parent = mount(<Provider store={ mockStore }>
      <BotNotOpenExplorerContainer/>
    </Provider>);
    node = parent.find(BotNotOpenExplorer);
  });

  it('should show the OpenBotDialog when onOpenBotClick is called', async () => {
    const spy = jest.spyOn(CommandServiceImpl, 'call').mockResolvedValue(true);
    const instance = node.instance();
    await instance.onOpenBotClick();

    expect(spy).toHaveBeenCalledWith(SharedConstants.Commands.UI.ShowOpenBotDialog);
  });

  it('should send a notification if the call to onOpenBotClick fails', async () => {
    const commandServiceSpy = jest.spyOn(CommandServiceImpl, 'call').mockRejectedValue('oh noes!');
    const instance = node.instance();
    await instance.onOpenBotClick();
    const message = `An Error occurred on the Bot Not Open Explorer: oh noes!`;
    const notification = newNotification(message);
    const action = beginAdd(notification);
    notification.timestamp = jasmine.any(Number) as any;
    notification.id = jasmine.any(String) as any;
    expect(mockDispatch).toHaveBeenLastCalledWith(action);

    expect(commandServiceSpy).toHaveBeenLastCalledWith(SharedConstants.Commands.UI.ShowOpenBotDialog);
  });
});
