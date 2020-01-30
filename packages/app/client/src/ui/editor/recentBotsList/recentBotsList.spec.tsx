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

import { bot, executeCommand, load, openContextMenuForBot, SharedConstants } from '@bfemulator/app-shared';
import { mount } from 'enzyme';
import * as React from 'react';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';

import { RecentBotsList } from './recentBotsList';
import { RecentBotsListContainer } from './recentBotsListContainer';

const mockStore = createStore(combineReducers({ bot }));
jest.mock('./recentBotsList.scss', () => ({}));
jest.mock('../../dialogs', () => ({}));
jest.mock('../../dialogs/dialogStyles.scss', () => ({}));
jest.mock('../../dialogs/botCreationDialog/botCreationDialog.scss', () => ({}));
jest.mock('../../dialogs/openBotDialog/openBotDialog.scss', () => ({}));

const bots = [
  {
    path: '/some/path',
    displayName: 'mockMock',
    transcriptsPath: '/Users/microsoft/Documents/testbot/transcripts',
    chatsPath: '/Users/microsoft/Documents/testbot/dialogs',
  },
];

describe('The RecentBotsList', () => {
  let mockDispatch;
  let node;
  let parent;
  let instance;
  const mockOnBotSelected = jest.fn();

  beforeEach(() => {
    mockStore.dispatch(load(bots));
    mockDispatch = jest.spyOn(mockStore, 'dispatch');
    parent = mount(
      <Provider store={mockStore}>
        <RecentBotsListContainer onBotSelected={mockOnBotSelected} />
      </Provider>
    );
    node = parent.find(RecentBotsList);
    instance = node.instance();
  });

  it('should dispatch the appropriate action when a context menu is invoked over a bot in the list', () => {
    instance.onBotContextMenu({
      currentTarget: {
        dataset: {
          index: 0,
        },
      },
    } as any);

    expect(mockDispatch).toHaveBeenCalledWith(openContextMenuForBot((mockStore.getState() as any).bot.botFiles[0]));
  });

  it('should call the appropriate command when a bot from the list is deleted', async () => {
    await instance.onDeleteBotClick({
      currentTarget: {
        dataset: {
          index: 0,
        },
      },
    } as any);
    const { RemoveFromBotList } = SharedConstants.Commands.Bot;
    expect(mockDispatch).toHaveBeenCalledWith(executeCommand(true, RemoveFromBotList, null, '/some/path'));
  });

  it('should call the onBotSelected function passed in the props when a bot it selected from the list', () => {
    instance.onBotClick({
      currentTarget: {
        dataset: {
          index: 0,
        },
      },
    } as any);

    expect(mockOnBotSelected).toHaveBeenCalledWith(bots[0]);
  });
});
