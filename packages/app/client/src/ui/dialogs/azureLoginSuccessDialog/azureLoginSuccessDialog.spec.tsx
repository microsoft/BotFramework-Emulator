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
import { mount } from 'enzyme';
import { combineReducers, createStore } from 'redux';
import { azureAuth } from '@bfemulator/app-shared';

import { AzureLoginSuccessDialogContainer } from './azureLoginSuccessDialogContainer';
import { AzureLoginSuccessDialog } from './azureLoginSuccessDialog';

jest.mock('../service', () => ({
  DialogService: {
    showDialog: () => Promise.resolve(true),
    hideDialog: () => Promise.resolve(false),
  },
}));

jest.mock('../dialogStyles.scss', () => ({}));

describe('The AzureLoginSuccessDialogContainer component should', () => {
  let parent;
  let node;
  beforeEach(() => {
    parent = mount(
      <Provider store={createStore(combineReducers({ azureAuth }))}>
        <AzureLoginSuccessDialogContainer />
      </Provider>
    );
    node = parent.find(AzureLoginSuccessDialog);
  });

  it('should render deeply', () => {
    expect(parent.find(AzureLoginSuccessDialogContainer)).not.toBe(null);
    expect(parent.find(AzureLoginSuccessDialog)).not.toBe(null);
  });

  it('should contain a cancel function in the props', () => {
    expect(typeof (node.props() as any).cancel).toBe('function');
  });

  it('should update the state when the checkbox is clicked', () => {
    const instance = node.instance();
    expect('rememberMeChecked' in instance.state);
    const currentCheckedValue = instance.state.rememberMeChecked;
    instance.checkBoxChanged({ target: { checked: true } } as any);
    expect(instance.state.rememberMeChecked).toBe(!currentCheckedValue);
  });

  it('should call the cancel function with the checked state when the onDialogCancel function is called', () => {
    const instance = node.instance();
    const currentCheckedValue = instance.state.rememberMeChecked;
    const { cancel } = instance.props;
    Object.defineProperty(instance, 'props', {
      value: {
        cancel,
      },
      writable: true,
      configurable: true,
    });
    const spy = jest.spyOn(instance.props, 'cancel');
    instance.onDialogCancel();
    expect(spy).toHaveBeenCalledWith(currentCheckedValue);
  });
});
