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

import { SplitButtonPanel } from './splitButtonPanel';

jest.mock('./splitButtonPanel.scss', () => ({}));

describe('<SplitButtonPanel>', () => {
  let wrapper;
  let node;
  let instance;
  let mockOnClick;
  const mockCaretRef = {
    getBoundingClientRect: () => ({ top: 0, bottom: 0 }),
  } as any;
  let mockHidePanel;

  beforeEach(() => {
    mockHidePanel = jest.fn(() => null);
    wrapper = mount(<SplitButtonPanel expanded={true} caretRef={mockCaretRef} />);
    node = wrapper.find(SplitButtonPanel);
    instance = wrapper.instance();
  });

  it('should add event listeners on mount', () => {
    const docAddEventListenerSpy = jest.spyOn(document, 'addEventListener');
    const docBodyAddEventListenerSpy = jest.spyOn(document.body, 'addEventListener');
    instance.componentWillMount();

    expect(docAddEventListenerSpy).toHaveBeenCalledWith('wheel', instance.onScroll);
    expect(docBodyAddEventListenerSpy).toHaveBeenCalledWith('click', instance.onOutsideClick);
  });

  it('should remove event listeners on unmount', () => {
    const docRemoveEventListenerSpy = jest.spyOn(document, 'removeEventListener');
    const docBodyRemoveEventListenerSpy = jest.spyOn(document.body, 'removeEventListener');
    instance.componentWillUnmount();

    expect(docRemoveEventListenerSpy).toHaveBeenCalledWith('wheel', instance.onScroll);
    expect(docBodyRemoveEventListenerSpy).toHaveBeenCalledWith('click', instance.onOutsideClick);
  });

  it("shouldn't render any html if not expanded", () => {
    wrapper = mount(<SplitButtonPanel expanded={false} />);
    node = wrapper.find(SplitButtonPanel);

    expect(node.html()).toBeFalsy();
  });

  it('should render deeply', () => {
    expect(node.html()).not.toBe(null);
  });

  it('should set a panel ref and focus it', () => {
    const mockFocus = jest.fn(() => null);
    const mockPanelRef = {
      focus: mockFocus,
    };
    instance.setPanelRef(mockPanelRef);

    expect(mockFocus).toHaveBeenCalledTimes(1);
    expect(instance.panelRef).toBe(mockPanelRef);
  });

  it('should return a panel element', () => {
    const panel = instance.panel;

    expect(panel).not.toBe(null);
  });

  it('should get an option id', () => {
    const optionId = instance.getOptionId(5);

    expect(optionId).toBe('split_button_option_5');
  });

  it('should select an option', () => {
    mockOnClick = jest.fn((_index: number) => null);
    wrapper = mount(<SplitButtonPanel onClick={mockOnClick} />);
    instance = wrapper.instance();

    instance.onSelectOption(null, 5);

    expect(mockOnClick).toHaveBeenCalledWith(5);
  });

  it('should hide on a scroll event', () => {
    wrapper = mount(<SplitButtonPanel hidePanel={mockHidePanel} expanded={true} caretRef={mockCaretRef} />);
    instance = wrapper.instance();
    instance.onScroll({});

    expect(mockHidePanel).toHaveBeenCalledTimes(1);
  });

  it('should hide on an outside click', () => {
    const mockEvent = { target: 'outsideOfPanel' };
    wrapper = mount(<SplitButtonPanel hidePanel={mockHidePanel} expanded={true} caretRef={mockCaretRef} />);
    instance = wrapper.instance();
    instance.panelRef = {
      contains: (target: string) => (target === 'withinPanel' ? true : false),
    };
    instance.onOutsideClick(mockEvent);

    expect(mockHidePanel).toHaveBeenCalledTimes(1);
  });
});
