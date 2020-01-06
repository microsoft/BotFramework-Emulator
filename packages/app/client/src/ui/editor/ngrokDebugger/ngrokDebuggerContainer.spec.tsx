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

//TODO: More UI tests to be added
import * as React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { mount, ReactWrapper } from 'enzyme';
import { NgrokDebugger, NgrokDebuggerContainer } from './ngrokDebuggerContainer';
import { TunnelStatus } from '../../../state';

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

describe('Ngrok Debugger container', () => {
  let parent: ReactWrapper;
  let wrapper: ReactWrapper;

  beforeEach(() => {
    const storeState = {
      ngrokTunnel: {
        inspectUrl: 'http://127.0.0.1/',
        errors: {},
        publicUrl: 'https://dcfgh.ngrok.io/',
        logPath: 'ngrok.log',
        postmanCollectionPath: 'postman.json',
        tunnelStatus: TunnelStatus.Inactive,
        lastTunnelStatusCheckTS: 'Dec 30th 2019 5.30PM',
      },
    };
    parent = mount(
      <Provider store={createStore((state, action) => state, storeState)}>
        <NgrokDebuggerContainer />
      </Provider>
    );
    wrapper = parent.find(NgrokDebugger);
  });

  it('should render without errors', () => {
    expect(wrapper.find(NgrokDebugger)).toBeDefined();
  });
});
