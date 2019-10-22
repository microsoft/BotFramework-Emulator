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
import { mount, shallow } from 'enzyme';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { ValueTypes } from '@bfemulator/app-shared';

import { TraceActivity } from './traceActivity';
import { TraceActivityContainer } from './traceActivityContainer';

describe('<TraceActivity />', () => {
  it('should render an activity', () => {
    const storeState = {
      chat: {
        chats: {
          doc1: {
            highlightedObjects: [],
            inspectorObjects: [{ value: {}, valueType: ValueTypes.Activity }],
          },
        },
      },
    };
    const card = { activity: { valueType: ValueTypes.Activity } };
    const wrapper = mount(
      <Provider store={createStore((state, action) => state, storeState)}>
        <TraceActivityContainer card={card} documentId={'doc1'} next={() => () => null} mode={'debug'} />
      </Provider>
    );

    expect(wrapper.find(TraceActivity).html()).toBeTruthy();
  });

  it('should render a command activity', () => {
    const storeState = {
      chat: {
        chats: {
          doc1: {
            highlightedObjects: [],
            inspectorObjects: [{ value: {}, valueType: ValueTypes.Activity }],
          },
        },
      },
    };
    const card = { activity: { valueType: ValueTypes.Command } };
    const wrapper = mount(
      <Provider store={createStore((state, action) => state, storeState)}>
        <TraceActivityContainer card={card} documentId={'doc1'} next={() => () => null} mode={'debug'} />
      </Provider>
    );

    expect(wrapper.find(TraceActivity).html()).toBeTruthy();
  });

  it('should render a bot state activity with no highlighted activities', () => {
    const storeState = {
      chat: {
        chats: {
          doc1: {
            highlightedObjects: [],
            inspectorObjects: [{ value: {}, valueType: ValueTypes.Activity }],
          },
        },
      },
    };
    const card = { activity: { valueType: ValueTypes.BotState } };
    const wrapper = mount(
      <Provider store={createStore((state, action) => state, storeState)}>
        <TraceActivityContainer card={card} documentId={'doc1'} mode={'debug'} />
      </Provider>
    );

    expect(wrapper.find(TraceActivity).html()).toBeTruthy();
  });

  it('should render a bot state activity with highlighted activities', () => {
    const storeState = {
      chat: {
        chats: {
          doc1: {
            highlightedObjects: [{}, {}],
            inspectorObjects: [{ value: {}, valueType: ValueTypes.Activity }],
          },
        },
      },
    };
    const card = { activity: { valueType: ValueTypes.BotState } };
    const wrapper = mount(
      <Provider store={createStore((state, action) => state, storeState)}>
        <TraceActivityContainer card={card} documentId={'doc1'} mode={'debug'} />
      </Provider>
    );

    expect(wrapper.find(TraceActivity).html()).toBeTruthy();
  });

  it('should not render anything if not in debug mode', () => {
    const storeState = {
      chat: {
        chats: {
          doc1: {
            highlightedObjects: [],
            inspectorObjects: [{ value: {}, valueType: ValueTypes.Activity }],
          },
        },
      },
    };
    const wrapper = mount(
      <Provider store={createStore((state, action) => state, storeState)}>
        <TraceActivityContainer documentId={'doc1'} mode={'not debug'} />
      </Provider>
    );

    expect(wrapper.find(TraceActivity).html()).toBe(null);
  });
});
