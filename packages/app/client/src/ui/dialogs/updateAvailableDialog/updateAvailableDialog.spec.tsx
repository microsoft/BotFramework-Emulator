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

import { createStore } from 'redux';
import { Provider } from 'react-redux';
import * as React from 'react';
import { mount } from 'enzyme';
import { navBar } from '@bfemulator/app-shared';

import { UpdateAvailableDialogContainer } from './updateAvailableDialogContainer';
import { Options, UpdateAvailableDialog } from './updateAvailableDialog';

let mockHideDialog;
jest.mock('../service', () => ({
  DialogService: {
    get hideDialog() {
      return mockHideDialog;
    },
  },
}));

jest.mock('../../dialogs', () => ({}));

describe('UpdateAvailableDialog', () => {
  let wrapper;
  let node;
  let instance;

  beforeEach(() => {
    wrapper = mount(
      <Provider store={createStore(navBar)}>
        <UpdateAvailableDialogContainer />
      </Provider>
    );

    node = wrapper.find(UpdateAvailableDialog);
    instance = node.instance();
    mockHideDialog = jest.fn(_ => null);
  });

  it('should render deeply', () => {
    expect(wrapper.find(UpdateAvailableDialogContainer)).not.toBe(null);
    expect(node.find(UpdateAvailableDialog)).not.toBe(null);
  });

  it('should change state when the install after a radio button is selected', () => {
    const mockEvent = { target: { value: Options[Options.AutoUpdate] } };
    instance.setState({ selectedOption: 0 });

    instance.onChange(mockEvent);

    const state = instance.state;
    expect(state.selectedOption).toBe(2);
  });

  it('should close properly', () => {
    instance.props.onCloseClick();

    expect(mockHideDialog).toHaveBeenCalledWith(null);
  });

  it('should close and return the passed in value when "Update" is clicked', () => {
    instance.props.onUpdateClick(1);

    expect(mockHideDialog).toHaveBeenCalledWith(1);
  });
});
