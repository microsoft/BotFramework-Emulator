'use strict';

var _interopRequireWildcard = require('@babel/runtime/helpers/interopRequireWildcard');

var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault');

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.WebSocketServer = exports.WebSocketIPC = void 0;

var _defineProperty2 = _interopRequireDefault(require('@babel/runtime/helpers/defineProperty'));

var _sdkShared = require('@bfemulator/sdk-shared');

var WebSocket = _interopRequireWildcard(require('ws'));

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
class WebSocketIPC extends _sdkShared.IPC {
  get ws() {
    return this._ws;
  }

  get id() {
    return this._id;
  }

  set id(value) {
    this._id = value;
  }

  constructor() {
    let arg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'http://localhost:9091';
    super();
    (0, _defineProperty2.default)(this, '_ws', void 0);
    (0, _defineProperty2.default)(this, '_id', void 0);

    if (typeof arg === 'string') {
      this._ws = new WebSocket(arg, {
        perMessageDeflate: false,
      });
    } else if (arg instanceof WebSocket) {
      this._ws = arg;
    }

    this._ws.on('message', s => {
      const message = JSON.parse(s);

      if ((0, _sdkShared.isObject)(message) && message.type === 'ipc:message' && Array.isArray(message.args)) {
        const channelName = message.args.shift();
        const channel = super.getChannel(channelName);

        if (channel) {
          channel.onMessage(...message.args);
        }
      }
    });
  }

  send() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    const message = {
      type: 'ipc:message',
      args,
    };
    const s = JSON.stringify(message);

    this._ws.send(s);
  }
}

exports.WebSocketIPC = WebSocketIPC;

class WebSocketServer {
  constructor() {
    let port = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 9091;
    (0, _defineProperty2.default)(this, '_on', void 0);
    (0, _defineProperty2.default)(this, '_wss', void 0);
    this._wss = new WebSocket.Server({
      port,
    });

    this._wss.on('connection', ws => {
      this.onConnection(ws);
    });
  }
}

