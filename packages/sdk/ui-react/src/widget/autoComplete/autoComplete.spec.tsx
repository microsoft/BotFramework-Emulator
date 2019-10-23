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
import { mount } from 'enzyme';

import { AutoComplete } from './autoComplete';

describe('<AutoComplete />', () => {
  let wrapper;
  let instance;
  const items = ['frank', 'mac', 'dennis', 'dee', 'charlie'];
  const mockOnChange = jest.fn(() => null);

  beforeEach(() => {
    mockOnChange.mockClear();
    wrapper = mount(<AutoComplete items={items} onChange={mockOnChange} />);
    instance = wrapper.instance();
  });

  it('should generate a unique id per instance', () => {
    const wrapper1 = mount(<AutoComplete />);
    const wrapper2 = mount(<AutoComplete />);

    expect(wrapper1.state().id).not.toEqual(wrapper2.state().id);
  });

  it('should render results if they are supposed to be showing', () => {
    expect(instance.results).toBe(undefined);

    instance.setState({ showResults: true });
    expect(instance.results).toBeTruthy();
  });

  it('should render a label if one has been provided', () => {
    expect(instance.label).toBe(undefined);

    wrapper.setProps({ label: 'some label' });
    expect(instance.label).toBeTruthy();
  });

  it('should render an error message if one has been provided', () => {
    expect(instance.errorMessage).toBe(undefined);

    wrapper.setProps({ errorMessage: 'something broke :(' });
    expect(instance.errorMessage).toBeTruthy();
  });

  it('should generate an error message id if there is an error message', () => {
    expect(instance.errorMessageId).toBe(undefined);

    wrapper.setProps({ errorMessage: 'something broke :(' });
    expect(instance.errorMessageId).toBe(`auto-complete-err-msg-${wrapper.state().id}`);
  });

  it('should generate a label id if a label has been provided', () => {
    expect(instance.labelId).toBe(undefined);

    wrapper.setProps({ label: 'some label' });
    expect(instance.labelId).toBe(`auto-complete-label-${wrapper.state().id}`);
  });

  it('should generate a listbox id', () => {
    expect(instance.listboxId).toBe(`auto-complete-listbox-${wrapper.state().id}`);
  });

  it('should generate a textbox id if a label has been provided', () => {
    expect(instance.textboxId).toBe(undefined);

    wrapper.setProps({ label: 'some label' });
    expect(instance.textboxId).toBe(`auto-complete-textbox-${wrapper.state().id}`);
  });

  it('should filter items based on current input', () => {
    instance.setState({ currentInput: 'den' });
    expect(instance.filteredItems).toEqual(['dennis']);

    instance.setState({ currentInput: 'de' });
    expect(instance.filteredItems).toEqual(['dennis', 'dee']);
  });

  it('should filter items based on input passed in from parent', () => {
    wrapper.setProps({ value: 'ank' });
    instance.setState({ currentInput: 'charlie' });

    expect(instance.filteredItems).toEqual(['frank']);
  });

  it('should return the correct value when controlled / uncontrolled', () => {
    // uncontrolled
    instance.setState({ currentInput: 'artemis' });
    expect(instance.value).toBe('artemis');

    // controlled
    wrapper.setProps({ value: 'frank' });
    expect(instance.value).toBe('frank');

    // controlled with an empty string
    wrapper.setProps({ value: '' });
    expect(instance.value).toBe('');
  });

  it('it should generate an option id', () => {
    expect(instance.getOptionId(2)).toBe(`auto-complete-option-${wrapper.state().id}-2`);
  });

  it('should select a result', () => {
    const mockPreventDefault = jest.fn(() => null);
    const mockEvent = { preventDefault: mockPreventDefault };
    instance.onSelectResult(mockEvent, 'frank');

    expect(mockPreventDefault).toHaveBeenCalled();
    expect(wrapper.state().currentInput).toBe('frank');
    expect(mockOnChange).toHaveBeenCalledWith('frank');
  });

  it('should show results on focus', () => {
    instance.setState({ showResults: false });
    instance.onFocus();

    expect(wrapper.state().showResults).toBe(true);
  });

  it('should hide results on blur', () => {
    instance.setState({ showResults: true });
    instance.onBlur();

    expect(wrapper.state().showResults).toBe(false);
  });

  it('should handle input change events', () => {
    instance.setState({ showResults: false });
    instance.onChange({ target: { value: 'dee' } });

    expect(wrapper.state().showResults).toBe(true);
    expect(mockOnChange).toHaveBeenCalledWith('dee');
  });

  it('should not do anything on keydown if the results are not showing', () => {
    const prevState = wrapper.state();
    instance.onKeyDown();

    expect(wrapper.state()).toEqual(prevState);
  });

  it('should handle an up arrow key press if there is an item other than the first selected', () => {
    instance.setState({ selectedIndex: 3, showResults: true });
    instance.onKeyDown({ key: 'ArrowUp' });

    expect(wrapper.state().selectedIndex).toBe(2);
  });

  it('should handle an up arrow key press if the first item is selected', () => {
    instance.setState({ selectedIndex: 0, showResults: true });
    instance.onKeyDown({ key: 'ArrowUp' });

    expect(wrapper.state().selectedIndex).toBe(4);
  });

  it('should handle an up arrow key press if no item is selected', () => {
    instance.setState({ showResults: true });
    instance.onKeyDown({ key: 'ArrowUp' });

    expect(wrapper.state().selectedIndex).toBe(4);
  });

  it('should handle a down arrow key press if there is an item other than the last selected', () => {
    instance.setState({ selectedIndex: 2, showResults: true });
    instance.onKeyDown({ key: 'ArrowDown' });

    expect(wrapper.state().selectedIndex).toBe(3);
  });

  it('should handle a down arrow key press if the last item is selected', () => {
    instance.setState({ selectedIndex: 4, showResults: true });
    instance.onKeyDown({ key: 'ArrowDown' });

    expect(wrapper.state().selectedIndex).toBe(0);
  });

  it('should handle a down arrow key press if no item is selected', () => {
    instance.setState({ showResults: true });
    instance.onKeyDown({ key: 'ArrowDown' });

    expect(wrapper.state().selectedIndex).toBe(0);
  });

  it('should handle an enter key press', () => {
    const mockPreventDefault = jest.fn(() => null);
    instance.setState({ selectedIndex: 2, showResults: true });
    instance.onKeyDown({ key: 'Enter', preventDefault: mockPreventDefault });

    expect(wrapper.state().currentInput).toBe('dennis');
    expect(wrapper.state().selectedIndex).toBe(undefined);
    expect(wrapper.state().showResults).toBe(false);
    expect(mockPreventDefault).toHaveBeenCalled();
    expect(mockOnChange).toHaveBeenCalledWith('dennis');
  });

  it('should handle an enter key press when no item is selected', () => {
    const mockPreventDefault = jest.fn(() => null);
    instance.setState({ currentInput: 'de', selectedIndex: undefined, showResults: true });
    instance.onKeyDown({ key: 'Enter', preventDefault: mockPreventDefault });

    expect(wrapper.state().currentInput).toBe('de');
    expect(wrapper.state().selectedIndex).toBe(undefined);
    expect(wrapper.state().showResults).toBe(false);
    expect(mockPreventDefault).toHaveBeenCalled();
    expect(mockOnChange).toHaveBeenCalledWith('de');
  });

  it('should handle an enter key press when no matches are being shown', () => {
    const mockPreventDefault = jest.fn(() => null);
    instance.setState({ currentInput: 'nothing matches this', selectedIndex: undefined, showResults: true });
    instance.onKeyDown({ key: 'Enter', preventDefault: mockPreventDefault });

    expect(wrapper.state().currentInput).toBe('nothing matches this');
    expect(wrapper.state().selectedIndex).toBe(undefined);
    expect(wrapper.state().showResults).toBe(false);
    expect(mockPreventDefault).not.toHaveBeenCalled();
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('should handle an escape key press', () => {
    const mockPreventDefault = jest.fn(() => null);
    const mockStopPropagation = jest.fn(() => null);
    instance.setState({ selectedIndex: 2, showResults: true });
    instance.onKeyDown({ key: 'Escape', preventDefault: mockPreventDefault, stopPropagation: mockStopPropagation });

    expect(wrapper.state().currentInput).toBe('');
    expect(wrapper.state().selectedIndex).toBe(undefined);
    expect(wrapper.state().showResults).toBe(false);
    expect(mockPreventDefault).toHaveBeenCalled();
    expect(mockStopPropagation).toHaveBeenCalled();
    expect(mockOnChange).toHaveBeenCalledWith('');
  });

  it('should fuzzy search for a substring within a string', () => {
    expect(instance.fuzzysearch('fra', 'frank')).toBe(true);
    expect(instance.fuzzysearch('fnk', 'frank')).toBe(true);
    expect(instance.fuzzysearch('ank', 'frank')).toBe(true);
    expect(instance.fuzzysearch('frn', 'frank')).toBe(true);
    expect(instance.fuzzysearch('cricket', 'frank')).toBe(false);
  });
});
