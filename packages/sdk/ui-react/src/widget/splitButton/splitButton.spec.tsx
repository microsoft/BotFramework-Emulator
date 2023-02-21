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

import { SplitButton } from './splitButton';

jest.mock('./splitButton.scss', () => ({}));
jest.mock('./splitButtonPanel/splitButtonPanel', () => ({
  SplitButtonPanel: () => <div />,
}));

describe('<SplitButton>', () => {
  let wrapper;
  let node;
  let instance;
  let mockHidePanel;
  const mockOptions = ['option1', 'option2', 'option3'];

  beforeEach(() => {
    mockHidePanel = jest.fn(() => null);
    wrapper = mount(<SplitButton />);
    node = wrapper.find(SplitButton);
    instance = wrapper.instance();
  });

  it('should render deeply', () => {
    expect(node.html()).not.toBe(null);
  });

  it('should select first option by default', () => {
    const mockOnClick = jest.fn((value: string) => {
      expect(value).toBe('option1');
    });
    const mockDefaultClick = jest.fn((value: number) => null);
    wrapper = mount(
      <SplitButton options={mockOptions} onClick={mockOnClick} onDefaultButtonClick={mockDefaultClick} />
    );
    instance = wrapper.instance();
    expect(instance.state.selected).toBe(0);
  });

  it('should pass the primary button ref to the buttonRef prop', () => {
    const mockButtonRef = jest.fn(() => null);
    wrapper = mount(<SplitButton buttonRef={mockButtonRef} />);

    expect(mockButtonRef).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
  });

  it('should set a caret button ref', () => {
    const mockCaretRef = "I'm a caret button!";
    instance.setCaretRef(mockCaretRef);

    expect(instance.caretRef).toBe(mockCaretRef);
  });

  it('should handle clicking the caret button', () => {
    const mockStopPropagation = jest.fn(() => null);
    const mockEvent = { stopPropagation: mockStopPropagation };
    instance.setState({ expanded: false });
    instance.onClickCaret(mockEvent);

    expect(mockStopPropagation).toHaveBeenCalledTimes(1);
    expect(instance.state.expanded).toBe(true);
  });

  it('should handle clicking the default button', () => {
    const mockOnClick = jest.fn((_value: number) => null);
    const mockDefaultClick = jest.fn((_value: number) => null);
    wrapper = mount(
      <SplitButton options={mockOptions} onClick={mockOnClick} onDefaultButtonClick={mockDefaultClick} />
    );
    instance = wrapper.instance();
    instance.onClickDefault();
    expect(mockDefaultClick).toHaveBeenCalledWith('option1');
    instance.setState({ selected: 1 });
    instance.onClickDefault();
    expect(mockDefaultClick).toHaveBeenCalledWith('option2');
  });

  it('should handle clicking an option', () => {
    const mockOnClick = jest.fn((_value: number) => null);
    wrapper = mount(<SplitButton options={mockOptions} onClick={mockOnClick} />);
    instance = wrapper.instance();
    instance.hidePanel = mockHidePanel;
    instance.onClickOption(2);

    expect(mockOnClick).toHaveBeenCalledWith('option3');
    expect(mockHidePanel).toHaveBeenCalledTimes(1);
  });

  it('should hide panel', () => {
    const mockFocus = jest.fn(() => null);
    instance.caretRef = { focus: mockFocus };
    instance.setState({ expanded: true });
    instance.hidePanel();

    expect(instance.state.expanded).toBe(false);
    expect(mockFocus).toHaveBeenCalledTimes(1);
  });

  it('should move selection up', () => {
    wrapper = mount(<SplitButton options={mockOptions} />);
    instance = wrapper.instance();
    instance.setState({ selected: 2 });

    instance.moveSelectionUp();
    expect(instance.state.selected).toBe(1);

    instance.moveSelectionUp();
    expect(instance.state.selected).toBe(0);

    // should stop at first option
    instance.moveSelectionUp();
    expect(instance.state.selected).toBe(0);
  });

  it('should move selection down', () => {
    wrapper = mount(<SplitButton options={mockOptions} />);
    instance = wrapper.instance();
    instance.setState({ selected: 0 });

    instance.moveSelectionDown();
    expect(instance.state.selected).toBe(1);

    instance.moveSelectionDown();
    expect(instance.state.selected).toBe(2);

    // should stop at last option
    instance.moveSelectionDown();
    expect(instance.state.selected).toBe(2);
  });

  it('should handle keydown events', () => {
    instance.hidePanel = mockHidePanel;
    const mockPreventDefault = jest.fn(() => null);

    let mockEvent: any = { key: 'ArrowDown' };
    const mockMoveSelectionDown = jest.fn(() => null);
    instance.moveSelectionDown = mockMoveSelectionDown;
    instance.onKeyDown(mockEvent);
    expect(mockMoveSelectionDown).toHaveBeenCalledTimes(1);

    mockEvent = { key: 'ArrowUp' };
    const mockMoveSelectionUp = jest.fn(() => null);
    instance.moveSelectionUp = mockMoveSelectionUp;
    instance.onKeyDown(mockEvent);
    expect(mockMoveSelectionUp).toHaveBeenCalledTimes(1);

    mockEvent = { key: 'Escape' };
    instance.onKeyDown(mockEvent);
    expect(mockHidePanel).toHaveBeenCalledTimes(1);

    mockEvent = { key: 'Enter', preventDefault: mockPreventDefault };
    const mockOnClickOption = jest.fn((_index: number) => null);
    instance.onClickOption = mockOnClickOption;
    instance.setState({ selected: 5 });
    instance.onKeyDown(mockEvent);
    expect(mockPreventDefault).toHaveBeenCalledTimes(1);
    expect(mockOnClickOption).toHaveBeenCalledWith(5);

    mockEvent = {
      key: 'Tab',
      preventDefault: mockPreventDefault,
      shiftKey: false,
    };
    instance.onKeyDown(mockEvent);
    expect(mockHidePanel).toHaveBeenCalledTimes(2);
    expect(mockPreventDefault).toHaveBeenCalledTimes(1);

    // shift tab
    mockEvent.shiftKey = true;
    instance.onKeyDown(mockEvent);
    expect(mockHidePanel).toHaveBeenCalledTimes(3);
    expect(mockPreventDefault).toHaveBeenCalledTimes(2);
  });
});
