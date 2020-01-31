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

import { CommandServiceImpl, CommandRegistry, CommandServiceInstance } from '@bfemulator/sdk-shared';
import { beginAdd, beginRemove, SharedConstants } from '@bfemulator/app-shared';

import { NotificationCommands } from './notificationCommands';

const mockNotification: any = {};
jest.mock('../utils', () => ({
  getGlobal: () => mockNotification,
}));

const mockDispatch = jest.fn();
jest.mock('../state/store', () => ({
  store: {
    dispatch: action => mockDispatch(action),
  },
}));

describe('The notification commands', () => {
  let commandService: CommandServiceImpl;
  let registry: CommandRegistry;
  const { Notifications } = SharedConstants.Commands;

  beforeAll(() => {
    new NotificationCommands();
    const decorator = CommandServiceInstance();
    const descriptor = decorator({ descriptor: {} }, 'none') as any;
    commandService = descriptor.descriptor.get();
    registry = commandService.registry;
  });

  beforeEach(mockDispatch.mockClear);

  it('should add a notifcation from the main process', () => {
    const command = registry.getCommand(Notifications.Add);
    command();

    expect(mockDispatch).toHaveBeenCalledWith(beginAdd(mockNotification));
  });

  it('should remove a notification', () => {
    const id = 'someId';
    const command = registry.getCommand(Notifications.Remove);
    command(id);

    expect(mockDispatch).toHaveBeenCalledWith(beginRemove(id));
  });
});
