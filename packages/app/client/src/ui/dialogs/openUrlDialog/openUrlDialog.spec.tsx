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
import { createStore } from 'redux';
import { azureAuth } from '@bfemulator/app-shared';

import { OpenUrlDialog } from './openUrlDialog';
import { OpenUrlDialogContainer } from './openUrlDialogContainer';

jest.mock('../service', () => ({
  DialogService: {
    showDialog: () => Promise.resolve(1),
    hideDialog: () => Promise.resolve(0),
  },
}));

jest.mock('./openUrlDialog.scss', () => ({}));

jest.mock('../../dialogs/', () => ({
  OpenUrlDialogContainer: () => undefined,
  OpenUrlDialog: () => undefined,
  DialogService: { showDialog: () => Promise.resolve(true) },
  SecretPromptDialog: () => undefined,
}));

describe('The OpenUrlDialog component should', () => {
  it('should render dialog', () => {
    const parent = mount(
      <Provider store={createStore(azureAuth)}>
        <OpenUrlDialogContainer />
      </Provider>
    );
    expect(parent.find(OpenUrlDialogContainer)).not.toBe(null);
  });

  it('should contain both a cancel and confirm function in the props', () => {
    const parent = mount(
      <Provider store={createStore(azureAuth)}>
        <OpenUrlDialogContainer />
      </Provider>
    );

    const prompt = parent.find(OpenUrlDialog);
    expect(typeof (prompt.props() as any).cancel).toBe('function');
    expect(typeof (prompt.props() as any).confirm).toBe('function');
  });

  it('should contain the url in the props', () => {
    const parent = mount(
      <Provider store={createStore(azureAuth)}>
        <OpenUrlDialogContainer url={'http://contoso'} />
      </Provider>
    );

    const prompt = parent.find(OpenUrlDialog);
    expect(prompt.props().url).toEqual('http://contoso');
  });
});
