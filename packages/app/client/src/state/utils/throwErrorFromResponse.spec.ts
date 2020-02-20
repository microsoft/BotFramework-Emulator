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

import { throwErrorFromResponse } from './throwErrorFromResponse';

describe('throwErrorFromResponse', () => {
  it('should throw a customized error with the response text', () => {
    const mockResponse: any = {
      status: 500,
      statusText: 'INTERNAL SERVER ERROR',
      text: jest.fn(),
    };
    const gen = throwErrorFromResponse('Something went wrong!', mockResponse);
    gen.next();

    try {
      gen.next('The server could not handle your request.');
      expect(true).toBe(false); // ensure catch is hit
    } catch (e) {
      expect(e).toEqual({
        description: '500 INTERNAL SERVER ERROR',
        innerMessage: 'The server could not handle your request.',
        message: 'Something went wrong!',
        status: 500,
      });
    }
  });

  it('should throw a default error', () => {
    const mockResponse: any = {
      status: 500,
    };
    const gen = throwErrorFromResponse('', mockResponse);

    try {
      gen.next();
      expect(true).toBe(false); // ensure catch is hit
    } catch (e) {
      expect(e).toEqual({
        description: '500',
        message: 'Error',
        status: 500,
      });
    }
  });
});
