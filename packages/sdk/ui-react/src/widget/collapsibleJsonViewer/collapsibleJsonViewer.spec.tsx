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

import { CollapsibleJsonViewer } from './collapsibleJsonViewer';

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

const mockTreeHTMLText = `
<ul id="rootGroup">
  <li>
    <div>
      <div>▶</div>
    </div>
    <label><span>root:</span></label>
    <span>
      <span> 
        <span>{}</span> 2 keys
        </span></span>
    <ul id="group1">
      <li>
        <div>
          <div>▶</div>
        </div>
        <label><span>membersAdded:</span></label>
        <span><span><span>[]</span> 1 item</span></span>
        <ul id="group2">
          <li>
            <div role="button" id="actuator">
              <div>▶</div>
            </div>
            <label><span>0:</span></label>
            <span>
              <span>
                <span>{}</span> 
                2 keys
              </span>
            </span>
            <ul id="group3">
              <li><label><span>id:</span></label><span>"1"</span></li>
              <li><label><span>name:</span></label><span>"Bot"</span>
              </li>
            </ul>
          </li>
        </ul>
      </li>
      <li><label><span>type:</span></label><span>"conversationUpdate"</span>
      </li>
    </ul>
  </li>
</ul>`;

let jsonViewerWrapper;
let jsonViewer;

describe('The JsonViewer', () => {
  beforeAll(() => {
    jsonViewerWrapper = mount(<CollapsibleJsonViewer data={mockData} themeName={'high-contrast'} />);
    jsonViewer = jsonViewerWrapper.find(CollapsibleJsonViewer).instance();
  });

  it('should render with data and a theme', () => {
    expect(jsonViewerWrapper.find('*').length).toBeGreaterThan(0);
    expect(jsonViewer.props.data).toBe(mockData);
    expect(jsonViewer.props.themeName).toBe('high-contrast');
  });

  describe('The JsonViewer keyboard navigation system', () => {
    let simulatedTree;
    beforeAll(() => {
      (jsonViewer as any).jsonViewerRef = simulatedTree = document.createElement('div');
      simulatedTree.innerHTML = mockTreeHTMLText;

      const root = simulatedTree.querySelector('#rootGroup');
      (jsonViewer as any).mutationObserverCallback([{ addedNodes: root.querySelectorAll('*') }] as any);
    });

    it('should set the expected attributes when the mutationObserverCallback is called', () => {
      expect(simulatedTree.querySelectorAll('[role="group"]').length).toBe(3);

      (jsonViewer as any).mutationObserverCallback([
        { addedNodes: [simulatedTree.firstElementChild.firstElementChild] },
      ] as any);
      expect(simulatedTree.querySelectorAll('[role="treeitem"]').length).toBe(6);
    });

    it('should focus the next item within an expanded group when the down arrow is pressed from the last item within the previous group', () => {
      const group = simulatedTree.querySelector('#group2');
      const nextGroup = simulatedTree.querySelector('#group3');
      const target = group.lastElementChild;
      const spy = jest.spyOn(nextGroup.firstElementChild, 'focus');
      const event = {
        preventDefault: () => void 0,
        key: 'ArrowDown',
        target,
      };

      (jsonViewer as any).onTreeKeydown(event as any);

      expect(spy).toHaveBeenCalled();
    });

    it('should focus the next item with the tree when the down arrow is pressed from a treeitem', () => {
      const group = simulatedTree.querySelector('#group3');
      const target = group.children[0];
      const event = {
        preventDefault: () => void 0,
        key: 'ArrowDown',
        target,
      };

      const spy = jest.spyOn(group.children[1], 'focus');
      (jsonViewer as any).onTreeKeydown(event as any);

      expect(spy).toHaveBeenCalled();
    });

    it('should update the "aria-expanded" attribute when a node is clicked', () => {
      const target = simulatedTree.querySelector('#actuator');
      const group = simulatedTree.querySelector('#group3');
      expect(group.getAttribute('aria-expanded')).toBe('true');
      const event = {
        preventDefault: () => void 0,
        target,
      };
      (jsonViewer as any).onTreeClick(event as any);

      expect(group.getAttribute('aria-expanded')).toBe('false');
    });

    it('should focus the previous item within the tree when the up arrow is pressed from a treeitem', () => {
      const group = simulatedTree.querySelector('#group3');
      const target = group.lastElementChild;
      const spy = jest.spyOn(group.firstElementChild, 'focus');

      const event = {
        preventDefault: () => void 0,
        key: 'ArrowUp',
        target,
      };

      (jsonViewer as any).onTreeKeydown(event as any);

      expect(spy).toHaveBeenCalled();
    });

    it('should focus the last item within the previous group when the up arrow is pressed from a the last child in a group', () => {
      const target = simulatedTree.querySelector('#group3').firstElementChild;
      const spy = jest.spyOn(simulatedTree.querySelector('#group2').lastElementChild, 'focus');
      const event = {
        preventDefault: () => void 0,
        key: 'ArrowUp',
        target,
      };

      (jsonViewer as any).onTreeKeydown(event as any);

      expect(spy).toHaveBeenCalled();
    });

    it('should expand a node when the right arrow is pressed', () => {
      const targetGroup = simulatedTree.querySelector('#group2');
      const groupThatShouldExpand = simulatedTree.querySelector('#group3');
      groupThatShouldExpand.setAttribute('aria-expanded', 'false');
      const target = targetGroup.firstElementChild;

      const event = {
        preventDefault: () => void 0,
        key: 'ArrowRight',
        target,
      };

      const actuator: HTMLDivElement = targetGroup.querySelector('[role="button"]');
      const spy = jest.spyOn(actuator, 'click');
      (jsonViewer as any).onTreeKeydown(event as any);
      expect(spy).toHaveBeenCalled();
    });

    it('should collapse a node whe the left arrow is pressed', () => {
      const targetGroup = simulatedTree.querySelector('#group2');
      const groupThatShouldCollapse = simulatedTree.querySelector('#group3');
      groupThatShouldCollapse.setAttribute('aria-expanded', 'true');

      const target = targetGroup.firstElementChild;

      const event = {
        preventDefault: () => void 0,
        key: 'ArrowLeft',
        target,
      };
      const actuator: HTMLDivElement = targetGroup.querySelector('[role="button"]');
      const spy = jest.spyOn(actuator, 'click');
      (jsonViewer as any).onTreeKeydown(event as any);
      expect(spy).toHaveBeenCalled();
    });
  });
});
