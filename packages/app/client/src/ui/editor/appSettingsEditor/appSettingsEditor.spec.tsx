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

import { mount } from 'enzyme';
import * as React from 'react';
import { combineReducers, createStore } from 'redux';

import * as EditorActions from '../../../data/action/editorActions';
import { frameworkSettingsChanged, getFrameworkSettings } from '../../../data/action/frameworkSettingsActions';
import { getTabGroupForDocument } from '../../../data/editorHelpers';
import { framework } from '../../../data/reducer/frameworkSettingsReducer';
import { saveFrameworkSettings } from '../../../data/action/frameworkSettingsActions';

import { AppSettingsEditor } from './appSettingsEditor';
import { AppSettingsEditorContainer } from './appSettingsEditorConainer';

jest.mock('./appSettingsEditor.scss', () => ({}));
jest.mock('../../layout/genericDocument.scss', () => ({}));
jest.mock(
  '../../dialogs/',
  () =>
    new Proxy(
      {},
      {
        get(): any {
          return {};
        },
      }
    )
);
const mockCallsMade = [];
const mockRemoteCallsMade = [];
jest.mock('../../../platform/commands/commandServiceImpl', () => ({
  CommandServiceImpl: {
    call: (commandName, ...args) => {
      mockCallsMade.push({ commandName, args });
      return Promise.resolve();
    },
    remoteCall: (commandName, ...args) => {
      mockRemoteCallsMade.push({ commandName, args });
      return Promise.resolve('hai!');
    },
  },
}));
describe('The AppSettingsEditorContainer', () => {
  let instance: AppSettingsEditor;
  let node;
  let mockDispatch;
  let mockStore;
  beforeEach(() => {
    mockStore = createStore(combineReducers({ framework }));
    mockStore.dispatch(
      frameworkSettingsChanged({
        autoUpdate: true,
        bypassNgrokLocalhost: true,
        runNgrokAtStartup: false,
        collectUsageData: true,
        locale: '',
        localhost: '',
        ngrokPath: '',
        stateSizeLimit: 64,
        use10Tokens: false,
        useCodeValidation: false,
        usePrereleases: false,
      })
    );
    mockDispatch = jest.spyOn(mockStore, 'dispatch');
    const wrapper = mount(<AppSettingsEditorContainer store={mockStore} />);
    node = wrapper.find(AppSettingsEditor);
    instance = node.instance() as AppSettingsEditor;
  });

  it('should dispatch an action to retrieve the framework settings', () => {
    expect(mockDispatch).toHaveBeenCalledWith(getFrameworkSettings());
  });

  it('should update the state when the value of a checkbox changes', () => {
    (instance as any).onChangeCheckBox({
      target: {
        checked: true,
        name: 'runNgrokAtStartup',
      },
    } as any);

    expect(instance.state.runNgrokAtStartup).toBeTruthy();
  });

  it('should update the state when an input field is changed', () => {
    (instance as any).onInputChange({
      target: {
        value: 'a new value',
        name: 'ngrokPath',
      },
    } as any);

    expect(instance.state.ngrokPath).toBe('a new value');
  });

  it('should call a remote command to open a browse window when "onClickBrowse" is called', async () => {
    await (instance as any).onClickBrowse();
    expect(mockRemoteCallsMade[0]).toEqual({
      args: [
        {
          buttonLabel: 'Select ngrok',
          properties: ['openFile'],
          title: 'Browse for ngrok',
        },
      ],
      commandName: 'shell:showExplorer-open-dialog',
    });
  });

  it('should discard the changes when "discardChanges" is called', () => {
    instance.props.discardChanges();
    expect(mockDispatch).toHaveBeenCalledWith(
      EditorActions.close(getTabGroupForDocument('app:settings'), 'app:settings')
    );
  });

  it('should save the framework settings when the "onSaveClick" handler is called', () => {
    (instance as any).onSaveClick();
    expect(mockDispatch).toHaveBeenCalledWith(saveFrameworkSettings(instance.state));
  });
});
