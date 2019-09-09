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
import { createStore } from 'redux';
import { Provider } from 'react-redux';

import { DialogHostContainer } from './hostContainer';
import { DialogHost } from './host';

jest.mock('./host.scss', () => ({}));

let mockSetHost;
let mockHideDialog;
jest.mock('../service', () => ({
  get DialogService() {
    return {
      setHost: mockSetHost,
      hideDialog: mockHideDialog,
    };
  },
}));

describe('<DialogHost>', () => {
  let wrapper;
  let node;
  let instance;
  let mockState;

  beforeEach(() => {
    mockSetHost = jest.fn(() => null);
    mockHideDialog = jest.fn(() => null);
    mockState = { dialog: { showing: true } };
    wrapper = mount(
      <Provider store={createStore((_action, state) => mockState, {})}>
        <DialogHostContainer />
      </Provider>
    );
    node = wrapper.find(DialogHost);
    instance = node.instance();
  });

  it('should render deeply', () => {
    expect(node.html()).not.toBe(null);
  });

  it('should add an event listener on mount, and remove on unmount', () => {
    const mockAddEventListener = jest.fn(() => null);
    const mockRemoveEventLister = jest.fn(() => null);
    instance.hostRef.current = {
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventLister,
    };

    instance.componentDidMount();
    expect(mockAddEventListener).toHaveBeenCalledWith('dialogRendered', instance.initFocusTrap);

    instance.componentWillUnmount();
    expect(mockRemoveEventLister).toHaveBeenCalledWith('dialogRendered', instance.initFocusTrap);
  });

  it('should handle an overlay click', () => {
    const mockStopPropagation = jest.fn(() => null);
    const mockEvent = { stopPropagation: mockStopPropagation };
    instance.handleOverlayClick(mockEvent);

    expect(mockStopPropagation).toHaveBeenCalled();
    expect(mockHideDialog).toHaveBeenCalled();
  });

  it('should handle a content click', () => {
    const mockStopPropagation = jest.fn(() => null);
    const mockEvent = { stopPropagation: mockStopPropagation };
    instance.handleContentClick(mockEvent);

    expect(mockStopPropagation).toHaveBeenCalled();
  });

  it('should save a host element reference', () => {
    const mockElem = { addEventListener: () => null, name: 'I am a fake element!' };
    instance.hostRef.current = mockElem;
    instance.componentDidMount();

    expect(mockSetHost).toHaveBeenCalledWith(mockElem);
    expect(instance.hostRef.current).toBe(mockElem);
  });

  it('should get all focusable elements in the modal', () => {
    // create mock inner dialog
    //   <div>
    //    <div><span/><span/></div> // 1 div & 2 spans; all tab-able
    //   </div>
    const hostElement = document.createElement('div');
    const mockDialog = document.createElement('div');
    const mockSpan1 = document.createElement('span');
    const mockSpan2 = document.createElement('span');
    mockDialog.setAttribute('tabindex', '0');
    mockSpan1.setAttribute('tabindex', '0');
    mockSpan2.setAttribute('tabindex', '0');
    mockDialog.appendChild(mockSpan1);
    mockDialog.appendChild(mockSpan2);
    hostElement.append(mockDialog);

    instance.hostRef.current = hostElement;
    const focusableElements = instance.getFocusableElementsInModal();
    expect(focusableElements.length).toBe(3);
  });

  it('should initialize the focus trap', () => {
    const mockFocus = jest.fn(() => null);
    const mockGetFocusableElementsInModal = jest.fn(() => {
      return [
        { elem: 'elem1' }, // should be focused
        { elem: 'elem2', focus: mockFocus },
        { elem: 'elem3' },
      ];
    });
    instance.getFocusableElementsInModal = mockGetFocusableElementsInModal;

    instance.initFocusTrap();
    expect(mockFocus).toHaveBeenCalled();
  });

  it('should focus the last focusable element when focusing the first sentinel', () => {
    const mockPreventDefault = jest.fn(() => null);
    const mockFocusEvent = { preventDefault: mockPreventDefault };
    const mockFocusEnabledElement = jest.fn(() => null);
    const mockFocusDisabledElement = jest.fn(() => null);
    const mockGetFocusableElementsInModal = jest.fn(() => {
      return [
        { elem: 'elem1', hasAttribute: () => true },
        {
          elem: 'elem2',
          hasAttribute: () => false,
          focus: mockFocusEnabledElement,
        }, // should be focused
        {
          elem: 'disabledElem',
          hasAttribute: () => true, // should be skipped because disabled
          focus: mockFocusDisabledElement,
        },
      ];
    });

    instance.hostRef.current = { querySelectorAll: mockGetFocusableElementsInModal };

    instance.onFocusStartingSentinel(mockFocusEvent);
    expect(mockFocusEnabledElement).toHaveBeenCalled();
    expect(mockFocusDisabledElement).not.toHaveBeenCalled();
  });

  it('should focus the first focusable element when focusing the last sentinel', () => {
    const mockPreventDefault = jest.fn(() => null);
    const mockFocusEvent = { preventDefault: mockPreventDefault };
    const mockFocusEnabledElement = jest.fn(() => null);
    const mockFocusDisabledElement = jest.fn(() => null);
    const mockGetFocusableElementsInModal = jest.fn(() => {
      return [
        {
          elem: 'disabledElem',
          hasAttribute: () => true, // should be skipped because disabled
          focus: mockFocusDisabledElement,
        },
        {
          elem: 'elem1',
          hasAttribute: () => false,
          focus: mockFocusEnabledElement,
        }, // should be focused
        { elem: 'elem2', hasAttribute: () => true },
      ];
    });

    instance.hostRef.current = { querySelectorAll: mockGetFocusableElementsInModal };

    instance.onFocusEndingSentinel(mockFocusEvent);
    expect(mockFocusEnabledElement).toHaveBeenCalled();
    expect(mockFocusDisabledElement).not.toHaveBeenCalled();
  });
});
