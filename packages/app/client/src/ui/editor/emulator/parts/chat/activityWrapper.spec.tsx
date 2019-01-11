import * as React from 'react';
import { ReactNode } from 'react';
import { mount, ReactWrapper } from 'enzyme';

import ActivityWrapper from './activityWrapper';

jest.mock('./chat.scss', () => ({
  chatActivity: 'chat-activity',
  selectedActivity: 'selected-activity'
}));

const defaultProps = {
  activity: { text: 'Cool message' },
  isSelected: false,
  onClick: jest.fn(),
};

function render(
  overrides: any = {},
  children: ReactNode = <div className="child">child</div>
): ReactWrapper {
  const props = {
    ...defaultProps,
    ...overrides,
  };

  return mount(
    <ActivityWrapper {...props}>
      { children }
    </ActivityWrapper>
  );
}

describe('<ActivityWrapper />', () => {
  let onClick;

  beforeEach(() => {
    onClick = jest.fn();
  });

  it('adds selected class', () => {
    const component = render({ isSelected: true });
    expect(component.find('.selected-activity')).toHaveLength(1);
  });

  describe('clicking on an activity', () => {
    it('invokes onClick when not nested in an interactive element', () => {
      const component = render({ onClick });
      component.find('.child').simulate('click');

      expect(onClick).toHaveBeenCalledWith(defaultProps.activity);
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
      const component = render({ onClick });
      component.find('.child').simulate('keyDown', { key: ' ' });
      component.find('.child').simulate('keyDown', { key: 'Enter' });
      component.find('.child').simulate('keyDown', { key: 'Backspace' });

      expect(onClick).toHaveBeenCalledWith(defaultProps.activity);
      expect(onClick).toHaveBeenCalledTimes(2);
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

    expect(component.prop('role')).toEqual('button');
    expect(component.prop('tabIndex')).toEqual(0);
  });
});
