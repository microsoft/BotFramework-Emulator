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
import { mount } from 'enzyme';

import { navBar } from '../../../data/reducer/navBar';

import { PostMigrationDialogContainer } from './postMigrationDialogContainer';
import { PostMigrationDialog } from './postMigrationDialog';
jest.mock('../../dialogs', () => ({}));
jest.mock('./postMigrationDialog.scss', () => ({}));

describe('The PostMigrationDialogContainer component', () => {
  let wrapper;
  let node;

  beforeEach(() => {
    wrapper = mount(
      <Provider store={createStore(navBar)}>
        <PostMigrationDialogContainer />
      </Provider>
    );
    node = wrapper.find(PostMigrationDialog);
  });

  it('should render deeply', () => {
    expect(wrapper.find(PostMigrationDialogContainer)).not.toBe(null);
    expect(node.find(PostMigrationDialog)).not.toBe(null);
  });

  it('should contain a close function in the props', () => {
    expect(typeof (node.props() as any).close).toBe('function');
  });
});
