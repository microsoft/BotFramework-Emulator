import { ISender } from "./sender";
import { IDisposable } from "../../base/lifecycle/disposable";

export interface Listener {
  (...args: any[]);
}

export class Channel {

  private _listeners: { [id: string]: Listener } = {};

  get name(): string { return this._name; }

  constructor(private _name: string, private _sender: ISender) {
  }

  send(messageName: string, ...args: any[]): any {
    return this._sender.send(this._name, messageName, ...args);
  }

  setListener(messageName: string, listener: Listener): IDisposable {
    this.clearListener(messageName);
    this._listeners[messageName] = listener;
    return {
      dispose() {
        this.clearListener(messageName);
      }
    }
  }

  clearListener(messageName: string) {
    delete this._listeners[messageName];
  }

  onMessage(...args: any[]): any {
    const messageName = args.shift();
    const listener = this._listeners[messageName];
    if (listener) {
      listener(...args);
    }
  }
}
