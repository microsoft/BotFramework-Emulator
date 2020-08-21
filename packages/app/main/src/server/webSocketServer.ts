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

import { createServer, Next, Request, Response, Server } from 'restify';
import { Server as WSServer } from 'ws';
import { Activity } from 'botframework-schema';

// can't import WebSocket type from ws types :|
interface WebSocket {
  close(): void;
  send(data: any, cb?: (err?: Error) => void): void;
}

export class WebSocketServer {
  public static port: number;
  private static _restServer: Server;
  private static _servers: { [conversationId: string]: WSServer } = {};
  private static _sockets: { [conversationId: string]: WebSocket } = {};
  private static _backedUpMessages: { [conversationId: string]: Activity[] } = {};

  private static sendBackedUpMessages(conversationId: string, socket: WebSocket) {
    do {
      const activity: Activity = this._backedUpMessages[conversationId].shift();
      const payload = { activities: [activity] };
      socket.send(JSON.stringify(payload));
    } while (this._backedUpMessages[conversationId] && this._backedUpMessages[conversationId].length > 0);
  }

  public static getSocketByConversationId(conversationId: string): WebSocket {
    return this._sockets[conversationId];
  }

  public static queueActivities(conversationId: string, activity: Activity): void {
    if (!this._backedUpMessages[conversationId]) {
      this._backedUpMessages[conversationId] = [];
    }
    this._backedUpMessages[conversationId].push(activity);
  }

  public static sendToSubscribers(conversationId: string, activity: Activity): void {
    const socket = this._sockets[conversationId];
    if (socket) {
      const payload = { activities: [activity] };
      this.sendBackedUpMessages(conversationId, socket);
      socket.send(JSON.stringify(payload));
    }
  }

  /** Initializes the server and returns the port it is listening on, or if already initialized,
   *  is a no-op.
   */
  public static async init(): Promise<number | void> {
    if (!this._restServer) {
      this._restServer = createServer({ handleUpgrades: true, name: 'Emulator-WebSocket-Host' });
      this._restServer.get('/ws/:conversationId', (req: Request, res: Response, next: Next) => {
        const conversationId = req.params.conversationId;

        // initialize a new web socket server for each new conversation
        if (conversationId && !this._servers[conversationId]) {
          if (!(res as any).claimUpgrade) {
            return next(new Error('Connection must upgrade for web sockets.'));
          }
          const { head, socket } = (res as any).claimUpgrade();
          const wsServer = new WSServer({
            noServer: true,
          });
          wsServer.on('connection', async (socket, req) => {
            this.sendBackedUpMessages(conversationId, socket);
            this._sockets[conversationId] = socket;

            socket.on('close', (code, reason) => {
              delete this._servers[conversationId];
              delete this._sockets[conversationId];
              delete this._backedUpMessages[conversationId];
            });
          });
          // upgrade the connection to a ws connection
          wsServer.handleUpgrade(req, socket, head, socket => {
            wsServer.emit('connection', socket, req);
          });
          this._servers[conversationId] = wsServer;
        }
      });
      // dynamically generate the web socket server port
      const port = await new Promise<number>((resolve, reject) => {
        this._restServer.once('error', err => reject(err));
        this._restServer.listen(null, () => {
          resolve(this._restServer.address().port);
        });
      });
      this.port = port;
      // eslint-disable-next-line no-console
      console.log(`Web Socket host server listening on ${port}...`);
      return port;
    }
  }

  public static cleanup(): void {
    for (const conversationId in this._sockets) {
      this._sockets[conversationId].close();
    }
    for (const conversationId in this._servers) {
      this._servers[conversationId].close();
    }
    this._restServer.close();
  }
}
