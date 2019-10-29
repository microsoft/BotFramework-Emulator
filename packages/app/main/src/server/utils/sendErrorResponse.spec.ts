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

import { ErrorCodes } from '@bfemulator/sdk-shared';
import * as HttpStatus from 'http-status-codes';

import { sendErrorResponse } from './sendErrorResponse';
import { createErrorResponse } from './createResponse/createErrorResponse';

describe('sendErrorResponse', () => {
  const mockSend = jest.fn(() => {});
  const mockEnd = jest.fn(() => {});
  const response: any = { end: mockEnd, send: mockSend };

  beforeEach(() => {
    mockSend.mockClear();
    mockEnd.mockClear();
  });

  it('should send an error response with the provided exception', () => {
    const exception = { error: 'some error', statusCode: 404 };
    const error = sendErrorResponse(null, response, null, exception);

    expect(error).toBe(exception.error);
    expect(mockSend).toHaveBeenCalledWith(exception.statusCode, exception.error);
    expect(mockEnd).toHaveBeenCalled();
  });

  it('should create and send an error response when no status code / exception is provided', () => {
    const exception = { message: 'some error message' };
    const error = sendErrorResponse(null, response, null, exception);

    expect(error).toEqual(createErrorResponse(ErrorCodes.ServiceError, exception.message));
    expect(mockSend).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST, error);
    expect(mockEnd).toHaveBeenCalled();
  });
});
