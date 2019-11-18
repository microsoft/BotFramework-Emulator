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

import * as Restify from 'restify';

import { createJsonBodyParserMiddleware } from './jsonBodyParser';

let mockBodyParser = jest.fn(() => null);
jest.mock('restify', () => ({
  plugins: {
    bodyReader: jest.fn(options => options),
    jsonBodyParser: jest.fn(() => [mockBodyParser]),
  },
}));

describe('jsonBodyParser', () => {
  let bodyParsingFunctions;
  const mockOptions: any = {};
  const mockNext: any = jest.fn(() => null);

  beforeEach(() => {
    (Restify.plugins.bodyReader as any).mockClear();
    (Restify.plugins.jsonBodyParser as any).mockClear();
    bodyParsingFunctions = createJsonBodyParserMiddleware(mockOptions);
    mockNext.mockClear();
    mockBodyParser.mockClear();
  });

  it('should return a read function that reads a request body', () => {
    // use default options
    bodyParsingFunctions = createJsonBodyParserMiddleware(null);

    expect(bodyParsingFunctions.length).toBe(2);
    expect(bodyParsingFunctions[0]).toEqual({ bodyReader: true, mapParams: false });

    // use supplied options
    bodyParsingFunctions = createJsonBodyParserMiddleware(mockOptions);

    expect(bodyParsingFunctions[0]).toEqual({ bodyReader: true });
  });

  it('should not parse anything from a HEAD request', () => {
    const req: any = { method: 'HEAD' };
    const result = createJsonBodyParserMiddleware(mockOptions)[1](req, null, mockNext);

    expect(result).toBeUndefined();
    expect(mockNext).toHaveBeenCalled();
  });

  it('should not parse anything from a GET request with no requestBodyOnGet option', () => {
    mockOptions.requestBodyOnGet = false;
    const req: any = { method: 'GET' };
    const result = createJsonBodyParserMiddleware(mockOptions)[1](req, null, mockNext);

    expect(result).toBeUndefined();
    expect(mockNext).toHaveBeenCalled();
  });

  it('should not parse anything from a non-chunked request with 0 content length', () => {
    const req: any = {
      method: 'POST',
      contentLength: jest.fn(() => 0),
      isChunked: jest.fn(() => false),
    };
    const result = createJsonBodyParserMiddleware(mockOptions)[1](req, null, mockNext);

    expect(result).toBeUndefined();
    expect(mockNext).toHaveBeenCalled();
  });

  it('should parse json from the request content', () => {
    const req: any = {
      method: 'POST',
      contentLength: jest.fn(() => 1),
      contentType: jest.fn(() => 'application/json'),
    };
    const result = createJsonBodyParserMiddleware(mockOptions)[1](req, null, mockNext);

    expect(result).toBeUndefined();
    expect(mockBodyParser).toHaveBeenCalled();
  });

  it('should skip to the next middleware if there is no parser for the request body', () => {
    const req: any = {
      method: 'POST',
      contentLength: jest.fn(() => 1),
      contentType: jest.fn(() => 'application/json'),
    };
    mockBodyParser = null;
    const result = createJsonBodyParserMiddleware(mockOptions)[1](req, null, mockNext);

    expect(result).toBeUndefined();
    expect(mockNext).toHaveBeenCalled();
  });
});
