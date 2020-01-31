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
import { bot, executeCommand, setActive, SharedConstants } from '@bfemulator/app-shared';
import * as React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { combineReducers, createStore } from 'redux';
import { BotConfigWithPathImpl } from '@bfemulator/sdk-shared';

import { DialogService } from '../service';

import { SecretPromptDialogContainer } from './secretPromptDialogContainer';
import { SecretPromptDialog } from './secretPromptDialog';

const mockStore = createStore(combineReducers({ bot }));
const mockBot = BotConfigWithPathImpl.fromJSON({});

jest.mock('../../../state/store', () => ({
  get store() {
    return mockStore;
  },
}));

jest.mock('../service', () => ({
  DialogService: {
    showDialog: () => Promise.resolve(true),
    hideDialog: () => Promise.resolve(false),
  },
}));

jest.mock('../../../utils', () => ({
  generateBotSecret: () => {
    return Math.random() + '';
  },
}));

describe('The Secret prompt dialog', () => {
  let parent;
  let node;
  let mockDispatch;
  let instance;

  beforeEach(() => {
    mockStore.dispatch(setActive(mockBot));
    mockDispatch = jest.spyOn(mockStore, 'dispatch');
    parent = mount(
      <Provider store={mockStore}>
        <SecretPromptDialogContainer />
      </Provider>
    );
    node = parent.find(SecretPromptDialog);
    instance = node.instance();
  });

  it('should render deeply', () => {
    expect(parent.find(SecretPromptDialogContainer)).not.toBe(null);
    expect(parent.find(SecretPromptDialog)).not.toBe(null);
  });

  it('should contain the expected functions in the props', () => {
    expect(typeof (node.props() as any).onCancelClick).toBe('function');
    expect(typeof (node.props() as any).onSaveClick).toBe('function');
  });

  it('should update the state when the reveal key is clicked', () => {
    const instance = node.instance();
    expect(instance.state.revealSecret).toBeFalsy();
    instance.onRevealSecretClick();
    expect(instance.state.revealSecret).toBeTruthy();
  });

  it('should update the state when a secret is input by the user', () => {
    const instance = node.instance();
    const mockEvent = {
      target: { value: 'shhh!', dataset: { prop: 'secret' } },
    };
    instance.onChangeSecret(mockEvent as any);
    expect(instance.state.secret).toBe('shhh!');
  });

  it('should call DialogService.hideDialog with the new secrete when the save button is clicked', () => {
    const spy = jest.spyOn(DialogService, 'hideDialog');
    const instance = node.instance();
    const mockEvent = {
      target: { value: 'shhh!', dataset: { prop: 'secret' } },
    };
    instance.onChangeSecret(mockEvent as any);
    instance.onSaveClick(null);

    expect(spy).toHaveBeenCalledWith('shhh!');
  });

  it('should call DialogService.hideDialog with nothing when the cancel button is clicked', () => {
    const spy = jest.spyOn(DialogService, 'hideDialog');
    const instance = node.instance();
    const mockEvent = {
      target: { value: 'shhh!', dataset: { prop: 'secret' } },
    };
    instance.onChangeSecret(mockEvent as any);
    instance.onDismissClick();

    expect(spy).toHaveBeenCalledWith(null);
  });

  it('should call the appropriate command when onAnchorClick is called', () => {
    instance.props.onAnchorClick('http://blah');
    expect(mockDispatch).toHaveBeenCalledWith(
      executeCommand(true, SharedConstants.Commands.Electron.OpenExternal, null, 'http://blah')
    );
  });
});