exports.WebSocketServer = WebSocketServer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pcGMvd2Vic29ja2V0LnRzIl0sIm5hbWVzIjpbIldlYlNvY2tldElQQyIsIklQQyIsIndzIiwiX3dzIiwiaWQiLCJfaWQiLCJ2YWx1ZSIsImNvbnN0cnVjdG9yIiwiYXJnIiwiV2ViU29ja2V0IiwicGVyTWVzc2FnZURlZmxhdGUiLCJvbiIsInMiLCJtZXNzYWdlIiwiSlNPTiIsInBhcnNlIiwidHlwZSIsIkFycmF5IiwiaXNBcnJheSIsImFyZ3MiLCJjaGFubmVsTmFtZSIsInNoaWZ0IiwiY2hhbm5lbCIsImdldENoYW5uZWwiLCJvbk1lc3NhZ2UiLCJzZW5kIiwic3RyaW5naWZ5IiwiV2ViU29ja2V0U2VydmVyIiwicG9ydCIsIl93c3MiLCJTZXJ2ZXIiLCJvbkNvbm5lY3Rpb24iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7QUFpQ0E7O0FBQ0E7O0FBbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFLTyxNQUFNQSxZQUFOLFNBQTJCQyxjQUEzQixDQUErQjtBQUlwQyxNQUFJQyxFQUFKLEdBQW9CO0FBQ2xCLFdBQU8sS0FBS0MsR0FBWjtBQUNEOztBQUVELE1BQUlDLEVBQUosR0FBaUI7QUFDZixXQUFPLEtBQUtDLEdBQVo7QUFDRDs7QUFDRCxNQUFJRCxFQUFKLENBQU9FLEtBQVAsRUFBc0I7QUFDcEIsU0FBS0QsR0FBTCxHQUFXQyxLQUFYO0FBQ0Q7O0FBRURDLEVBQUFBLFdBQVcsR0FBb0Q7QUFBQSxRQUFuREMsR0FBbUQsdUVBQXpCLHVCQUF5QjtBQUM3RDtBQUQ2RDtBQUFBOztBQUU3RCxRQUFJLE9BQU9BLEdBQVAsS0FBZSxRQUFuQixFQUE2QjtBQUMzQixXQUFLTCxHQUFMLEdBQVcsSUFBSU0sU0FBSixDQUFjRCxHQUFkLEVBQW1CO0FBQUVFLFFBQUFBLGlCQUFpQixFQUFFO0FBQXJCLE9BQW5CLENBQVg7QUFDRCxLQUZELE1BRU8sSUFBSUYsR0FBRyxZQUFZQyxTQUFuQixFQUE4QjtBQUNuQyxXQUFLTixHQUFMLEdBQVdLLEdBQVg7QUFDRDs7QUFDRCxTQUFLTCxHQUFMLENBQVNRLEVBQVQsQ0FBWSxTQUFaLEVBQXVCQyxDQUFDLElBQUk7QUFDMUIsWUFBTUMsT0FBTyxHQUFHQyxJQUFJLENBQUNDLEtBQUwsQ0FBV0gsQ0FBWCxDQUFoQjs7QUFDQSxVQUFJLHlCQUFTQyxPQUFULEtBQXFCQSxPQUFPLENBQUNHLElBQVIsS0FBaUIsYUFBdEMsSUFBdURDLEtBQUssQ0FBQ0MsT0FBTixDQUFjTCxPQUFPLENBQUNNLElBQXRCLENBQTNELEVBQXdGO0FBQ3RGLGNBQU1DLFdBQVcsR0FBR1AsT0FBTyxDQUFDTSxJQUFSLENBQWFFLEtBQWIsRUFBcEI7QUFDQSxjQUFNQyxPQUFPLEdBQUcsTUFBTUMsVUFBTixDQUFpQkgsV0FBakIsQ0FBaEI7O0FBQ0EsWUFBSUUsT0FBSixFQUFhO0FBQ1hBLFVBQUFBLE9BQU8sQ0FBQ0UsU0FBUixDQUFrQixHQUFHWCxPQUFPLENBQUNNLElBQTdCO0FBQ0Q7QUFDRjtBQUNGLEtBVEQ7QUFVRDs7QUFFTU0sRUFBQUEsSUFBUCxHQUFrQztBQUFBLHNDQUFuQk4sSUFBbUI7QUFBbkJBLE1BQUFBLElBQW1CO0FBQUE7O0FBQ2hDLFVBQU1OLE9BQU8sR0FBRztBQUNkRyxNQUFBQSxJQUFJLEVBQUUsYUFEUTtBQUVkRyxNQUFBQTtBQUZjLEtBQWhCO0FBSUEsVUFBTVAsQ0FBQyxHQUFHRSxJQUFJLENBQUNZLFNBQUwsQ0FBZWIsT0FBZixDQUFWOztBQUNBLFNBQUtWLEdBQUwsQ0FBU3NCLElBQVQsQ0FBY2IsQ0FBZDtBQUNEOztBQXpDbUM7Ozs7QUE0Qy9CLE1BQWVlLGVBQWYsQ0FBK0I7QUFJcENwQixFQUFBQSxXQUFXLEdBQXNCO0FBQUEsUUFBckJxQixJQUFxQix1RUFBTixJQUFNO0FBQUE7QUFBQTtBQUMvQixTQUFLQyxJQUFMLEdBQVksSUFBSXBCLFNBQVMsQ0FBQ3FCLE1BQWQsQ0FBcUI7QUFBRUYsTUFBQUE7QUFBRixLQUFyQixDQUFaOztBQUNBLFNBQUtDLElBQUwsQ0FBVWxCLEVBQVYsQ0FBYSxZQUFiLEVBQTJCVCxFQUFFLElBQUk7QUFDL0IsV0FBSzZCLFlBQUwsQ0FBa0I3QixFQUFsQjtBQUNELEtBRkQ7QUFHRDs7QUFUbUMiLCJzb3VyY2VzQ29udGVudCI6WyIvL1xyXG4vLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdC4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxyXG4vL1xyXG4vLyBNaWNyb3NvZnQgQm90IEZyYW1ld29yazogaHR0cDovL2JvdGZyYW1ld29yay5jb21cclxuLy9cclxuLy8gQm90IEZyYW1ld29yayBFbXVsYXRvciBHaXRodWI6XHJcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvQm90RnJhbXdvcmstRW11bGF0b3JcclxuLy9cclxuLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb25cclxuLy8gQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuLy9cclxuLy8gTUlUIExpY2Vuc2U6XHJcbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZ1xyXG4vLyBhIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcclxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXHJcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcclxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvXHJcbi8vIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0b1xyXG4vLyB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XHJcbi8vXHJcbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlXHJcbi8vIGluY2x1ZGVkIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxyXG4vL1xyXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJcIkFTIElTXCJcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCxcclxuLy8gRVhQUkVTUyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXHJcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EXHJcbi8vIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkVcclxuLy8gTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTlxyXG4vLyBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT05cclxuLy8gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXHJcbi8vXHJcblxyXG5pbXBvcnQgeyBJUEMsIGlzT2JqZWN0IH0gZnJvbSAnQGJmZW11bGF0b3Ivc2RrLXNoYXJlZCc7XHJcbmltcG9ydCAqIGFzIFdlYlNvY2tldCBmcm9tICd3cyc7XHJcblxyXG5leHBvcnQgY2xhc3MgV2ViU29ja2V0SVBDIGV4dGVuZHMgSVBDIHtcclxuICBwcml2YXRlIF93czogV2ViU29ja2V0O1xyXG4gIHByaXZhdGUgX2lkOiBudW1iZXI7XHJcblxyXG4gIGdldCB3cygpOiBXZWJTb2NrZXQge1xyXG4gICAgcmV0dXJuIHRoaXMuX3dzO1xyXG4gIH1cclxuXHJcbiAgZ2V0IGlkKCk6IG51bWJlciB7XHJcbiAgICByZXR1cm4gdGhpcy5faWQ7XHJcbiAgfVxyXG4gIHNldCBpZCh2YWx1ZTogbnVtYmVyKSB7XHJcbiAgICB0aGlzLl9pZCA9IHZhbHVlO1xyXG4gIH1cclxuXHJcbiAgY29uc3RydWN0b3IoYXJnOiBXZWJTb2NrZXQgfCBzdHJpbmcgPSAnaHR0cDovL2xvY2FsaG9zdDo5MDkxJykge1xyXG4gICAgc3VwZXIoKTtcclxuICAgIGlmICh0eXBlb2YgYXJnID09PSAnc3RyaW5nJykge1xyXG4gICAgICB0aGlzLl93cyA9IG5ldyBXZWJTb2NrZXQoYXJnLCB7IHBlck1lc3NhZ2VEZWZsYXRlOiBmYWxzZSB9KTtcclxuICAgIH0gZWxzZSBpZiAoYXJnIGluc3RhbmNlb2YgV2ViU29ja2V0KSB7XHJcbiAgICAgIHRoaXMuX3dzID0gYXJnO1xyXG4gICAgfVxyXG4gICAgdGhpcy5fd3Mub24oJ21lc3NhZ2UnLCBzID0+IHtcclxuICAgICAgY29uc3QgbWVzc2FnZSA9IEpTT04ucGFyc2UocyBhcyBzdHJpbmcpO1xyXG4gICAgICBpZiAoaXNPYmplY3QobWVzc2FnZSkgJiYgbWVzc2FnZS50eXBlID09PSAnaXBjOm1lc3NhZ2UnICYmIEFycmF5LmlzQXJyYXkobWVzc2FnZS5hcmdzKSkge1xyXG4gICAgICAgIGNvbnN0IGNoYW5uZWxOYW1lID0gbWVzc2FnZS5hcmdzLnNoaWZ0KCk7XHJcbiAgICAgICAgY29uc3QgY2hhbm5lbCA9IHN1cGVyLmdldENoYW5uZWwoY2hhbm5lbE5hbWUpO1xyXG4gICAgICAgIGlmIChjaGFubmVsKSB7XHJcbiAgICAgICAgICBjaGFubmVsLm9uTWVzc2FnZSguLi5tZXNzYWdlLmFyZ3MpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBwdWJsaWMgc2VuZCguLi5hcmdzOiBhbnlbXSk6IHZvaWQge1xyXG4gICAgY29uc3QgbWVzc2FnZSA9IHtcclxuICAgICAgdHlwZTogJ2lwYzptZXNzYWdlJyxcclxuICAgICAgYXJncyxcclxuICAgIH07XHJcbiAgICBjb25zdCBzID0gSlNPTi5zdHJpbmdpZnkobWVzc2FnZSk7XHJcbiAgICB0aGlzLl93cy5zZW5kKHMpO1xyXG4gIH1cclxufVxyXG5cclxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIFdlYlNvY2tldFNlcnZlciB7XHJcbiAgcHVibGljIF9vbjogKHdzOiBXZWJTb2NrZXQpID0+IHZvaWQ7XHJcbiAgcHJpdmF0ZSBfd3NzOiBXZWJTb2NrZXQuU2VydmVyO1xyXG5cclxuICBjb25zdHJ1Y3Rvcihwb3J0OiBudW1iZXIgPSA5MDkxKSB7XHJcbiAgICB0aGlzLl93c3MgPSBuZXcgV2ViU29ja2V0LlNlcnZlcih7IHBvcnQgfSk7XHJcbiAgICB0aGlzLl93c3Mub24oJ2Nvbm5lY3Rpb24nLCB3cyA9PiB7XHJcbiAgICAgIHRoaXMub25Db25uZWN0aW9uKHdzKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIGFic3RyYWN0IG9uQ29ubmVjdGlvbih3czogV2ViU29ja2V0KTogdm9pZDtcclxufVxyXG4iXX0=
