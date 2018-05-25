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

export interface HierarchicalDataProps<T= {}, R= {}> {
  items: IterableIterator<T> | Array<T>;
  dataProvider: NodeListDataProvider<T>;
  getChildren: (parent: any) => Promise<R> | IterableIterator<R>;
  hasChildren: (parent: any) => boolean;
  showRoot: boolean;
}

/**
 * Future themeable tree control.
 */
export abstract class TreeControl<P extends HierarchicalDataProps, S = {}> extends Component<P, S> {
  private roots: Map<any, HTMLElement> = new Map();

  protected constructor(props: P, context: S) {
    super(props, context);
  }

  public render(): JSX.Element {
    return (
      <section>
        { }
      </section>
    );
  }
}

export class NodeListDataProvider<T> extends Array<T> {
  public childrenFunction?: (parent: any) => Array<T>;
  public childrenField?: PropertyKey;

  private childNodes: Map<any, NodeListDataProvider<T>> = new Map();
  private openNodes: Map<T, NodeListDataProvider<T>> = new Map();

  private changeHandlers = new Map();
  private queuedChanges: Array<{ type: string, change: any }> = [];
  private notifyChangeHandlersLater: boolean;

  static get [Symbol.species]() {
    return Array;
  }

  constructor(source: Array<T>, childrenField?: PropertyKey, childrenFunction?: (parent: any) => Array<T>) {
    super();
    Object.assign(this, { childrenField, childrenFunction });

    if (source) {
      this.push(...source);
    }
    return new Proxy(this, this as any);
  }

  public addChangeHandler = (handler: (changes: any) => void): () => void => {
    const { changeHandlers } = this;
    changeHandlers.set(handler, true);

    return function () {
      changeHandlers.delete(handler);
    };
  }

  public getPrototypeOf(): {} {
    return NodeListDataProvider.prototype;
  }

  public removeChangeHandler = (handler: (changes: any) => void): void => {
    this.changeHandlers.delete(handler);
  }

  public getChildren(parent: any): NodeListDataProvider<T> {
    const { childNodes } = this;
    if (childNodes.has(parent)) {
      return childNodes.get(parent);
    }
    const { childrenField, childrenFunction } = this;
    let children: Array<T> = [];
    if (childrenFunction) {
      children = childrenFunction(parent);
    }
    if (childrenField) {
      children = parent[childrenField];
    }
    const provider = new NodeListDataProvider(children, childrenField, childrenFunction);
    childNodes[parent] = provider;

    return provider;
  }

  public openNode(parent: any): NodeListDataProvider<T> {
    const { openNodes } = this;
    if (openNodes.has(parent)) {
      return openNodes.get(parent);
    }

    const children = this.getChildren(parent);
    openNodes.set(parent, children);
    this.queueNotification('nodeOpened', {parent});
    return children;
  }

  public closeNode(parent: any): void {
    return null;
  }

  private internalChangeHandler = (changes: Array<T>) => {
    return null;
  }

  private queueNotification(type: string, change: any): void {
    this.queuedChanges.push({ type, change });
    if (this.notifyChangeHandlersLater) {
      return;
    }
    this.notifyChangeHandlersLater = true;
    requestAnimationFrame(() => {
      this.notifyChangeHandlersLater = false;
      const changes = this.queuedChanges.slice();
      this.queuedChanges.length = 0;

      this.changeHandlers.forEach(callback => {
        callback(changes);
      });
    });
  }

  private set(target: Array<T>, prop: PropertyKey, value: ProxyConstructor, receiver: any)
    : Function[] | Function | any {
    target[prop] = value;
    this.queueNotification('nodeAdded', { position: prop, value });
  }
}
