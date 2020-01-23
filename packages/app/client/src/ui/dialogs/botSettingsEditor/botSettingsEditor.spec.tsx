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
import * as crypto from 'crypto';

import * as React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { combineReducers, createStore } from 'redux';
import { BotConfigWithPathImpl } from '@bfemulator/sdk-shared';
import { bot, executeCommand, setActive, SharedConstants } from '@bfemulator/app-shared';
import { CommandServiceImpl, CommandServiceInstance } from '@bfemulator/sdk-shared';

import { BotSettingsEditor } from './botSettingsEditor';
import { BotSettingsEditorContainer } from './botSettingsEditorContainer';

const mockStore = createStore(combineReducers({ bot }));
const mockBot = BotConfigWithPathImpl.fromJSON({});
const mockElement = {
  setAttribute: () => {
    // mock
  },
  removeAttribute: () => {
    // mock
  },
  select: () => {
    // mock
  },
};
const mockWindow = {
  crypto: {
    getRandomValues: (array: Uint8Array) => {
      array.set(crypto.randomBytes(32));
    },
  },
  btoa: (bytes: any) => Buffer.from(bytes).toString('base64'),
  document: {
    getElementById: () => mockElement,
    execCommand: () => {
      // mock
    },
  },
};

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

jest.mock('electron', () => ({
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

const mockRemoteCommandsCalled = [];

jest.mock('../../../utils', () => ({
  generateBotSecret: () => {
    return Math.random() + '';
  },
}));

describe('The BotSettingsEditor dialog should', () => {
  let commandService: CommandServiceImpl;
  let mockDispatch;

  beforeAll(() => {
    const decorator = CommandServiceInstance();
    const descriptor = decorator({ descriptor: {} }, 'none') as any;
    commandService = descriptor.descriptor.get();
    commandService.remoteCall = async (commandName: string, ...args: any[]) => {
      mockRemoteCommandsCalled.push({ commandName, args: args });
      switch (commandName) {
        case SharedConstants.Commands.File.SanitizeString:
          return args[0];

        case SharedConstants.Commands.Electron.ShowSaveDialog:
          return '/test/path';

        default:
          return true;
      }
    };
  });
  let parent;
  let node;
  let instance: any;
  beforeEach(() => {
    mockDispatch = jest.spyOn(mockStore, 'dispatch');
    mockStore.dispatch(setActive(mockBot));
    mockRemoteCommandsCalled.length = 0;
    parent = mount(
      <Provider store={mockStore}>
        <BotSettingsEditorContainer window={mockWindow} />
      </Provider>
    );
    node = parent.find(BotSettingsEditor);
    instance = node.instance() as BotSettingsEditor;
  });

  it('should render deeply', () => {
    expect(parent.find(BotSettingsEditorContainer)).not.toBe(null);
    expect(parent.find(BotSettingsEditor)).not.toBe(null);
  });

  it('should contain a cancel function in the props', () => {
    expect(typeof (node.props() as any).cancel).toBe('function');
  });

  it('should update the state when the reveal key is clicked', () => {
    const instance = node.instance();
    instance.setState({ encryptKey: true });
    expect(instance.state.revealSecret).toBeFalsy();
    instance.onRevealSecretClick();
    expect(instance.state.revealSecret).toBeTruthy();
  });

  it('should copy the secret to the clipboard when "onCopyClick" is executed', () => {
    const instance = node.instance();
    instance.setState({
      encryptKey: true,
      secret: 'MsKgJGZJw7Vqw51YwpZhw7LCk2MzwpZZwoLDkMKPIWfCq8K7wobDp8OvwqvCmsO+EAY=',
    });
    const elementSpies = {
      select: jest.spyOn(mockElement, 'select'),
      setAttribute: jest.spyOn(mockElement, 'setAttribute'),
      removeAttribute: jest.spyOn(mockElement, 'removeAttribute'),
    };
    const documentSpies = {
      execCommand: jest.spyOn(mockWindow.document, 'execCommand'),
      getElementById: jest.spyOn(mockWindow.document, 'getElementById'),
    };
    instance.onCopyClick();

    expect(elementSpies.select).toHaveBeenCalled();
    expect(elementSpies.removeAttribute).toHaveBeenCalledWith('disabled');
    expect(elementSpies.setAttribute).toHaveBeenCalledWith('disabled', '');
    expect(documentSpies.execCommand).toHaveBeenCalledWith('copy');
    expect(documentSpies.getElementById).toHaveBeenCalledWith('key-input');
  });

  // TODO: Re-enable ability to re-generate secret after 4.1
  // See 'https://github.com/Microsoft/BotFramework-Emulator/issues/964' for more information

  // it('should generate a new secret when the "onResetClick" function is executed', () => {
  //   const instance = node.instance();
  //   const secret = instance.generatedSecret;
  //   instance.onResetClick();
  //   expect(instance.generatedSecret).not.toEqual(secret);
  // });

  describe('onSaveClick', () => {
    it('should make the expected calls when saving a bot from protocol', async () => {
      const instance = node.instance();
      instance.setState({
        path: SharedConstants.TEMP_BOT_IN_MEMORY_PATH,
        secret: 'MsKgJGZJw7Vqw51YwpZhw7LCk2MzwpZZwoLDkMKPIWfCq8K7wobDp8OvwqvCmsO+EAY=',
      });
      await instance.onSaveClick();
      expect(mockRemoteCommandsCalled.length).toBe(7);
      [
        {
          commandName: 'file:sanitize-string',
          args: [''],
        },
        {
          commandName: 'shell:showExplorer-save-dialog',
          args: [
            {
              filters: [
                {
                  name: 'Bot Files',
                  extensions: ['bot'],
                },
              ],
              defaultPath: '',
              showsTagField: false,
              title: 'Save as',
              buttonLabel: 'Save',
            },
          ],
        },
        {
          args: [
            'TEMP_BOT_IN_MEMORY',
            {
              displayName: '',
              path: '/test/path',
              secret: 'MsKgJGZJw7Vqw51YwpZhw7LCk2MzwpZZwoLDkMKPIWfCq8K7wobDp8OvwqvCmsO+EAY=',
            },
          ],
          commandName: 'bot:list:patch',
        },
        {
          commandName: 'bot:save',
          args: [
            {
              description: '',
              name: '',
              overrides: null,
              path: '/test/path',
              padlock: '',
              services: [],
              version: '2.0',
            },
          ],
        },
        {
          args: [
            {
              description: '',
              name: '',
              overrides: null,
              path: '/test/path',
              padlock: '',
              services: [],
              version: '2.0',
            },
          ],
          commandName: 'bot:set-active',
        },
        {
          commandName: 'menu:update-file-menu',
          args: [],
        },
        {
          commandName: 'electron:set-title-bar',
          args: ['/test/path'],
        },
      ].forEach((command, index) => expect(mockRemoteCommandsCalled[index]).toEqual(command));
    });

    it('should make the expected calls when saving a bot', async () => {
      const instance = node.instance();
      instance.setState({
        path: 'a/test/path',
        secret: 'MsKgJGZJw7Vqw51YwpZhw7LCk2MzwpZZwoLDkMKPIWfCq8K7wobDp8OvwqvCmsO+EAY=',
      });
      await instance.onSaveClick();
      expect(mockRemoteCommandsCalled.length).toBe(3);
      [
        {
          commandName: 'bot:list:patch',
          args: [
            'a/test/path',
            {
              secret: 'MsKgJGZJw7Vqw51YwpZhw7LCk2MzwpZZwoLDkMKPIWfCq8K7wobDp8OvwqvCmsO+EAY=',
            },
          ],
        },
      ].forEach((command, index) => {
        expect(mockRemoteCommandsCalled[index]).toEqual(command);
      });
    });
  });

  it('should call the appropriate command when onAnchorClick is called', () => {
    instance.props.onAnchorClick('http://blah');
    expect(mockDispatch).toHaveBeenCalledWith(
      executeCommand(true, SharedConstants.Commands.Electron.OpenExternal, null, 'http://blah')
    );
  });
});
