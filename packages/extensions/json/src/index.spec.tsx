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
import { ValueTypes } from '@bfemulator/app-shared';

import { WindowHostReceiver } from './windowHostReceiver';
import { JsonViewerExtension } from './jsonViewerExtension';

(window as any).host = {
  handlers: {
    inspect: [],
    theme: [],
  },

  on: function(event, handler) {
    if (handler && Array.isArray(this.handlers[event]) && !this.handlers[event].includes(handler)) {
      this.handlers[event].push(handler);
    }
    return () => {
      this.handlers[event] = this.handlers[event].filter(item => item !== handler);
    };
  },
};

const mockData = {
  valueType: ValueTypes.Diff,
  value: {
    conversationState: {
      dialogState: {
        dialogStack: {
          '0': {
            id: 'root',
            state: {
              options: {},
              stepIndex: 0,
              values: { instanceId: '8bc9292d-aa45-bf03-f7dc-50dea831c3fc' },
            },
          },
          '1': {
            id: 'slot-dialog',
            state: {
              '+slot': 'address',
              '-slot': 'shoesize',
              values: {
                '+shoesize': 11,
                age: 21,
                fullname: { slot: 'last', values: { first: 'Joe', last: 'Schmo' } },
              },
            },
          },
          '2': {
            '+id': 'address',
            '-id': 'shoesize',
            state: {
              '+slot': 'street',
              '-options': {
                prompt: 'Please enter your shoe size.',
                retryPrompt: 'You must enter a size between 0 and 16. Half sizes are acceptable.',
              },
              '-state': {},
              values: {},
            },
          },
          '3': { id: 'text', state: { options: { prompt: 'Please enter your street address.' }, state: {} } },
        },
      },
      eTag: '*',
    },
    userState: {},
  },
};

let jsonViewerWrapper;
let jsonViewer;

describe('The JsonViewerExtension', () => {
  let root: HTMLDivElement;
  beforeAll(async () => {
    root = document.createElement('div');
    root.id = 'root';
    const themeTag = document.createElement('link');
    themeTag.setAttribute('data-theme-component', 'true');
    document.head.appendChild(themeTag);
    document.body.appendChild(root);

    jsonViewerWrapper = mount(<JsonViewerExtension />, { attachTo: root });
    jsonViewer = jsonViewerWrapper.find(JsonViewerExtension).instance();
    new WindowHostReceiver(jsonViewer);
    (window as any).host.handlers.theme[0]({ themeName: 'high-contrast', themeComponents: ['dark.css'] });
  });

  it('should render with data and a theme', async () => {
    expect(jsonViewerWrapper.find('*').length).toBeGreaterThan(0);
    expect(jsonViewer.state.themeName).toBe('high-contrast');
  });

  it('should set the color treatment for diff data appropriately', () => {
    const spy = jest.spyOn(JsonViewerExtension as any, 'nodeColorVarName');
    (window as any).host.handlers.inspect[0](mockData); // Simulate event through host
    expect(spy).toHaveReturnedWith('--log-panel-item-error');
    expect(spy).toHaveReturnedWith('--log-panel-timestamp');
    expect(spy).toHaveReturnedWith('--log-panel-item-info');
  });
});
