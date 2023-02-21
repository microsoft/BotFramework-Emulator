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

import { MenuButton, MenuButtonProps, MenuButtonState } from './menuButton';

describe('<MenuButton />', () => {
  let wrapper: ReactWrapper<MenuButtonProps, MenuButtonState, MenuButton>;
  let instance: MenuButton;

  beforeEach(() => {
    wrapper = mount(<MenuButton items={[{ label: 'item1' }, { label: 'item2' }]} />);
    instance = wrapper.instance();
  });

  it('should render without any errors', () => {
    const addEventListenerSpy = jest.spyOn(document.body, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(document.body, 'removeEventListener');
    wrapper = mount(<MenuButton items={[{ label: 'item1' }, { label: 'item2' }]} />);

    expect(instance).toBeTruthy();
    expect(addEventListenerSpy).toHaveBeenCalledTimes(3);

    wrapper.unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledTimes(3);

    addEventListenerSpy.mockClear();
    removeEventListenerSpy.mockClear();
  });

  it('should handle a button click', () => {
    const dispatchEventSpy = jest.spyOn(document.body, 'dispatchEvent');
    wrapper.setState({ menuShowing: false });
    (instance as any).onButtonClick();

    expect(dispatchEventSpy).toHaveBeenCalledWith(
      new CustomEvent('MenuButtonExpanded', { detail: expect.any(String) })
    );
    expect(wrapper.state().menuShowing).toBe(true);

    dispatchEventSpy.mockClear();
  });

  it('should set a wrapper ref', () => {
    const ref = {};
    (instance as any).setWrapperRef(ref);

    expect((instance as any).buttonRef).toEqual(ref);
  });

  it('should toggle menu showing and focus the button if hiding the menu', () => {
    const buttonRef = { focus: jest.fn() };
    (instance as any).buttonRef = buttonRef;
    (instance as any).setMenuShowing(false);

    expect(wrapper.state().menuShowing).toBe(false);
    expect(buttonRef.focus).toHaveBeenCalled();
  });

  it('should handle selecting a menu item', () => {
    wrapper.setState({ menuShowing: true });
    (instance as any).onMenuItemSelected();

    expect(wrapper.state().menuShowing).toBe(false);
  });

  it('should hide the menu if another menu is opened', () => {
    wrapper.setState({ menuShowing: true });
    (instance as any).menuButtonId = 'someMenuId';
    (instance as any).onMenuButtonExpanded({ detail: 'someOtherMenuId' });

    expect(wrapper.state().menuShowing).toBe(false);
  });

  it('should handle a document body click', () => {
    wrapper.setProps({ id: 'someId' });
    (instance as any).onBodyClick({ target: { closest: () => true, id: 'someOtherId' } });

    expect(wrapper.state().menuShowing).toBe(false);

    wrapper.setProps({ id: undefined });
    (instance as any).menuButtonId = 'someId';
    (instance as any).onBodyClick({ target: { closest: () => true, id: 'someOtherId' } });

    expect(wrapper.state().menuShowing).toBe(false);
  });
});
