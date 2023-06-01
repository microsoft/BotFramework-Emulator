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
import { ReactNode } from 'react';
import { mount, ReactWrapper } from 'enzyme';

import { ActivityWrapper } from './activityWrapper';

jest.mock('./chat.scss', () => ({
  chatActivity: 'chat-activity',
  selectedActivity: 'selected-activity',
}));

const defaultProps = {
  activity: { text: 'Cool message' },
  isSelected: false,
  onClick: jest.fn(),
  onKeyDown: jest.fn(),
};

function render(overrides: any = {}, children: ReactNode = <div className="child">child</div>): ReactWrapper {
  const props = {
    ...defaultProps,
    ...overrides,
  };

  return mount(<ActivityWrapper {...props}>{children}</ActivityWrapper>);
}

describe('<ActivityWrapper />', () => {
  let onClick;
  let onKeyDown;

  beforeEach(() => {
    onClick = jest.fn();
    onKeyDown = jest.fn();
  });

  it('adds selected class', () => {
    const component = render({ isSelected: true });
    expect(component.find('.selected-activity')).toHaveLength(1);
    expect(component.find('.selected-activity').props()['aria-checked']).toBe(true);
  });

  describe('clicking on an activity', () => {
    it('invokes onClick when not nested in an interactive element', () => {
      const component = render({ onClick });
      component.find('.child').simulate('click');

      expect(onClick).toHaveBeenCalled();
    });

    it('does not invoke onClick when nested in an interactive element', () => {
      const children = (
        <a href="/">
          <div>
            <div className="child">Click me!</div>
          </div>
        </a>
      );
      const component = render({ onClick }, children);
      component.find('.child').simulate('click');

      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe('using the keyboard to select an activity', () => {
    it('invokes onClick when not nested in an interactive element', () => {
      const component = render({ onKeyDown });
      component.find('.child').simulate('keyDown', { key: ' ' });
      component.find('.child').simulate('keyDown', { key: 'Enter' });
      component.find('.child').simulate('keyDown', { key: 'Backspace' });

      expect(onKeyDown).toHaveBeenCalledTimes(2);
    });

    it('does not invoke onClick when nested in an interactive element', () => {
      const children = (
        <button>
          <div>
            <div className="child">Click me!</div>
          </div>
        </button>
      );
      const component = render({ onClick }, children);
      component.find('.child').simulate('keyDown', { key: ' ' });

      expect(onClick).not.toHaveBeenCalled();
    });
  });

  it('has the right a11y attributes', () => {
    const component = render().find('.chat-activity');

    expect(component.prop('role')).toEqual('region');
    expect(component.prop('tabIndex')).toEqual(0);
  });
});
