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
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { mount, shallow } from 'enzyme';
import { ValueTypes } from '@bfemulator/app-shared';

import { OuterActivityWrapper } from './outerActivityWrapper';
import { OuterActivityWrapperContainer } from './outerActivityWrapperContainer';

describe('<OuterActivityWrapper />', () => {
  it('should render', () => {
    const storeState = {
      chat: {
        chats: {
          doc1: {
            highlightedObjects: [],
            inspectorObjects: [{ value: {}, valueType: ValueTypes.Activity }],
          },
          restartStatus: {},
        },
      },
    };
    const card = {
      activity: {
        id: 'card1',
        from: {
          role: 'user',
        },
      },
    };
    const wrapper = mount(
      <Provider store={createStore((state, action) => state, storeState)}>
        <OuterActivityWrapperContainer
          card={card}
          documentId={'doc1'}
          onRestartConversationFromActivityClick={jest.fn()}
        />
      </Provider>
    );

    expect(wrapper.find(OuterActivityWrapper).exists()).toBe(true);
  });

  it('should determine if an activity should be selected', () => {
    const card = {
      activity: {
        id: 'card1',
        from: {
          role: 'user',
        },
      },
    };
    const wrapper = shallow(
      <OuterActivityWrapper card={card} highlightedActivities={[]} onRestartConversationFromActivityClick={jest.fn()} />
    );
    const instance = wrapper.instance();

    expect((instance as any).shouldBeSelected(card.activity)).toBe(false);
  });

  it('should start restart flow from the selected activity when clicked', () => {
    const card = {
      activity: {
        id: 'card1',
        from: {
          role: 'user',
        },
      },
    };

    const onRestartClick = jest.fn();
    const wrapper = shallow(
      <OuterActivityWrapper
        card={card}
        highlightedActivities={[]}
        onRestartConversationFromActivityClick={onRestartClick}
        documentId="some-id"
      />
    );
    const instance = wrapper.instance();

    (instance as any).propsBoundRestartActivityHandler();
    expect(onRestartClick).toHaveBeenCalledWith('some-id', card.activity);
  });

  it('should determine if an activity is user activity or not', () => {
    const userCard = {
      activity: {
        id: 'card1',
        from: {
          role: 'user',
        },
        channelData: {
          test: true,
        },
      },
    };

    const botCard = {
      activity: {
        id: 'card1',
        from: {
          role: 'bot',
        },
      },
    };
    const wrapper = shallow(
      <OuterActivityWrapper
        card={userCard}
        highlightedActivities={[]}
        onRestartConversationFromActivityClick={jest.fn()}
      />
    );
    const instance = wrapper.instance();

    expect((instance as any).isUserActivity(userCard.activity)).toBe(true);
    expect((instance as any).isUserActivity(botCard.activity)).toBe(false);
  });
});
