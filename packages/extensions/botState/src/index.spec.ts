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
import { BotState, BotStateVisualizer } from './BotStateVisualizer';

(window as any).host = {
  bot: {},
  handlers: {
    'accessory-click': [],
    'bot-updated': [],
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

const botState: BotState = {
  conversationState: {
    memory: {
      id: 12,
      value: 'bot',
    },
  },
  userState: {
    memory: {
      value: 'greetings!',
      dialogStack: ['test', 'test1', 'test2'],
    },
  },
};

describe('The BotStateVisualizer', () => {
  let svg;
  beforeAll(() => {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'bot-state-visualizer';
    document.body.appendChild(svg);
  });

  it('should render with data', () => {
    const visualizer = new BotStateVisualizer('#bot-state-visualizer');
    (window as any).host.handlers.inspect.forEach(callback => callback({ valueType: '', value: botState }));
    (window as any).host.handlers.theme.forEach(callback => callback({ themeComponents: ['dark.css'] }));
    expect(svg.children[0].children.length).toBe(2);
  });

  it('should re-render when the window resizes', () => {
    const visualizer = new BotStateVisualizer('#bot-state-visualizer');
    (window as any).host.handlers.inspect.forEach(callback => callback({ valueType: '', value: botState }));
    const spy = jest.spyOn(visualizer, 'renderTree');
    window.dispatchEvent(new Event('resize'));
    expect(spy).toHaveBeenCalled();
  });

  it('should switch themes', () => {
    const visualizer = new BotStateVisualizer('#bot-state-visualizer');
    (window as any).host.handlers.theme.forEach(callback => callback({ themeComponents: ['light.css'] }));
    let link: HTMLLinkElement = document.querySelector('[data-theme-component="true"]');
    expect(link.href).toBe('http://localhost/light.css');
    (window as any).host.handlers.theme.forEach(callback => callback({ themeComponents: ['dark.css'] }));
    link = document.querySelector('[data-theme-component="true"]');
    expect(link.href).toBe('http://localhost/dark.css');
  });
});
