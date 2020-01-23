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
import { combineReducers, createStore } from 'redux';
import { mount, ReactWrapper } from 'enzyme';
import {
  ngrokTunnel,
  updateNewTunnelInfo,
  TunnelInfo,
  TunnelStatus,
  updateTunnelStatus,
  updateTunnelError,
} from '@bfemulator/app-shared';

import { NgrokDebuggerContainer } from './ngrokDebuggerContainer';
import { NgrokDebugger } from './ngrokDebugger';

const mockClasses = jest.fn(() => ({
  errorDetailedViewer: 'error-window',
  tunnelActive: 'tunnel-active',
  tunnelInactive: 'tunnel-inactive',
  tunnelError: 'tunnel-error',
}));

jest.mock('./ngrokDebuggerContainer.scss', () => ({
  get errorDetailedViewer() {
    return mockClasses().errorDetailedViewer;
  },
  get tunnelActive() {
    return mockClasses().tunnelActive;
  },
  get tunnelError() {
    return mockClasses().tunnelError;
  },
  get tunnelInactive() {
    return mockClasses().tunnelInactive;
  },
}));

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
  const mockStore = createStore(combineReducers({ ngrokTunnel }));
  let mockDispatch;
  const mockClassesImpl = mockClasses();

  beforeAll(() => {
    parent = mount(
      <Provider store={mockStore}>
        <NgrokDebuggerContainer />
      </Provider>
    );
    wrapper = parent.find(NgrokDebugger);
  });

  beforeEach(() => {
    const info: TunnelInfo = {
      publicUrl: 'https://ncfdsd.ngrok.io/',
      inspectUrl: 'http://127.0.0.1:4000',
      logPath: 'ngrok.log',
      postmanCollectionPath: 'postman.json',
    };
    mockDispatch = jest.spyOn(mockStore, 'dispatch');
    mockStore.dispatch(updateNewTunnelInfo(info));
    mockStore.dispatch(
      updateTunnelStatus({
        tunnelStatus: TunnelStatus.Inactive,
      })
    );
  });

  it('should render without errors', () => {
    mockStore.dispatch(
      updateTunnelStatus({
        tunnelStatus: TunnelStatus.Active,
      })
    );
    expect(wrapper.find(NgrokDebugger)).toBeDefined();
  });

  it('should show the new tunnel status when tunnel status is changed from an action', () => {
    expect(wrapper.find(mockClassesImpl.errorDetailedViewer)).toEqual({});
    mockStore.dispatch(
      updateTunnelStatus({
        tunnelStatus: TunnelStatus.Error,
      })
    );
    expect(wrapper.find(mockClassesImpl.errorDetailedViewer)).toBeDefined();
  });

  it('should update classes when tunnel status changes', () => {
    expect(wrapper.find(mockClassesImpl.tunnelInactive)).toBeDefined();
    mockStore.dispatch(
      updateTunnelStatus({
        tunnelStatus: TunnelStatus.Active,
      })
    );
    expect(wrapper.find(mockClassesImpl.tunnelActive)).toBeDefined();
    mockStore.dispatch(
      updateTunnelStatus({
        tunnelStatus: TunnelStatus.Error,
      })
    );
    expect(wrapper.find(mockClassesImpl.tunnelError)).toBeDefined();
  });

  it('should show that tunnel has expired', () => {
    mockStore.dispatch(
      updateTunnelStatus({
        tunnelStatus: TunnelStatus.Error,
      })
    );
    mockStore.dispatch(
      updateTunnelError({
        statusCode: 402,
        errorMessage: 'Tunnel has expired',
      })
    );
    expect(wrapper.text().includes('ngrok tunnel has expired')).toBeTruthy();
  });

  it('should show that tunnel has too many connections', () => {
    mockStore.dispatch(
      updateTunnelStatus({
        tunnelStatus: TunnelStatus.Error,
      })
    );
    mockStore.dispatch(
      updateTunnelError({
        statusCode: 429,
        errorMessage: 'Tunnel has too many connections',
      })
    );
    expect(wrapper.html().includes('Signup for Ngrok account')).toBeTruthy();
  });

  it('should show that tunnel has expired', () => {
    mockStore.dispatch(
      updateTunnelStatus({
        tunnelStatus: TunnelStatus.Error,
      })
    );
    mockStore.dispatch(
      updateTunnelError({
        statusCode: 402,
        errorMessage: 'Tunnel has expired',
      })
    );
    expect(wrapper.html().includes('ngrok tunnel has expired.')).toBeTruthy();
  });

  it('should show a generic tunnel error message', () => {
    mockStore.dispatch(
      updateTunnelStatus({
        tunnelStatus: TunnelStatus.Error,
      })
    );
    mockStore.dispatch(
      updateTunnelError({
        statusCode: -9999,
        errorMessage: 'Dummy tunnel error',
      })
    );
    expect(wrapper.html().includes('Looks like the ngrok tunnel does not exist anymore.')).toBeTruthy();
  });
});
