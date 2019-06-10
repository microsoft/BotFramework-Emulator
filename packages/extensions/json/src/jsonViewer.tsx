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
import { WindowHostReceiver } from './windowHostReceiver';
import './index.scss';

const themeNameToViewerThemeName = {
  light,
  dark,
  'high-contrast': highContrast,
};

export interface JsonViewerState {
  data: any;
  themeName: string;
}

export class JsonViewer extends Component<{}, JsonViewerState> {
  private readonly mutationObserver: MutationObserver;
  private jsonViewerRef: HTMLDivElement;

  private static nodesAdded(addedNodes: NodeList): void {
    addedNodes.forEach((node: HTMLElement) => {
      switch (node.tagName) {
        case 'UL':
          node.setAttribute('role', 'group');
          node.setAttribute('aria-expanded', '' + !!node.childNodes.length);
          break;
        // List items nest UL and DIV(button) so we recurse
        case 'LI':
          node.setAttribute('role', 'treeitem');
          node.tabIndex = -1;
          if (node.children.length) {
            JsonViewer.nodesAdded(node.childNodes);
          }
          break;

        case 'DIV':
          node.setAttribute('role', 'button');
          break;

        default:
          break;
      }
    });
  }

  constructor(props: any) {
    super(props);
    new WindowHostReceiver(this);
    this.mutationObserver = new MutationObserver(this.mutationObserverCallback);
  }

  public render() {
    const state = this.state || ({ data: {} } as any);
    const { data, themeName = 'light' } = state;
    return (
      <div ref={this.jsonTreeContainerRef}>
        <JSONTree data={data} theme={themeNameToViewerThemeName[themeName]} invertTheme={false} />
      </div>
    );
  }

  public setData<T = {}>(data: Record<string, T>): void {
    this.setState({ data });
  }

  public setTheme(themeName: string) {
    this.setState({ themeName });
  }

  private jsonTreeContainerRef = (ref: HTMLDivElement): void => {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
    if (this.jsonViewerRef) {
      this.jsonViewerRef.removeEventListener('keydown', this.onTreeKeydown, true);
    }
    if (ref) {
      ref.addEventListener('keydown', this.onTreeKeydown, true);
      this.mutationObserver.observe(ref, { childList: true, subtree: true });
      // <ul>
      ref.firstElementChild.setAttribute('role', 'tree');
      // <ul><li>
      JsonViewer.nodesAdded(ref.firstElementChild.childNodes);
      (ref.firstElementChild as HTMLElement).tabIndex = 0;
    }
    this.jsonViewerRef = ref;
  };

  private mutationObserverCallback = (mutations: MutationRecord[]) => {
    mutations.forEach(mutationRecord => {
      JsonViewer.nodesAdded(mutationRecord.addedNodes);
    });
  };

  private onTreeKeydown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        break;

      case 'ArrowDown':
        this.focusNext(event);
        break;

      case 'ArrowUp':
        this.focusPrevious(event);
        break;

      case 'Tab':
        this.focusGroup(event);
        break;

      // case 'Home':
      //   this.focusHead(event);
      //   break;
      //
      // case 'End':
      //   this.focusTail(event);
      //   break;

      default:
        break;
    }
  };

  private focusNext(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    const role = target.getAttribute('role');

    switch (role) {
      case 'group':
      case 'tree':
        this.focusNextItemFromGroup(target as HTMLUListElement);
        break;

      case 'treeitem':
        this.focusNextItemFromTreeItem(target as HTMLLIElement);
        break;

      default:
        // TODO - determine if this is necessary
        event.preventDefault();
        break;
    }
  }

  private focusPrevious(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    const role = target.getAttribute('role');

    switch (role) {
      case 'group':
        this.focusPreviousItemFromGroup(target as HTMLUListElement);
        break;

      case 'treeitem':
        this.focusPreviousItemFromTreeItem(target as HTMLLIElement);
        break;

      default:
        // TODO - determine if this is necessary
        event.preventDefault();
        break;
    }
  }

  private focusGroup(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    const role = target.getAttribute('role');
    let targetGroupRoot;

    switch (role) {
      case 'group':
        targetGroupRoot = target;
        break;

      case 'treeitem':
        targetGroupRoot = target.parentElement;
        break;

      default:
        break;
    }
    if (!targetGroupRoot) {
      return;
    }
    // Focus previous group
    if (event.shiftKey) {
      if (target.previousElementSibling && target.previousElementSibling.getAttribute('role') === 'group') {
        (target.previousElementSibling as HTMLElement).focus();
      }
    } else if (target.nextElementSibling) {
      (target.nextElementSibling as HTMLElement).focus();
    }
  }

  private focusPreviousItemFromGroup(group: HTMLUListElement): void {
    // Try to move into the previous group
    // and focus it
    if (group.parentElement && group.parentElement.lastElementChild) {
      (group.parentElement.lastElementChild as HTMLElement).focus();
      // Focus the last group instead but
      // only if it is a group.
    } else if (group.parentElement && group.parentElement.getAttribute('role') === 'group') {
      (group.parentElement as HTMLElement).focus();
    }
  }

  private focusPreviousItemFromTreeItem(treeItem: HTMLLIElement): void {
    // focus the previous sibling or find the
    // previous group and focus that.
    if (treeItem.previousElementSibling) {
      // Determine if the previous element has a subgroup
      // and select the last item in it's list if expanded
      // or select the group if not.
      const subGroup = treeItem.previousElementSibling.querySelector('ul[role="group"]') as HTMLUListElement;
      if (subGroup && subGroup.lastElementChild) {
        (subGroup.lastElementChild as HTMLElement).focus();
      } else {
        (treeItem.previousElementSibling as HTMLElement).focus();
      }
    } else {
      // Traverse up the DOM to find a parent with a
      // previous element sibling.
      let parent: HTMLElement = treeItem.parentElement;
      while (parent && parent !== this.jsonViewerRef && parent.tagName !== 'LI') {
        parent = parent.parentElement as HTMLElement;
      }
      if (parent) {
        parent.focus();
      }
    }
  }

  private focusNextItemFromTreeItem(treeItem: HTMLLIElement): void {
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
      while (parent && parent !== this.jsonViewerRef && !parent.nextElementSibling) {
        parent = parent.parentElement as HTMLElement;
      }
      if (parent && parent.nextElementSibling) {
        (parent.nextElementSibling as HTMLElement).focus();
      }
    }
  }

  private focusNextItemFromGroup(group: HTMLUListElement): void {
    // Are we expanded with children?
    if (group.firstElementChild) {
      (group.firstElementChild as HTMLElement).focus();
      // Focus the next group instead
    } else if (group.nextElementSibling) {
      (group.nextElementSibling as HTMLElement).focus();
    }
  }
}
