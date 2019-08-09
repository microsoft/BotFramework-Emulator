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

import { forwardToMain } from './forwardToMain';

const mockIpcRenderer = {
  sendSync: jest.fn(() => null),
};
jest.mock('electron', () => ({
  get ipcRenderer() {
    return mockIpcRenderer;
  },
}));

describe('forwardToMain middleware', () => {
  beforeEach(() => {
    mockIpcRenderer.sendSync.mockClear();
  });

  it('should skip to the next middleware if the action is not FSA compliant', () => {
    const mockNext = jest.fn();
    const mockAction: any = {};
    forwardToMain(null)(mockNext)(mockAction);

    expect(mockNext).toHaveBeenCalledWith(mockAction);
    expect(mockIpcRenderer.sendSync).not.toHaveBeenCalled();
  });

  it('should skip to the next middleware if the action is flagged to not be forwarded', () => {
    const mockNext = jest.fn();
    const mockAction: any = {
      type: 'actionType',
      meta: { doNotForward: true },
    };
    forwardToMain(null)(mockNext)(mockAction);

    expect(mockNext).toHaveBeenCalledWith(mockAction);
    expect(mockIpcRenderer.sendSync).not.toHaveBeenCalled();
  });

  it('should forward the redux action to the main process and call the next middleware', () => {
    const mockNext = jest.fn();
    const mockAction: any = {
      type: 'actionType',
      payload: { someProp: 123 },
    };
    forwardToMain(null)(mockNext)(mockAction);

    expect(mockNext).toHaveBeenCalledWith(mockAction);
    expect(mockIpcRenderer.sendSync).toHaveBeenCalledWith('sync-store', mockAction);
  });
});
