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
import { addDocPendingChange, addFile, clear, removeFile, SharedConstants } from '@bfemulator/app-shared';

import { FileCommands } from './fileCommands';

const mockDispatch = jest.fn();
jest.mock('../state/store', () => ({
  store: {
    dispatch: action => mockDispatch(action),
  },
}));

describe('The file commands', () => {
  let commandService: CommandServiceImpl;
  let registry: CommandRegistry;
  const { File } = SharedConstants.Commands;

  beforeAll(() => {
    new FileCommands();
    const decorator = CommandServiceInstance();
    const descriptor = decorator({ descriptor: {} }, 'none') as any;
    commandService = descriptor.descriptor.get();
    registry = commandService.registry;
  });

  beforeEach(mockDispatch.mockClear);

  it('should add a file to the store', () => {
    const payload: any = {
      type: 'leaf',
      name: 'somefile.txt',
      path: 'dir/somefile.txt',
    };
    const command = registry.getCommand(File.Add);
    command(payload);

    expect(mockDispatch).toHaveBeenCalledWith(addFile(payload));
  });

  it('should remove a file from the store', () => {
    const payload: any = {
      type: 'leaf',
      name: 'somefile.txt',
      path: 'dir/somefile.txt',
    };
    const command = registry.getCommand(File.Remove);
    command(payload);

    expect(mockDispatch).toHaveBeenCalledWith(removeFile(payload));
  });

  it('should clear the file store', () => {
    const command = registry.getCommand(File.Clear);
    command();

    expect(mockDispatch).toHaveBeenCalledWith(clear());
  });

  it('should mark a file as changed (.chat file)', () => {
    const filename = 'my-file.chat';
    const command = registry.getCommand(File.Changed);
    command(filename);

    expect(mockDispatch).toHaveBeenCalledWith(addDocPendingChange(filename));
  });

  it('should mark a file as changed (.transcript file)', () => {
    const filename = 'my-file.transcript';
    const command = registry.getCommand(File.Changed);
    command(filename);

    expect(mockDispatch).toHaveBeenCalledWith(addDocPendingChange(filename));
  });
});
