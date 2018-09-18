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
import { BotCreationDialog, BotCreationDialogState } from './botCreationDialog';
import { mount, shallow } from 'enzyme';

jest.mock('./botCreationDialog.scss', () => ({}));
jest.mock('../index', () => null);
jest.mock('../../../utils', () => ({
  generateBotSecret: jest.fn()
                          .mockImplementationOnce(() => 'secret1')
                          .mockImplementationOnce(() => 'secret2')
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
});
