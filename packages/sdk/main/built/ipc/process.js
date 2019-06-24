'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true,
});
exports.ProcessIPC = void 0;

var _sdkShared = require('@bfemulator/sdk-shared');

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
class ProcessIPC extends _sdkShared.IPC {
  get id() {
    return this._process.pid;
  }

  constructor(_process) {
    super();
    this._process = _process;

    this._process.on('message', message => {
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
    if (this._process.send) {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      this._process.send({
        type: 'ipc:message',
        args,
      });
    }
  }
}

exports.ProcessIPC = ProcessIPC;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pcGMvcHJvY2Vzcy50cyJdLCJuYW1lcyI6WyJQcm9jZXNzSVBDIiwiSVBDIiwiaWQiLCJfcHJvY2VzcyIsInBpZCIsImNvbnN0cnVjdG9yIiwib24iLCJtZXNzYWdlIiwidHlwZSIsIkFycmF5IiwiaXNBcnJheSIsImFyZ3MiLCJjaGFubmVsTmFtZSIsInNoaWZ0IiwiY2hhbm5lbCIsImdldENoYW5uZWwiLCJvbk1lc3NhZ2UiLCJzZW5kIl0sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBaUNBOztBQWpDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBV08sTUFBTUEsVUFBTixTQUF5QkMsY0FBekIsQ0FBNkI7QUFDbEMsTUFBSUMsRUFBSixHQUFpQjtBQUNmLFdBQU8sS0FBS0MsUUFBTCxDQUFjQyxHQUFyQjtBQUNEOztBQUVEQyxFQUFBQSxXQUFXLENBQVNGLFFBQVQsRUFBNEI7QUFDckM7QUFEcUM7O0FBRXJDLFNBQUtBLFFBQUwsQ0FBY0csRUFBZCxDQUFpQixTQUFqQixFQUE0QkMsT0FBTyxJQUFJO0FBQ3JDLFVBQUkseUJBQVNBLE9BQVQsS0FBcUJBLE9BQU8sQ0FBQ0MsSUFBUixLQUFpQixhQUF0QyxJQUF1REMsS0FBSyxDQUFDQyxPQUFOLENBQWNILE9BQU8sQ0FBQ0ksSUFBdEIsQ0FBM0QsRUFBd0Y7QUFDdEYsY0FBTUMsV0FBVyxHQUFHTCxPQUFPLENBQUNJLElBQVIsQ0FBYUUsS0FBYixFQUFwQjtBQUNBLGNBQU1DLE9BQU8sR0FBRyxNQUFNQyxVQUFOLENBQWlCSCxXQUFqQixDQUFoQjs7QUFDQSxZQUFJRSxPQUFKLEVBQWE7QUFDWEEsVUFBQUEsT0FBTyxDQUFDRSxTQUFSLENBQWtCLEdBQUdULE9BQU8sQ0FBQ0ksSUFBN0I7QUFDRDtBQUNGO0FBQ0YsS0FSRDtBQVNEOztBQUVNTSxFQUFBQSxJQUFQLEdBQWtDO0FBQ2hDLFFBQUksS0FBS2QsUUFBTCxDQUFjYyxJQUFsQixFQUF3QjtBQUFBLHdDQURYTixJQUNXO0FBRFhBLFFBQUFBLElBQ1c7QUFBQTs7QUFDdEIsV0FBS1IsUUFBTCxDQUFjYyxJQUFkLENBQW1CO0FBQ2pCVCxRQUFBQSxJQUFJLEVBQUUsYUFEVztBQUVqQkcsUUFBQUE7QUFGaUIsT0FBbkI7QUFJRDtBQUNGOztBQXpCaUMiLCJzb3VyY2VzQ29udGVudCI6WyIvL1xyXG4vLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdC4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxyXG4vL1xyXG4vLyBNaWNyb3NvZnQgQm90IEZyYW1ld29yazogaHR0cDovL2JvdGZyYW1ld29yay5jb21cclxuLy9cclxuLy8gQm90IEZyYW1ld29yayBFbXVsYXRvciBHaXRodWI6XHJcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvQm90RnJhbXdvcmstRW11bGF0b3JcclxuLy9cclxuLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb25cclxuLy8gQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuLy9cclxuLy8gTUlUIExpY2Vuc2U6XHJcbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZ1xyXG4vLyBhIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcclxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXHJcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcclxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvXHJcbi8vIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0b1xyXG4vLyB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XHJcbi8vXHJcbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlXHJcbi8vIGluY2x1ZGVkIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxyXG4vL1xyXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJcIkFTIElTXCJcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCxcclxuLy8gRVhQUkVTUyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXHJcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EXHJcbi8vIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkVcclxuLy8gTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTlxyXG4vLyBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT05cclxuLy8gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXHJcbi8vXHJcblxyXG5pbXBvcnQgeyBJUEMsIGlzT2JqZWN0IH0gZnJvbSAnQGJmZW11bGF0b3Ivc2RrLXNoYXJlZCc7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFByb2Nlc3Mge1xyXG4gIHBpZDogbnVtYmVyO1xyXG4gIHNlbmQ/KG1lc3NhZ2U6IGFueSk7XHJcbiAgb24oZXZlbnQ6ICdtZXNzYWdlJywgbGlzdGVuZXI6IE5vZGVKUy5NZXNzYWdlTGlzdGVuZXIpO1xyXG4gIG9uKGV2ZW50OiAnZXhpdCcsIGxpc3RlbmVyOiBOb2RlSlMuRXhpdExpc3RlbmVyKTtcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIFByb2Nlc3NJUEMgZXh0ZW5kcyBJUEMge1xyXG4gIGdldCBpZCgpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuIHRoaXMuX3Byb2Nlc3MucGlkO1xyXG4gIH1cclxuXHJcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfcHJvY2VzczogUHJvY2Vzcykge1xyXG4gICAgc3VwZXIoKTtcclxuICAgIHRoaXMuX3Byb2Nlc3Mub24oJ21lc3NhZ2UnLCBtZXNzYWdlID0+IHtcclxuICAgICAgaWYgKGlzT2JqZWN0KG1lc3NhZ2UpICYmIG1lc3NhZ2UudHlwZSA9PT0gJ2lwYzptZXNzYWdlJyAmJiBBcnJheS5pc0FycmF5KG1lc3NhZ2UuYXJncykpIHtcclxuICAgICAgICBjb25zdCBjaGFubmVsTmFtZSA9IG1lc3NhZ2UuYXJncy5zaGlmdCgpO1xyXG4gICAgICAgIGNvbnN0IGNoYW5uZWwgPSBzdXBlci5nZXRDaGFubmVsKGNoYW5uZWxOYW1lKTtcclxuICAgICAgICBpZiAoY2hhbm5lbCkge1xyXG4gICAgICAgICAgY2hhbm5lbC5vbk1lc3NhZ2UoLi4ubWVzc2FnZS5hcmdzKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHVibGljIHNlbmQoLi4uYXJnczogYW55W10pOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLl9wcm9jZXNzLnNlbmQpIHtcclxuICAgICAgdGhpcy5fcHJvY2Vzcy5zZW5kKHtcclxuICAgICAgICB0eXBlOiAnaXBjOm1lc3NhZ2UnLFxyXG4gICAgICAgIGFyZ3MsXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iXX0=
