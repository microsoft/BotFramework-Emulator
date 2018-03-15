import { IPC, isObject } from '@bfemulator/sdk-shared';
import * as WebSocket from 'ws';

export class WebSocketIPC extends IPC {
  private _ws: WebSocket;
  private _id: number;
  
  get ws(): WebSocket { return this._ws; }

  get id(): number { return this._id; }
  set id(value: number) { this._id = value; }

  constructor(arg: WebSocket | string = "http://localhost:9091") {
    super();
    if (typeof arg === 'string') {
      this._ws = new WebSocket(arg, { perMessageDeflate: false });
    } else if (arg instanceof WebSocket) {
      this._ws = arg;
    }
    this._ws.on('message', s => {
      const message = JSON.parse(s as string);
      if (isObject(message) && message.type === 'ipc:message' && Array.isArray(message.args)) {
        const channelName = message.args.shift();
        const channel = super.getChannel(channelName);
        if (channel) {
          channel.onMessage(...message.args);
        }
      }
    });
  }

  send(...args: any[]): void {
    const message = {
      type: 'ipc:message',
      args
    };
    const s = JSON.stringify(message);
    this._ws.send(s);
  }
}

export abstract class WebSocketServer {
  private _wss: WebSocket.Server;
  public _on: (ws: WebSocket) => void;

  constructor(port: number = 9091) {
    this._wss = new WebSocket.Server({ port });
    this._wss.on('connection', ws => {
      this.onConnection(ws);
    });
  }

  public abstract onConnection(ws: WebSocket): void;
}
