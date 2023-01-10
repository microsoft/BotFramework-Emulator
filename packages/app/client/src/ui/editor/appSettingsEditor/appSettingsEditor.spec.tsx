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

import {
  close as closeEditorDocument,
  executeCommand,
  framework,
  ngrokTunnel,
  saveFrameworkSettings,
  setFrameworkSettings,
  SharedConstants,
} from '@bfemulator/app-shared';
import { mount } from 'enzyme';
import * as React from 'react';
import { combineReducers, createStore } from 'redux';
import { CommandServiceImpl, CommandServiceInstance } from '@bfemulator/sdk-shared';
import { frameworkDefault } from '@bfemulator/app-shared';

import { getTabGroupForDocument } from '../../../state/helpers/editorHelpers';
import { ariaAlertService } from '../../a11y';

import { AppSettingsEditor } from './appSettingsEditor';
import { AppSettingsEditorContainer } from './appSettingsEditorContainer';

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

describe('The AppSettingsEditorContainer', () => {
  let instance: AppSettingsEditor;
  let node;
  let mockDispatch;
  let mockStore;
  let commandService: CommandServiceImpl;
  const mockCallsMade = [];
  const mockRemoteCallsMade = [];

  beforeAll(() => {
    const decorator = CommandServiceInstance();
    const descriptor = decorator({ descriptor: {} }, 'none') as any;
    commandService = descriptor.descriptor.get();
    commandService.call = (commandName, ...args) => {
      mockCallsMade.push({ commandName, args });
      return Promise.resolve(true) as any;
    };
    commandService.remoteCall = (commandName, ...args) => {
      mockRemoteCallsMade.push({ commandName, args });
      return Promise.resolve('hai!') as any;
    };
  });

  beforeEach(() => {
    mockStore = createStore(combineReducers({ framework, ngrokTunnel }));
    mockStore.dispatch(
      setFrameworkSettings({
        autoUpdate: true,
        bypassNgrokLocalhost: true,
        runNgrokAtStartup: false,
        collectUsageData: true,
        hash: 'someHash',
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
    const dispatchSpy = jest.spyOn(mockStore, 'dispatch').mockImplementation(action => {
      if (action.payload.resolver) {
        action.payload.resolver('some/path');
      }
    });
    await (instance as any).onClickBrowse();

    expect(dispatchSpy).toHaveBeenLastCalledWith({
      payload: { dirty: true, documentId: undefined },
      type: 'EDITOR/SET_DIRTY_FLAG',
    });

    expect(instance.state.ngrokPath).toBe('some/path');
  });

  it('should discard the changes when "discardChanges" is called', () => {
    instance.props.discardChanges();
    expect(mockDispatch).toHaveBeenCalledWith(
      closeEditorDocument(getTabGroupForDocument('app:settings'), 'app:settings')
    );
  });

  it('should save the framework settings then get them again from main when the "onSaveClick" handler is called', async () => {
    const alertServiceSpy = jest.spyOn(ariaAlertService, 'alert').mockReturnValueOnce(undefined);
    const mockPathToNgrokInputRef = { focus: jest.fn() };
    (instance as any).pathToNgrokInputRef = mockPathToNgrokInputRef;

    await (instance as any).onSaveClick();

    const keys = Object.keys(frameworkDefault).sort();
    const normalizedState = keys.reduce((s, key) => ((s[key] = instance.state[key]), s), {}) as FrameworkSettings;
    const saveSettingsAction = saveFrameworkSettings(normalizedState);
    const savedSettings: any = {
      ...saveSettingsAction.payload,
      hash: expect.any(String),
    };

    expect(mockDispatch).toHaveBeenLastCalledWith(saveFrameworkSettings(savedSettings));
    expect(alertServiceSpy).toHaveBeenCalledWith('App settings saved.');
    expect(mockPathToNgrokInputRef.focus).toHaveBeenCalled();
  });

  it('should call the appropriate command when onAnchorClick is called', () => {
    instance.props.onAnchorClick('http://blah');
    expect(mockDispatch).toHaveBeenCalledWith(
      executeCommand(true, SharedConstants.Commands.Electron.OpenExternal, null, 'http://blah')
    );
  });
});
