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

import { mount, configure } from 'enzyme';
import * as React from 'react';
import Adapter from 'enzyme-adapter-react-16';

import { Checkbox } from './checkbox';

configure({ adapter: new Adapter() });

jest.mock('./checkbox.scss', () => ({}));

describe('Checkbox', () => {
  let wrapper;
  let instance;

  beforeEach(() => {
    wrapper = mount(<Checkbox checked={true} />);
    instance = wrapper.instance();
  });

  it('should render deeply', () => {
    expect(wrapper.find(Checkbox).html()).not.toBe(null);
  });

  it('should derive state from props', () => {
    // checked differs
    const newProps1 = { checked: false, indeterminate: false };
    const prevState1 = { checked: true, indeterminate: false };
    const state1 = Checkbox.getDerivedStateFromProps(newProps1, prevState1);
    expect(state1).toEqual(newProps1);

    // indeterminate differs
    const newProps2 = { checked: false, indeterminate: false };
    const prevState2 = { checked: false, indeterminate: true };
    const state2 = Checkbox.getDerivedStateFromProps(newProps2, prevState2);
    expect(state2).toEqual(newProps2);

    // neither differs (no-op)
    const same = { checked: false, indeterminate: false };
    const state3 = Checkbox.getDerivedStateFromProps(same, same);
    expect(state3).toBe(same);
  });

  it('should assign a new checkbox ref with event listeners', () => {
    const mockRemoveListener = jest.fn(_event => null);
    const oldRef = { removeEventListener: mockRemoveListener };

    const mockAddListener = jest.fn(_event => null);
    const newRef = { addEventListener: mockAddListener };

    const mockEventHandler = () => null;
    instance.checkboxEventHandler = mockEventHandler;
    instance.inputRef = oldRef;
    instance.checkboxRef(newRef);

    // should remove listeners from old ref
    expect(mockRemoveListener).toHaveBeenCalledTimes(2);
    expect(mockRemoveListener).toHaveBeenCalledWith('focus', mockEventHandler);
    expect(mockRemoveListener).toHaveBeenCalledWith('blur', mockEventHandler);

    // should add listeners to new ref
    expect(mockAddListener).toHaveBeenCalledTimes(2);
    expect(mockAddListener).toHaveBeenCalledWith('focus', mockEventHandler);
    expect(mockAddListener).toHaveBeenCalledWith('blur', mockEventHandler);
  });

  it('should handle focus and blur', () => {
    instance.checkboxEventHandler({ type: 'focus' });
    expect(instance.state.focused).toBe(true);

    instance.checkboxEventHandler({ type: 'blur' });
    expect(instance.state.focused).toBe(false);
  });
});
