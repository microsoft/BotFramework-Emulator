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

import { EventEmitter } from "events";

class DebugConnection extends EventEmitter {
  private _connection: any;
  private onmessage: any;
  private onopen: any;
  private onclose: any;

  constructor(connection: any) {
    super();

    this._connection = connection;

    this._connection.onmessage = event => {
      console.info(`WS.recv: ${event.data}`);
      this.emit("message", event);
      if (this.onmessage) {
        this.onmessage(event);
      }
    };

    this._connection.onopen = () => {
      console.info(`WS.open`);
      this.emit("open");
      if (this.onopen) {
        this.onopen();
      }
    };

    this._connection.onclose = () => {
      console.info(`WS.close`);
      this.emit("close");
      if (this.onclose) {
        this.onclose();
      }
    };
  }

  public close() {
    this._connection.close();
  }

  public end() {
    this._connection.end();
  }

  public send(data: any) {
    console.info(`WS.send: ${data}`);
    this._connection.send(data);
  }
}

export default DebugConnection;
