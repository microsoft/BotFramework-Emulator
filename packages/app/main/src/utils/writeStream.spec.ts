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
import * as fs from 'fs';

import { writeStream as writeStreamAsync, FileWriteStream } from './writeStream';

// eslint-disable-next-line typescript/no-unused-vars
let fileMock = '';

jest.mock('fs', () => ({
  createWriteStream: () => ({
    write: content => {
      fileMock += content;
    },
    end: () => {
      fileMock = '';
    },
  }),
}));

beforeEach(() => {
  fileMock = '';
});

describe('writing content file in chunks', () => {
  it('should write to file multiple chunks of content', () => {
    const pathToFile = '/Documents/BorFramework-Emulator/logger.txt';
    const createStreamSpy = jest.spyOn((fs as any).default, 'createWriteStream');
    const wsInstance: FileWriteStream = writeStreamAsync(pathToFile);
    const writeSpy = jest.spyOn(createStreamSpy.mock.results[0].value, 'write');
    wsInstance.write('test', false);
    wsInstance.write('test', false);
    wsInstance.write('test', true);
    wsInstance.end();
    expect(createStreamSpy).toHaveBeenCalledTimes(1);
    expect(writeSpy).toHaveBeenCalledTimes(3);
    expect(writeSpy).toHaveBeenLastCalledWith('test\n');
    expect(writeSpy).toHaveBeenNthCalledWith(1, 'test');
    createStreamSpy.mockClear();
  });

  it('should call end on the stream', () => {
    const pathToFile = '/Documents/BorFramework-Emulator/logger.txt';
    const createStreamSpy = jest.spyOn((fs as any).default, 'createWriteStream');
    const wsInstance: FileWriteStream = writeStreamAsync(pathToFile);
    const endSpy = jest.spyOn(createStreamSpy.mock.results[0].value, 'end');
    wsInstance.write('test', false);
    wsInstance.write('test', false);
    wsInstance.write('test', true);
    wsInstance.end();
    expect(endSpy).toHaveBeenCalledTimes(1);
    createStreamSpy.mockClear();
    endSpy.mockClear();
  });

  it('should call create stream with the correct path', () => {
    const pathToFile = '/Documents/BorFramework-Emulator/logger.txt';
    const createStreamSpy = jest.spyOn((fs as any).default, 'createWriteStream');
    writeStreamAsync(pathToFile);
    expect(createStreamSpy).toHaveBeenLastCalledWith(pathToFile);
    createStreamSpy.mockClear();
  });
});
