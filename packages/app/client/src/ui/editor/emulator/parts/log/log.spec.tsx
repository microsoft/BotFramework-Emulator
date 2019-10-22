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
import { createStore } from 'redux';
import { mount, ReactWrapper } from 'enzyme';

import { LogContainer } from './logContainer';
import { Log } from './log';
import { LogEntry } from './logEntry';

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

describe('log component', () => {
  let parent: ReactWrapper;
  let wrapper: ReactWrapper;

  beforeEach(() => {
    const storeState = {
      chat: {
        chats: {
          doc1: {
            log: {
              entries: [{ items: [] }, { items: [] }, { items: [] }],
            },
          },
        },
      },
    };
    parent = mount(
      <Provider store={createStore((state, action) => state, storeState)}>
        <LogContainer documentId={'doc1'} />
      </Provider>
    );
    wrapper = parent.find(Log);
  });

  it('should render entry component(s) based on props', () => {
    expect(wrapper.find(LogEntry)).toHaveLength(3);
  });
});
