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
import { mount, ReactWrapper } from 'enzyme';

import { MenuItemComp, MenuItemProps } from './menuItem';

const mockFocusHandler = jest.fn(_index => jest.fn());

describe('<MenuItem />', () => {
  let wrapper: ReactWrapper<MenuItemProps, {}, MenuItemComp>;
  let instance: MenuItemComp;

  beforeEach(() => {
    wrapper = mount(<MenuItemComp index={0} focusHandler={mockFocusHandler} />);
    instance = wrapper.instance();
  });

  it('should render a menu item without any errors', () => {
    wrapper.setProps({ checked: true, label: 'Fullscreen', subtext: 'F11' });
    const outerLiElement = wrapper.getDOMNode<HTMLLIElement>();

    expect(instance).toBeTruthy();
    expect(wrapper.html().includes('Fullscreen')).toBe(true);
    expect(wrapper.html().includes('F11')).toBe(true);
    expect(outerLiElement.getAttribute('aria-label')).toBe('Fullscreen checked');
  });

  it('should render a disabled menu item without any errors', () => {
    wrapper.setProps({ checked: false, disabled: true, label: 'Start debugging' });
    const outerLiElement = wrapper.getDOMNode<HTMLLIElement>();

    expect(instance).toBeTruthy();
    expect(wrapper.html().includes('Start debugging')).toBe(true);
    expect(outerLiElement.getAttribute('aria-label')).toBe('Start debugging unavailable');
  });

  it('should render a separator', () => {
    wrapper.setProps({ label: 'Some label', type: 'separator' });

    expect(instance).toBeTruthy();
    expect(wrapper.html().includes('Some label')).toBe(false);
  });

  it('should handle a click', () => {
    const mockOnClick = jest.fn();
    const dispatchEventSpy = jest.spyOn(document.body, 'dispatchEvent');
    wrapper.setProps({ disabled: false, onClick: mockOnClick });
    (instance as any).onClick();

    expect(mockOnClick).toHaveBeenCalled();
    expect(dispatchEventSpy).toHaveBeenCalledWith(new Event('MenuItemSelected'));
  });

  it('should handle an enter key press', () => {
    const mockOnClick = jest.fn();
    const dispatchEventSpy = jest.spyOn(document.body, 'dispatchEvent');
    const mockEvent = { key: 'enter', preventDefault: jest.fn(), stopPropagation: jest.fn() };
    wrapper.setProps({ disabled: false, onClick: mockOnClick });
    (instance as any).onKeyDown(mockEvent);

    expect(mockOnClick).toHaveBeenCalled();
    expect(dispatchEventSpy).toHaveBeenCalledWith(new Event('MenuItemSelected'));
    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
  });
});
