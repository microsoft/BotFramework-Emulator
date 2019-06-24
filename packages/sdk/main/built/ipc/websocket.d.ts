import { IPC } from '@bfemulator/sdk-shared';
import * as WebSocket from 'ws';
export declare class WebSocketIPC extends IPC {
  private _ws;
  private _id;
  readonly ws: WebSocket;
  id: number;
  constructor(arg?: WebSocket | string);
  send(...args: any[]): void;
}
export declare abstract class WebSocketServer {
  _on: (ws: WebSocket) => void;
  private _wss;
  constructor(port?: number);
  abstract onConnection(ws: WebSocket): void;
}
