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

import { executeCommand, SharedConstants } from '@bfemulator/app-shared';
import * as React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

import { DialogService } from '../service';

import { DataCollectionDialog } from './dataCollectionDialog';
import { DataCollectionDialogContainer } from './dataCollectionDialogContainer';

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

describe('<DataCollectionDialogContainer />', () => {
  let wrapper;
  let mockDispatch;
  let node;
  let instance;

  beforeEach(() => {
    const mockStore = createStore((state, _action) => state);
    mockDispatch = jest.spyOn(mockStore, 'dispatch');
    wrapper = mount(
      <Provider store={mockStore}>
        <DataCollectionDialogContainer />
      </Provider>
    );
    node = wrapper.find(DataCollectionDialog);
    instance = wrapper.find(DataCollectionDialog).instance();
  });

  it('should render properly', () => {
    expect(wrapper.find(DataCollectionDialog)).toHaveLength(1);
  });

  it('should hide the dialog and return the proper result', () => {
    const hideDialogSpy = jest.spyOn(DialogService, 'hideDialog');
    instance.onConfirmOrCancel({ target: { name: 'yes' } });

    expect(hideDialogSpy).toHaveBeenCalledWith(true);
  });

  it('should call the appropriate command when onAnchorClick is called', () => {
    instance.props.onAnchorClick('http://blah');
    expect(mockDispatch).toHaveBeenCalledWith(
      executeCommand(true, SharedConstants.Commands.Electron.OpenExternal, null, 'http://blah')
    );
  });
});
