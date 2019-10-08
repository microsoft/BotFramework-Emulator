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

import { Menu, MenuProps, MenuState } from './menu';

describe('<Menu />', () => {
  let wrapper: ReactWrapper<MenuProps, MenuState, Menu>;
  let instance: Menu;
  const mockSetMenuShowing = jest.fn();

  beforeEach(() => {
    wrapper = mount(<Menu items={[{ label: 'item 1' }, { label: 'item 2' }]} setMenuShowing={mockSetMenuShowing} />);
    instance = wrapper.instance();
    mockSetMenuShowing.mockClear();
  });

  it('should render without any errors', () => {
    expect(instance).toBeTruthy();

    wrapper.setProps({ topLevel: true });

    expect(instance).toBeTruthy();
  });

  it('should get a menu position based on the position of the anchor element', () => {
    const mockAnchorRef: any = { getBoundingClientRect: () => ({ top: 200, left: 100, right: 300, bottom: 300 }) };
    wrapper.setProps({ anchorRef: mockAnchorRef });
    // below anchor
    let pos = (instance as any).menuPosition;

    expect(pos.top).toBe(300);
    expect(pos.left).toBe(100);

    // to right of anchor
    wrapper.setProps({ orientation: 'toRight' });
    pos = (instance as any).menuPosition;

    expect(pos.top).toBe(208);
    expect(pos.left).toBe(300);
  });

  it('should not focus anything if there are no focusable items in the list (previous)', () => {
    wrapper.setState({ focusedIndex: undefined });
    wrapper.setProps({ items: [] });
    (instance as any).focusNextItem();

    expect(wrapper.state().focusedIndex).toBe(undefined);

    wrapper.setProps({ items: [{ type: 'separator' }] });
    (instance as any).focusNextItem();

    expect(wrapper.state().focusedIndex).toBe(undefined);
  });

  it('should focus the previous item in the list', () => {
    wrapper.setState({ focusedIndex: 1 });
    wrapper.setProps({ items: [{ label: 'item 1' }, { label: 'item 2' }] });
    (instance as any).focusNextItem();

    expect(wrapper.state().focusedIndex).toBe(0);
  });

  it('should focus the previous item in the list starting at the last item if currently at the start of the list', () => {
    wrapper.setState({ focusedIndex: 0 });
    wrapper.setProps({ items: [{ label: 'item 1' }, { label: 'item 2' }] });
    (instance as any).focusNextItem();

    expect(wrapper.state().focusedIndex).toBe(1);
  });

  it('should not focus anything if there are no focusable items in the list (next)', () => {
    wrapper.setState({ focusedIndex: undefined });
    wrapper.setProps({ items: [] });
    (instance as any).focusNextItem();

    expect(wrapper.state().focusedIndex).toBe(undefined);

    wrapper.setProps({ items: [{ type: 'separator' }] });
    (instance as any).focusNextItem();

    expect(wrapper.state().focusedIndex).toBe(undefined);
  });

  it('should focus the next item in the list', () => {
    wrapper.setState({ focusedIndex: 0 });
    wrapper.setProps({ items: [{ label: 'item 1' }, { label: 'item 2' }] });
    (instance as any).focusNextItem();

    expect(wrapper.state().focusedIndex).toBe(1);
  });

  it('should focus the next item in the list starting at the first item if currently at the end of the list', () => {
    wrapper.setState({ focusedIndex: 1 });
    wrapper.setProps({ items: [{ label: 'item 1' }, { label: 'item 2' }] });
    (instance as any).focusNextItem();

    expect(wrapper.state().focusedIndex).toBe(0);
  });

  it('should check an item ref for focus', () => {
    wrapper.setState({ focusedIndex: 0 });
    const mockRef = { focus: jest.fn() };
    (instance as any).checkRefForFocus(0)(mockRef);

    expect(mockRef.focus).toHaveBeenCalled();
  });

  it('should focus the next item on a down arrow press', () => {
    const focusNextItemSpy = jest.spyOn(instance as any, 'focusNextItem');
    const mockEvent = { key: 'arrowdown', stopPropagation: jest.fn() };
    (instance as any).onKeyDown(mockEvent);

    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(focusNextItemSpy).toHaveBeenCalled();
  });

  it('should focus the previous item on an up arrow press', () => {
    const focusPreviousItemSpy = jest.spyOn(instance as any, 'focusPreviousItem');
    const mockEvent = { key: 'arrowup', stopPropagation: jest.fn() };
    (instance as any).onKeyDown(mockEvent);

    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(focusPreviousItemSpy).toHaveBeenCalled();
  });

  it('should hide the menu on an escape press', () => {
    const hideMenuSpy = jest.spyOn(instance as any, 'hideMenu');
    const mockEvent = { key: 'escape', stopPropagation: jest.fn() };
    (instance as any).onKeyDown(mockEvent);

    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(hideMenuSpy).toHaveBeenCalled();
  });

  it('should hide the menu on an enter press', () => {
    wrapper.setProps({ topLevel: true });
    const hideMenuSpy = jest.spyOn(instance as any, 'hideMenu');
    const mockEvent = { key: 'enter', preventDefault: jest.fn() };
    (instance as any).onKeyDown(mockEvent);

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(hideMenuSpy).toHaveBeenCalled();
  });

  it('should hide the menu on a tab or shift+tab press', () => {
    const hideMenuSpy = jest.spyOn(instance as any, 'hideMenu');
    const mockEvent = { key: 'tab', preventDefault: jest.fn(), shiftKey: true };
    (instance as any).onKeyDown(mockEvent);

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(hideMenuSpy).toHaveBeenCalled();
  });

  it('should handle other keydown', () => {
    (instance as any).onKeyDown({ key: '' });
  });

  it('should hide the menu', () => {
    const mockAnchorRef: any = { focus: jest.fn() };
    const mockSetMenuShowing = jest.fn();
    wrapper.setProps({ anchorRef: mockAnchorRef, setMenuShowing: mockSetMenuShowing });
    (instance as any).hideMenu();

    expect(mockAnchorRef.focus).toHaveBeenCalled();
    expect(mockSetMenuShowing).toHaveBeenCalled();
  });
});
