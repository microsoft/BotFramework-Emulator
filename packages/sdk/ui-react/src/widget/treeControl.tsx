
import * as React from 'react';
import { Component } from 'react';

export interface HierarchicalDataProps<T={}, R={}> {
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

  protected constructor(props, context) {
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
  public childrenFunction?: (parent) => Array<T>;
  public childrenField?: PropertyKey;

  private childNodes: Map<any, NodeListDataProvider<T>> = new Map();
  private openNodes: Map<T, NodeListDataProvider<T>> = new Map();

  private changeHandlers = new Map();
  private queuedChanges: Array<{ type: string, change: any }> = [];
  private notifyChangeHandlersLater: boolean;

  static get [Symbol.species]() {
    return Array;
  }

  constructor(source: Array<T>, childrenField?: PropertyKey, childrenFunction?: (parent) => Array<T>) {
    super();
    Object.assign(this, { childrenField, childrenFunction });

    if (source) {
      this.push(...source);
    }
    return new Proxy(this, this as any);
  }

  public addChangeHandler = (handler: (changes) => void): () => void => {
    const { changeHandlers } = this;
    changeHandlers.set(handler, true);

    return function () {
      changeHandlers.delete(handler);
    };
  };

  public getPrototypeOf(): {} {
    return NodeListDataProvider.prototype;
  }

  public removeChangeHandler = (handler: (changes) => void): void => {
    this.changeHandlers.delete(handler);
  };

  public getChildren(parent): NodeListDataProvider<T> {
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

  public openNode(parent): NodeListDataProvider<T> {
    const { openNodes } = this;
    if (openNodes.has(parent)) {
      return openNodes.get(parent);
    }

    const children = this.getChildren(parent);
    openNodes.set(parent, children);
    this.queueNotification('nodeOpened', {parent});
    return children;
  }

  public closeNode(parent):void {

  }

  private internalChangeHandler = (changes: Array<T>) => {
  };

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

  private set(target: Array<T>, prop: PropertyKey, value: ProxyConstructor, receiver: any): Function[] | Function | any {
    target[prop] = value;
    this.queueNotification('nodeAdded', { position: prop, value });
  }
}
