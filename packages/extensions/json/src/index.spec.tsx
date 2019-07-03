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
import { ExtensionChannel } from '@bfemulator/sdk-shared';
import { InspectorHost } from '@bfemulator/sdk-client';

import { windowHostReceiver } from './windowHostReceiver';
import { JsonViewerExtension } from './jsonViewerExtension';
import { mockChatLogs, mockDiff0, mockDiff1 } from './mocks';
import { extractBotStateActivitiesFromLogEntries } from './utils';

let hostCalls: any = {};
(window as any).host = new Proxy(
  {
    handlers: new Proxy(
      {},
      {
        get(target, p) {
          if (!(p in target)) {
            target[p] = [];
          }
          return target[p];
        },
      }
    ),

    on: function(event, handler) {
      if (handler && Array.isArray(this.handlers[event]) && !this.handlers[event].includes(handler)) {
        this.handlers[event].push(handler);
      }
      return () => {
        this.handlers[event] = this.handlers[event].filter(item => item !== handler);
      };
    },
  },
  {
    get(target, p) {
      if (!(p in target)) {
        target[p] = (...args) => {
          (hostCalls[p] || (hostCalls[p] = [])).push(args);
        };
      }
      return target[p];
    },
  }
);

let jsonViewerWrapper;
let jsonViewer;

describe('The JsonViewerExtension', () => {
  let root: HTMLDivElement;
  let host: InspectorHost;
  beforeAll(async () => {
    const Component = windowHostReceiver(JsonViewerExtension);
    root = document.createElement('div');
    root.id = 'root';
    const themeTag = document.createElement('link');
    themeTag.setAttribute('data-theme-component', 'true');
    document.head.appendChild(themeTag);
    document.body.appendChild(root);

    jsonViewerWrapper = mount(<Component />, { attachTo: root });
    jsonViewer = jsonViewerWrapper.find(JsonViewerExtension).instance();
    host = (window as any).host as InspectorHost;
    (host as any).handlers[ExtensionChannel.Theme][0]({ themeName: 'high-contrast', themeComponents: ['dark.css'] });
  });

  beforeEach(() => {
    hostCalls = {};
  });

  it('should render with data and a theme', async () => {
    expect(jsonViewerWrapper.find('*').length).toBeGreaterThan(0);
    expect(jsonViewer.props.themeName).toBe('high-contrast');
  });

  it('should set the color treatment for diff data appropriately', () => {
    const spy = jest.spyOn(JsonViewerExtension as any, 'nodeColorVarName');
    (host as any).handlers[ExtensionChannel.Inspect][0](mockDiff0); // Simulate event through host
    expect(spy).toHaveReturnedWith('--log-panel-item-error');
    expect(spy).toHaveReturnedWith('--log-panel-timestamp');
    expect(spy).toHaveReturnedWith('--log-panel-item-info');
  });

  it('should produce a diff when the "diff" button is selected', async () => {
    (host as any).handlers[ExtensionChannel.ChatLogUpdated][0]('1234', mockChatLogs);
    (host as any).handlers[ExtensionChannel.AccessoryClick][0]('diff', 'default');
    expect(hostCalls.setInspectorObjects[0]).toEqual(['1234', [mockDiff0]]);
  });

  it('should diff the next bot state when the right arrow is clicked', () => {
    (host as any).handlers[ExtensionChannel.ChatLogUpdated][0]('1234', mockChatLogs);
    (host as any).handlers[ExtensionChannel.AccessoryClick][0]('diff', 'default');
    (host as any).handlers[ExtensionChannel.AccessoryClick][0]('rightArrow');
    expect(hostCalls.setInspectorObjects[1]).toEqual(['1234', [mockDiff1]]);
  });

  it('should diff the previous bot state when the left arrow is clicked', () => {
    (host as any).handlers[ExtensionChannel.ChatLogUpdated][0]('1234', mockChatLogs);
    (host as any).handlers[ExtensionChannel.Inspect][0]({});
    (host as any).handlers[ExtensionChannel.AccessoryClick][0]('diff', 'default');
    (host as any).handlers[ExtensionChannel.AccessoryClick][0]('rightArrow');
    (host as any).handlers[ExtensionChannel.AccessoryClick][0]('leftArrow');
    expect(hostCalls.setInspectorObjects[2]).toEqual(['1234', [mockDiff0]]);
  });

  it('should should reset the highlighted objects', async () => {
    (host as any).handlers[ExtensionChannel.ChatLogUpdated][0]('1234', mockChatLogs);
    (host as any).handlers[ExtensionChannel.Inspect][0]({});
    (host as any).handlers[ExtensionChannel.AccessoryClick][0]('diff', 'default');
    (host as any).handlers[ExtensionChannel.HighlightedObjectsUpdated][0]([]);
    const botStates = extractBotStateActivitiesFromLogEntries(mockChatLogs as any);
    await new Promise(resolve => setTimeout(resolve, 1100));
    expect(hostCalls.setHighlightedObjects[1]).toEqual(['1234', botStates.slice(0, 2)]);
  });
});
