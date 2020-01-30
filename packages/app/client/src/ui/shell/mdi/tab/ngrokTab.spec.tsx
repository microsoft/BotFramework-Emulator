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
import { mount } from 'enzyme';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import {
  editor,
  ngrokTunnel,
  updateNewTunnelInfo,
  updateTunnelStatus,
  TunnelInfo,
  TunnelStatus,
} from '@bfemulator/app-shared';

import { NgrokTabContainer } from './ngrokTabContainer';
import { NgrokTab } from './ngrokTab';

jest.mock('./ngrokTab.scss', () => ({
  ngrokTab: 'ngrok',
  tunnelActive: 'active',
  tunnelError: 'error',
  tunnelInactive: 'inactive',
  blinkerError: 'blinker',
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
let mockStore;
jest.mock('../../../../../src/state/store', () => ({
  get store() {
    return mockStore;
  },
}));
let mockDispatch;
let wrapper;
let node;
let instance;
describe('Ngrok Tab', () => {
  const mockOnCloseClick = jest.fn(() => null);

  beforeEach(() => {
    mockStore = createStore(combineReducers({ ngrokTunnel, editor }));
    mockDispatch = jest.spyOn(mockStore, 'dispatch');
    wrapper = mount(
      <Provider store={mockStore}>
        <NgrokTabContainer
          active={false}
          dirty={false}
          documentId="doc-1"
          label="Ngrok"
          onCloseClick={mockOnCloseClick}
        />
      </Provider>
    );
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
        tunnelStatus: TunnelStatus.Active,
      })
    );
    node = wrapper.find(NgrokTab);
    instance = node.instance();
  });

  it('should render without error', () => {
    expect(wrapper.find(NgrokTab)).not.toBe(null);
  });

  it('should remove blinker class when made active', () => {
    const unchangedProps = {
      dirty: false,
      documentId: 'doc-1',
      label: 'Ngrok',
      onCloseClick: mockOnCloseClick,
      tunnelStatus: TunnelStatus.Error,
    };
    const props = {
      ...unchangedProps,
      active: false,
    };
    wrapper = mount(<NgrokTab {...props} />);
    expect(wrapper.find('.blinker').length).toBe(1);
    wrapper.setProps({
      active: true,
    });
    wrapper.update();
    expect(wrapper.find('.blinker').length).toBe(0);
    wrapper.setProps({
      active: false,
    });
    expect(wrapper.find('.blinker').length).toBe(0);
  });

  it('should switch to active class when tunnel status changes', done => {
    expect(wrapper.html().includes('active')).toBeTruthy();
    mockStore.dispatch(
      updateTunnelStatus({
        tunnelStatus: TunnelStatus.Error,
      })
    );
    wrapper.update();
    setTimeout(() => {
      expect(wrapper.html().includes('error')).toBeTruthy();
      done();
    });
  });
});
