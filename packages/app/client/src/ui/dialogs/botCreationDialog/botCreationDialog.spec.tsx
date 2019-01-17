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

import { mount } from 'enzyme';
import * as React from 'react';

import { CommandServiceImpl } from '../../../platform/commands/commandServiceImpl';
import { ActiveBotHelper } from '../../helpers/activeBotHelper';

import { BotCreationDialog, BotCreationDialogState } from './botCreationDialog';

jest.mock('./botCreationDialog.scss', () => ({}));
jest.mock('../index', () => null);
jest.mock('../../../utils', () => ({
  generateBotSecret: () => {
    return Math.random() + '';
  },
}));

jest.mock('../../helpers/activeBotHelper', () => ({
  ActiveBotHelper: {
    confirmAndCreateBot: async () => true,
  },
}));

describe('BotCreationDialog tests', () => {
  let testWrapper;
  beforeEach(() => {
    testWrapper = mount(<BotCreationDialog />);
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
  //   const initialSecret = 'secret1';
  //   testWrapper.instance().setState({ secret: initialSecret, encryptKey: true });
  //   (testWrapper.instance() as any).onResetClick();
  //   const state = testWrapper.state() as Partial<BotCreationDialogState>;
  //   expect(state.secret).not.toEqual(initialSecret);
  // });

  it('should execute a window copy command when copy is clicked', () => {
    testWrapper.instance().setState({ encryptKey: true });
    // mock window functions
    const backupExec = window.document.execCommand;
    const mockExec = jest.fn((_command: string) => null);
    const backupGetElementById = window.document.getElementById;
    const mockGetElementById = _selector => ({
      removeAttribute: () => null,
      select: () => null,
      setAttribute: () => null,
    });
    (window.document.getElementById as any) = mockGetElementById;
    window.document.execCommand = mockExec;

    (testWrapper.instance() as any).onCopyClick();
    expect(mockExec).toHaveBeenCalledWith('copy');

    // restore window functions
    window.document.execCommand = backupExec;
    window.document.getElementById = backupGetElementById;
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
    mockEvent.target.value = 'somePw';
    (testWrapper.instance() as any).onInputChange(mockEvent as any);

    mockEvent.target.dataset.prop = 'name';
    mockEvent.target.value = 'someName';
    (testWrapper.instance() as any).onInputChange(mockEvent as any);

    const state = testWrapper.state() as Partial<BotCreationDialogState>;
    expect(state.endpoint.endpoint).toBe('someEndpoint');
    expect(state.endpoint.appId).toBe('someId');
    expect(state.endpoint.appPassword).toBe('somePw');
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
    expect((state.endpoint as any).channelService).toBe(
      'https://botframework.azure.us'
    );

    // unchecked
    mockCheck.target.checked = false;
    (testWrapper.instance() as any).onChannelServiceChange(mockCheck as any);

    state = testWrapper.state() as Partial<BotCreationDialogState>;
    expect((state.endpoint as any).channelService).toBe('');
  });

  it('should validate the endpoint', () => {
    expect(
      (testWrapper.instance() as any).validateEndpoint(
        'http://localhost:3000/api/messages'
      )
    ).toBe('');
    expect(
      (testWrapper.instance() as any).validateEndpoint('http://localhost:3000')
    ).toBe(`Please include route if necessary: "/api/messages"`);
  });

  it('should save and connect', async () => {
    const instance = testWrapper.instance();
    const remoteCallSpy = jest
      .spyOn(CommandServiceImpl, 'remoteCall')
      .mockResolvedValue('some/path');
    const confirmAndCreateSpy = jest
      .spyOn(ActiveBotHelper, 'confirmAndCreateBot')
      .mockResolvedValue(true);
    await instance.onSaveAndConnect();
    expect(remoteCallSpy).toHaveBeenCalledWith(
      'shell:showExplorer-save-dialog',
      {
        buttonLabel: 'Save',
        defaultPath: 'some/path',
        filters: [{ extensions: ['bot'], name: 'Bot Files' }],
        showsTagField: false,
        title: 'Save as',
      }
    );
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
            id: jasmine.any(String),
            name: '',
            type: 'endpoint',
          },
        ],
        version: '2.0',
      },
      null
    );
  });
});
