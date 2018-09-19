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

import * as React from 'react';
import { BotCreationDialog, BotCreationDialogState } from './botCreationDialog';
import { mount, shallow } from 'enzyme';

jest.mock('./botCreationDialog.scss', () => ({}));
jest.mock('../index', () => null);
jest.mock('../../../utils', () => ({
  generateBotSecret: () => {
    return Math.random() + '';
  }
}));

describe('BotCreationDialog tests', () => {
  it('should render without throwing an error', () => {
    const testWrapper = mount(<BotCreationDialog/>);
    expect(testWrapper.find(BotCreationDialog)).not.toBe(null);
  });

  it('should generate a new bot secret when checkbox is toggled', () => {
    const testWrapper = shallow(<BotCreationDialog/>);
    const initialState = testWrapper.state as Partial<BotCreationDialogState>;
    expect(initialState.secret).toBeFalsy();
    // toggle on encryption
    (testWrapper.instance() as any).onEncryptKeyChange(null, true);
    const state1 = testWrapper.state() as Partial<BotCreationDialogState>;
    expect(state1.secret).not.toBeFalsy();
    // toggle encryption off and then on again
    (testWrapper.instance() as any).onEncryptKeyChange(null, false);
    (testWrapper.instance() as any).onEncryptKeyChange(null, true);
    const state2 = testWrapper.state() as Partial<BotCreationDialogState>;
    expect(state2.secret).not.toBeFalsy();
    expect(state1.secret).not.toEqual(state2.secret);
  });

  it('should generate a new bot secret when reset is clicked', () => {
    const testWrapper = shallow(<BotCreationDialog/>);
    const initialSecret = 'secret1';
    testWrapper.instance().setState({ secret: initialSecret });
    (testWrapper.instance() as any).onResetClick();
    const state = testWrapper.state() as Partial<BotCreationDialogState>;
    expect(state.secret).not.toEqual(initialSecret);
  });

  it('should execute a window copy command when copy is clicked', () => {
    const testWrapper = mount(<BotCreationDialog/>);

    // mock window functions
    const backupExec = window.document.execCommand;
    const mockExec = jest.fn((_command: string) => null);
    const backupGetElementById = window.document.getElementById;
    const mockGetElementById = (_selector) => ({
      removeAttribute: () => null,
      select: () => null,
      setAttribute: () => null
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
    const testWrapper = shallow(<BotCreationDialog/>);
    (testWrapper.instance() as any).onChangeEndpoint('someEndpoint');
    (testWrapper.instance() as any).onChangeAppId('someId');
    (testWrapper.instance() as any).onChangeAppPw('somePw');
    (testWrapper.instance() as any).onChangeName('someName');

    const state = testWrapper.state() as Partial<BotCreationDialogState>;
    expect(state.endpoint.endpoint).toBe('someEndpoint');
    expect(state.endpoint.appId).toBe('someId');
    expect(state.endpoint.appPassword).toBe('somePw');
    expect(state.bot.name).toBe('someName');
  });

  it('should validate the endpoint', () => {
    const testWrapper = shallow(<BotCreationDialog/>);
    expect((testWrapper.instance() as any).validateEndpoint('http://localhost:3000/api/messages')).toBe('');
    expect((testWrapper.instance() as any).validateEndpoint('http://localhost:3000'))
      .toBe(`Please include route if necessary: "/api/messages"`);
  });
});
