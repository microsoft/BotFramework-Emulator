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
import { Component } from 'react';
import JSONTree from 'react-json-tree';

import light from './themes/light';
import dark from './themes/dark';
import highContrast from './themes/highContrast';
import * as styles from './collapsibleJsonViewer.scss';

const themeNameToViewerThemeName = {
  light,
  dark,
  'high-contrast': highContrast,
};

export interface CollapsibleJsonViewerProps<T = any> {
  nodeAdded?: (node: HTMLElement) => void;
  data: Record<string, T>;
  themeName: string;

  [jsonTreePropName: string]: any;
}

export class CollapsibleJsonViewer extends Component<CollapsibleJsonViewerProps, {}> {
  private readonly mutationObserver: MutationObserver;
  private jsonViewerElement: HTMLDivElement;

  private nodesAdded(addedNodes: NodeList): void {
    addedNodes.forEach((node: HTMLElement) => {
      switch (node.tagName) {
        case 'UL':
          node.setAttribute('role', 'group');
          node.setAttribute('aria-expanded', '' + !!node.childNodes.length);
          if (node.children.length) {
            this.nodesAdded(node.childNodes);
          }
          break;
        // List items nest UL and DIV(button) so we recurse
        case 'LI':
          node.setAttribute('role', 'treeitem');
          // If we have a nested <ul>, this is a node and
          // should have a tab index
          if (node.querySelector('ul')) {
            node.tabIndex = 0;
            node.setAttribute('aria-expanded', 'false');
          } else {
            node.tabIndex = -1;
          }
          if (node.children.length) {
            this.nodesAdded(node.childNodes);
          }
          if (node.parentElement.getAttribute('aria-expanded') === 'false') {
            node.parentElement.setAttribute('aria-expanded', 'true');
          }
          if (node.parentElement.getAttribute('role') === 'tree') {
            node.setAttribute('aria-expanded', 'true');
          }
          break;

        case 'DIV':
          node.setAttribute('role', 'button');
          break;

        default:
          break;
      }
      if (this.props.nodeAdded) {
        this.props.nodeAdded(node);
      }
    });
  }

  constructor(props: any) {
    super(props);
    this.mutationObserver = new MutationObserver(this.mutationObserverCallback);
  }

  public render() {
    const props = this.props || ({ data: {} } as any);
    const { data, themeName = 'light', nodeAdded: _, ...jsonTreeProps } = props;
    // Props are a pass through and are
    // allowed to overwrite the ones set here
    return (
      <div ref={this.jsonTreeContainerRef} className={styles.collapsibleJsonViewer}>
        <JSONTree data={data} theme={themeNameToViewerThemeName[themeName]} invertTheme={false} {...jsonTreeProps} />
      </div>
    );
  }

  private jsonTreeContainerRef = (ref: HTMLDivElement): void => {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
    if (this.jsonViewerElement) {
      this.jsonViewerElement.removeEventListener('keydown', this.onTreeKeydown, true);
      this.jsonViewerElement.removeEventListener('click', this.onTreeClick);
    }
    if (ref) {
      ref.addEventListener('keydown', this.onTreeKeydown, true);
      ref.addEventListener('click', this.onTreeClick);
      this.mutationObserver.observe(ref, { childList: true, subtree: true });
      // <ul>
      ref.firstElementChild.setAttribute('role', 'tree');
      // <ul><li>
      this.nodesAdded(ref.firstElementChild.childNodes);
    }
    this.jsonViewerElement = ref;
  };

  private mutationObserverCallback = (mutations: MutationRecord[]) => {
    mutations.forEach(mutationRecord => {
      this.nodesAdded(mutationRecord.addedNodes);
    });
  };

  private onTreeKeydown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowRight':
        this.expandOrCollapseSubtree(event, true);
        break;

      case 'ArrowLeft':
        this.expandOrCollapseSubtree(event, false);
        break;

      case 'ArrowDown':
        this.focusNext(event);
        break;

      case 'ArrowUp':
        this.focusPrevious(event);
        break;

      default:
        break;
    }
  };

  private onTreeClick = (event: MouseEvent): void => {
    let target = event.target as HTMLElement;
    const { parentElement } = target;

    if (target.getAttribute('role') !== 'button' && !parentElement && parentElement.getAttribute('role') !== 'button') {
      return;
    }

    while (target.tagName !== 'LI' && target !== this.jsonViewerElement) {
      target = target.parentElement;
    }
    const ul = target.querySelector('ul');
    if (!ul) {
      return;
    }
    const proposedAriaExpandedValue = !(ul.getAttribute('aria-expanded') === 'true');
    ul.setAttribute('aria-expanded', proposedAriaExpandedValue.toString());
    target.setAttribute('aria-expanded', proposedAriaExpandedValue.toString());
  };

  private focusNext(event: KeyboardEvent): void {
    event.preventDefault();
    const treeItem = event.target as HTMLElement;

    // Tree items may contain nested groups.
    const subGroup = treeItem.querySelector('ul[role="group"]') as HTMLUListElement;
    // Focus the first item in a subgroup if present
    if (subGroup && subGroup.childNodes.length) {
      (subGroup.firstElementChild as HTMLLIElement).focus();
    }
    // If we have siblings, focus the next one.
    // Otherwise, jump out of the tree item and
    // focus the next group.
    else if (treeItem.nextElementSibling) {
      (treeItem.nextElementSibling as HTMLElement).focus();
    } else {
      let parent: HTMLElement = treeItem.parentElement;
      while (parent && parent !== this.jsonViewerElement && !parent.nextElementSibling) {
        parent = parent.parentElement as HTMLElement;
      }
      if (parent && parent.nextElementSibling) {
        (parent.nextElementSibling as HTMLElement).focus();
      }
    }
  }

  private focusPrevious(event: KeyboardEvent): void {
    event.preventDefault();
    const treeItem = event.target as HTMLElement;

    // focus the previous sibling or find the
    // previous group and focus that.
    if (treeItem.previousElementSibling) {
      this.focusLastSubgroupOrLastItem(treeItem.previousElementSibling);
    } else {
      // Traverse up the DOM to find a parent with a
      // previous element sibling.
      let parent: HTMLElement = treeItem.parentElement;
      while (parent && parent !== this.jsonViewerElement && parent.tagName !== 'LI') {
        parent = parent.parentElement as HTMLElement;
      }
      if (parent) {
        parent.focus();
      }
    }
  }

  private focusLastSubgroupOrLastItem(element: Element): void {
    const subGroup = element.querySelector('ul[role="group"]');
    if (subGroup && subGroup.lastElementChild) {
      return this.focusLastSubgroupOrLastItem(subGroup.lastElementChild);
    }
    (element as HTMLElement).focus();
  }

  private expandOrCollapseSubtree(event: KeyboardEvent, expand: boolean): void {
    event.preventDefault();
    const target = event.target as HTMLElement;
    const role = target.getAttribute('role');
    const ul = target.querySelector('ul');
    if (role !== 'treeitem' || !ul) {
      return;
    }
    const proposedAriaExpandedValue = expand.toString();
    if (ul.getAttribute('aria-expanded') === proposedAriaExpandedValue) {
      return;
    }
    const actuator: HTMLDivElement = target.querySelector('[role="button"]');
    actuator.click();
  }
}
