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
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTIONb
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

import { mount, ReactWrapper } from 'enzyme';
import * as React from 'react';
import { executeCommand, SharedConstants } from '@bfemulator/app-shared';
import { CommandServiceImpl, CommandServiceInstance } from '@bfemulator/sdk-shared';

import { ActiveBotHelper } from '../../helpers/activeBotHelper';
import { ariaAlertService } from '../../a11y';

import { BotCreationDialog, BotCreationDialogState } from './botCreationDialog';
import { BotCreationDialogContainer } from './botCreationDialogContainer';

const mockState = {};
const mockStore = {
  dispatch: jest.fn(),
  getState: () => mockState,
};

jest.mock('../../../state/store', () => ({
  get store() {
    return mockStore;
  },
}));

const mockCopyToClipboard = jest.fn(args => true);
jest.mock('../index', () => null);
jest.mock('../../../utils', () => ({
  debounce: (func: () => any) => func,
  generateBotSecret: () => {
    return Math.random() + '';
  },
  copyTextToClipboard: args => mockCopyToClipboard(args),
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

jest.mock('../../helpers/activeBotHelper', () => ({
  ActiveBotHelper: {
    confirmAndCreateBot: async () => true,
  },
}));

describe('BotCreationDialog tests', () => {
  let commandService: CommandServiceImpl;
  let mockDispatch;

  beforeAll(() => {
    const decorator = CommandServiceInstance();
    const descriptor = decorator({ descriptor: {} }, 'none') as any;
    commandService = descriptor.descriptor.get();
  });

  let testWrapper: ReactWrapper<any, any, any>;
  beforeEach(() => {
    mockDispatch = jest.spyOn(mockStore, 'dispatch');
    mockStore.dispatch(jest.fn());
    const parent = mount(<BotCreationDialogContainer store={mockStore} />);
    testWrapper = parent.find(BotCreationDialog);
  });

  it('should render without throwing an error', () => {
    expect(testWrapper.find(BotCreationDialog)).not.toBe(null);
  });

  it('should generate a new bot secret when checkbox is toggled', () => {
    const initialState = testWrapper.state as Partial<BotCreationDialogState>;
    expect(initialState.secret).toBeFalsy();
    // toggle on encryption
    (testWrapper.instance() as any).onEncryptKeyChange({
      target: { checked: true },
    } as any);
    const state1 = testWrapper.state() as Partial<BotCreationDialogState>;
    expect(state1.secret).not.toBeFalsy();
    // toggle encryption off and then on again
    (testWrapper.instance() as any).onEncryptKeyChange({
      target: { checked: false },
    } as any);
    (testWrapper.instance() as any).onEncryptKeyChange({
      target: { checked: true },
    } as any);
    const state2 = testWrapper.state() as Partial<BotCreationDialogState>;
    expect(state2.secret).not.toBeFalsy();
    expect(state1.secret).not.toEqual(state2.secret);
  });

  // TODO: Re-enable ability to re-generate secret after 4.1
  // See 'https://github.com/Microsoft/BotFramework-Emulator/issues/964' for more information
  // See also: botCreationDialog.spec.tsx

  // it('should generate a new bot secret when reset is clicked', () => {
  //   const testWrapper = shallow(<BotCreationDialog/>);
  //   const initialSecret = 'MOCK_TEST_SECRET';
  //   testWrapper.instance().setState({ secret: initialSecret, encryptKey: true });
  //   (testWrapper.instance() as any).onResetClick();
  //   const state = testWrapper.state() as Partial<BotCreationDialogState>;
  //   expect(state.secret).not.toEqual(initialSecret);
  // });

  it('should execute a window copy command when copy is clicked', () => {
    const instance = testWrapper.instance();
    instance.setState({ encryptKey: true });
    instance.props.showMessage('title', 'message');
    expect(mockDispatch).toHaveBeenCalledWith(
      executeCommand(true, SharedConstants.Commands.Electron.ShowMessageBox, null, true, {
        message: 'message',
        title: 'title',
      })
    );

    instance.setState({
      encryptKey: false,
    });

    expect(typeof instance.onCopyClick).toBe('function');
    expect(instance.onCopyClick()).toBeNull();
  });

  it('should set state via input change handlers', () => {
    const mockEvent = {
      target: { value: 'someEndpoint', dataset: { prop: 'endpoint' } },
    };
    (testWrapper.instance() as any).onInputChange(mockEvent as any);

    mockEvent.target.dataset.prop = 'appId';
    mockEvent.target.value = 'someId';
    (testWrapper.instance() as any).onInputChange(mockEvent as any);

    mockEvent.target.dataset.prop = 'appPassword';
    mockEvent.target.value = 'MOCK_TEST_SECRET';
    (testWrapper.instance() as any).onInputChange(mockEvent as any);

    mockEvent.target.dataset.prop = 'name';
    mockEvent.target.value = 'someName';
    (testWrapper.instance() as any).onInputChange(mockEvent as any);

    const state = testWrapper.state() as Partial<BotCreationDialogState>;
    expect(state.endpoint.endpoint).toBe('someEndpoint');
    expect(state.endpoint.appId).toBe('someId');
    expect(state.endpoint.appPassword).toBe('MOCK_TEST_SECRET');
    expect(state.bot.name).toBe('someName');
  });

  it('should validate channelService on toggle channelService checkbox', () => {
    let state = testWrapper.state() as Partial<BotCreationDialogState>;

    // initially undefined
    expect((state.endpoint as any).channelService).toBe(undefined);

    // checked
    const mockCheck = { target: { checked: true } };
    (testWrapper.instance() as any).onChannelServiceChange(mockCheck as any);

    state = testWrapper.state() as Partial<BotCreationDialogState>;
    expect((state.endpoint as any).channelService).toBe('https://botframework.azure.us');

    // unchecked
    mockCheck.target.checked = false;
    (testWrapper.instance() as any).onChannelServiceChange(mockCheck as any);

    state = testWrapper.state() as Partial<BotCreationDialogState>;
    expect((state.endpoint as any).channelService).toBe('');
  });

  it('should validate the endpoint', () => {
    expect((testWrapper.instance() as any).validateEndpoint('')).toBe('');
    expect((testWrapper.instance() as any).validateEndpoint('http://localhost:3000/api/messages')).toBe('');
    expect((testWrapper.instance() as any).validateEndpoint('http://localhost:3000')).toBe(
      `Please include route if necessary: "/api/messages"`
    );
  });

  it('should save and connect', async () => {
    const instance = testWrapper.instance();
    const remoteCallSpy = jest.spyOn(commandService, 'remoteCall').mockResolvedValue('some/path');
    const confirmAndCreateSpy = jest.spyOn(ActiveBotHelper, 'confirmAndCreateBot').mockResolvedValue(true);
    await instance.onSaveAndConnect();
    expect(remoteCallSpy).toHaveBeenCalledWith('shell:showExplorer-save-dialog', {
      buttonLabel: 'Save',
      defaultPath: 'some/path',
      filters: [{ extensions: ['bot'], name: 'Bot Files' }],
      showsTagField: false,
      title: 'Save as',
    });
    expect(confirmAndCreateSpy).toHaveBeenCalledWith(
      {
        description: '',
        name: '',
        overrides: null,
        padlock: '',
        path: 'some/path',
        services: [
          {
            appId: '',
            appPassword: '',
            channelService: undefined,
            endpoint: '',
            id: expect.any(String),
            name: '',
            type: 'endpoint',
          },
        ],
        version: '2.0',
      },
      null
    );
  });

  it('should toggle the visibility of the secret', () => {
    const spy = jest.spyOn(ariaAlertService, 'alert');
    testWrapper.setState({ encryptKey: true, revealSecret: false });
    testWrapper.instance().onRevealSecretClick();

    expect(spy).toHaveBeenCalledWith('Secret showing.');
    expect(testWrapper.instance().state.revealSecret).toBe(true);

    testWrapper.instance().onRevealSecretClick();

    expect(spy).toHaveBeenCalledWith('Secret hidden.');
  });

  it('should not toggle the visibility of the secret if the encryption is disabled', () => {
    testWrapper.setState({ encryptKey: false, revealSecret: false });
    testWrapper.instance().onRevealSecretClick();

    expect(testWrapper.instance().state.revealSecret).toBe(false);
  });

  it('should announce any validation warning messages', () => {
    // make sure there are no leftover alerts from previous test(s)
    const preExistingAlerts = document.querySelectorAll('body > span#alert-from-service');
    preExistingAlerts.forEach(alert => alert.remove());
    const spy = jest.spyOn(ariaAlertService, 'alert').mockReturnValueOnce(undefined);
    testWrapper.instance().announceEndpointWarning('Invalid bot url.');

    expect(spy).toHaveBeenCalledWith('For Endpoint URL, Invalid bot url.');
  });
});
