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
import { mount } from 'enzyme';
import * as React from 'react';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';
import { bot, chat } from '@bfemulator/app-shared';

import BotExplorerBar from './botExplorerBar';
import { BotExplorerBarContainer } from './botExplorerBarContainer';

jest.mock('../../../dialogs', () => ({}));

jest.mock('electron', () => ({
  remote: {
    app: {
      isPackaged: false,
    },
  },
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

const mockStore = createStore(combineReducers({ bot, chat }));

describe('The BotExplorerBotContainer component', () => {
  let parent;
  let node;
  beforeEach(() => {
    parent = mount(
      <Provider store={mockStore}>
        <BotExplorerBarContainer />
      </Provider>
    );
    node = parent.find(BotExplorerBar);
  });

  it('should render deeply', () => {
    expect(parent.find(BotExplorerBarContainer)).not.toBe(null);
    expect(parent.find(BotExplorerBar)).not.toBe(null);
  });

  it('should set a button ref', () => {
    const mockButtonRef: any = {};
    node.instance().setOpenBotSettingsRef(mockButtonRef);

    expect(node.instance().openBotSettingsButtonRef).toBe(mockButtonRef);
  });
});
