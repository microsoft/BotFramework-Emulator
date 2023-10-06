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

import {
  usGovernmentAuthentication,
  authentication,
  v32Authentication,
  v31Authentication,
} from '../../constants/authEndpoints';

import { createBotFrameworkAuthenticationMiddleware } from './botFrameworkAuthentication';

const mockGetKey = jest.fn().mockResolvedValue(`openIdMetadataKey`);
jest.mock('../../utils/openIdMetadata', () => ({
  OpenIdMetadata: jest.fn().mockImplementation(() => ({
    getKey: mockGetKey,
  })),
}));

let mockDecode;
let mockVerify;
jest.mock('jsonwebtoken', () => ({
  get decode() {
    return mockDecode;
  },
  get verify() {
    return mockVerify;
  },
}));

describe('botFrameworkAuthenticationMiddleware', () => {
  const authMiddleware = createBotFrameworkAuthenticationMiddleware(jest.fn().mockResolvedValue(true));
  const mockStatus = jest.fn(() => null);
  const mockEnd = jest.fn(() => null);
  let mockPayload;

  beforeEach(() => {
    mockEnd.mockClear();
    mockStatus.mockClear();
    mockDecode = jest.fn(() => ({
      header: {
        kid: 'someKeyId',
      },
      payload: mockPayload,
    }));
    mockVerify = jest.fn(() => 'verifiedJwt');
    mockGetKey.mockClear();
  });

  it('should call the next middleware and return if there is no auth header', async () => {
    const mockHeader = jest.fn(() => false);
    const req: any = { header: mockHeader };
    const result = await authMiddleware(req, null);

    expect(result).toBeUndefined();
    expect(mockHeader).toHaveBeenCalled();
  });

  it('should return a 401 if the token is not provided in the header', async () => {
    mockDecode = jest.fn(() => null);
    const mockHeader = jest.fn(() => 'Bearer someToken');
    const req: any = { header: mockHeader };
    const res: any = {
      status: mockStatus,
      end: mockEnd,
    };
    const result = await authMiddleware(req, res);

    expect(result).toBeUndefined();
    expect(mockHeader).toHaveBeenCalled();
    expect(mockDecode.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "someToken",
          {
            "complete": true,
          },
        ],
      ]
    `);
    expect(mockStatus).toHaveBeenCalledWith(401);
    expect(mockEnd).toHaveBeenCalled();
  });

  it('should return a 401 if a government bot provides a token in an unknown format', async () => {
    mockPayload = {
      aud: usGovernmentAuthentication.botTokenAudience,
      ver: '99.9',
    };
    const mockHeader = jest.fn(() => 'Bearer someToken');
    const req: any = { header: mockHeader };
    const res: any = {
      status: mockStatus,
      end: mockEnd,
    };
    const result = await authMiddleware(req, res);

    expect(result).toBeUndefined();
    expect(mockStatus).toHaveBeenCalledWith(401);
    expect(mockEnd).toHaveBeenCalled();
  });

  it('should authenticate with a v1.0 gov token', async () => {
    mockPayload = {
      aud: usGovernmentAuthentication.botTokenAudience,
      ver: '1.0',
    };
    const mockHeader = jest.fn(() => 'Bearer someToken');
    const req: any = { header: mockHeader };
    const res: any = {
      status: mockStatus,
      end: mockEnd,
    };
    const result = await authMiddleware(req, res);

    expect(result).toBeUndefined();
    expect(mockVerify.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "someToken",
          "openIdMetadataKey",
          {
            "allowInvalidAsymmetricKeyTypes": true,
            "audience": "https://api.botframework.us",
            "clockTolerance": 300,
            "issuer": "https://sts.windows.net/cab8a31a-1906-4287-a0d8-4eef66b95f6e/",
          },
        ],
      ]
    `);
    expect(req.jwt).toBe('verifiedJwt');
  });

  it('should authenticate with a v2.0 gov token', async () => {
    mockPayload = {
      aud: usGovernmentAuthentication.botTokenAudience,
      ver: '2.0',
    };
    const mockHeader = jest.fn(() => 'Bearer someToken');
    const req: any = { header: mockHeader };
    const res: any = {
      status: mockStatus,
      end: mockEnd,
    };
    const result = await authMiddleware(req, res);

    expect(result).toBeUndefined();
    expect(mockVerify.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "someToken",
          "openIdMetadataKey",
          {
            "allowInvalidAsymmetricKeyTypes": true,
            "audience": "https://api.botframework.us",
            "clockTolerance": 300,
            "issuer": "https://login.microsoftonline.us/cab8a31a-1906-4287-a0d8-4eef66b95f6e/v2.0",
          },
        ],
      ]
    `);
    expect(req.jwt).toBe('verifiedJwt');
  });

  it('should return a 401 if verifying a gov jwt token fails', async () => {
    mockPayload = {
      aud: usGovernmentAuthentication.botTokenAudience,
      ver: '1.0',
    };
    const mockHeader = jest.fn(() => 'Bearer someToken');
    const req: any = { header: mockHeader };
    const res: any = {
      status: mockStatus,
      end: mockEnd,
    };
    mockVerify = jest.fn(() => {
      throw new Error('unverifiedJwt');
    });
    const result = await authMiddleware(req, res);

    expect(result).toBeUndefined();
    expect(mockVerify.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "someToken",
          "openIdMetadataKey",
          {
            "allowInvalidAsymmetricKeyTypes": true,
            "audience": "https://api.botframework.us",
            "clockTolerance": 300,
            "issuer": "https://sts.windows.net/cab8a31a-1906-4287-a0d8-4eef66b95f6e/",
          },
        ],
      ]
    `);
    expect(req.jwt).toBeUndefined();
    expect(mockStatus).toHaveBeenCalledWith(401);
    expect(mockEnd).toHaveBeenCalled();
  });

  it(`should return a 500 if a bot's token can't be retrieved from openId metadata`, async () => {
    mockPayload = {
      aud: 'not gov',
      ver: '1.0',
    };
    const mockHeader = jest.fn(() => 'Bearer someToken');
    const req: any = { header: mockHeader };
    const res: any = {
      status: mockStatus,
      end: mockEnd,
    };
    // key should come back as falsy
    mockGetKey.mockResolvedValueOnce(null);
    const result = await authMiddleware(req, res);

    expect(result).toBeUndefined();
    expect(mockStatus).toHaveBeenCalledWith(500);
    expect(mockEnd).toHaveBeenCalled();
  });

  it('should return a 401 if a bot provides a token in an unknown format', async () => {
    mockPayload = {
      aud: 'not gov',
      ver: '99.9',
    };
    const mockHeader = jest.fn(() => 'Bearer someToken');
    const req: any = { header: mockHeader };
    const res: any = {
      status: mockStatus,
      end: mockEnd,
    };
    const result = await authMiddleware(req, res);

    expect(result).toBeUndefined();
    expect(mockStatus).toHaveBeenCalledWith(401);
    expect(mockEnd).toHaveBeenCalled();
  });

  it('should authenticate with a v1.0 token', async () => {
    mockPayload = {
      aud: 'not gov',
      ver: '1.0',
    };
    const mockHeader = jest.fn(() => 'Bearer someToken');
    const req: any = { header: mockHeader };
    const res: any = {
      status: mockStatus,
      end: mockEnd,
    };
    const result = await authMiddleware(req, res);

    expect(result).toBeUndefined();
    expect(mockVerify.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "someToken",
          "openIdMetadataKey",
          {
            "allowInvalidAsymmetricKeyTypes": true,
            "audience": "https://api.botframework.com",
            "clockTolerance": 300,
            "issuer": "https://sts.windows.net/f8cdef31-a31e-4b4a-93e4-5f571e91255a/",
          },
        ],
      ]
    `);
    expect(req.jwt).toBe('verifiedJwt');
  });

  it('should authenticate with a v2.0 token', async () => {
    mockPayload = {
      aud: 'not gov',
      ver: '2.0',
    };
    const mockHeader = jest.fn(() => 'Bearer someToken');
    const req: any = { header: mockHeader };
    const res: any = {
      status: mockStatus,
      end: mockEnd,
    };
    const result = await authMiddleware(req, res);

    expect(result).toBeUndefined();
    expect(mockVerify.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "someToken",
          "openIdMetadataKey",
          {
            "allowInvalidAsymmetricKeyTypes": true,
            "audience": "https://api.botframework.com",
            "clockTolerance": 300,
            "issuer": "https://login.microsoftonline.com/f8cdef31-a31e-4b4a-93e4-5f571e91255a/v2.0",
          },
        ],
      ]
    `);
    expect(req.jwt).toBe('verifiedJwt');
  });

  it('should attempt authentication with v3.1 characteristics if v3.2 auth fails', async () => {
    mockPayload = {
      aud: 'not gov',
      ver: '1.0',
    };
    const mockHeader = jest.fn(() => 'Bearer someToken');
    const req: any = { header: mockHeader };
    const res: any = {
      status: mockStatus,
      end: mockEnd,
    };
    // verification attempt with v3.2 token characteristics should fail
    mockVerify.mockImplementationOnce(() => {
      throw new Error('unverifiedJwt');
    });
    const result = await authMiddleware(req, res);

    expect(result).toBeUndefined();
    expect(mockVerify).toHaveBeenCalledTimes(2);
    expect(mockVerify.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "someToken",
          "openIdMetadataKey",
          {
            "allowInvalidAsymmetricKeyTypes": true,
            "audience": "https://api.botframework.com",
            "clockTolerance": 300,
            "issuer": "https://sts.windows.net/f8cdef31-a31e-4b4a-93e4-5f571e91255a/",
          },
        ],
        [
          "someToken",
          "openIdMetadataKey",
          {
            "allowInvalidAsymmetricKeyTypes": true,
            "audience": "https://api.botframework.com",
            "clockTolerance": 300,
            "issuer": "https://sts.windows.net/d6d49420-f39b-4df7-a1dc-d59a935871db/",
          },
        ],
      ]
    `);
    expect(req.jwt).toBe('verifiedJwt');
  });

  it('should return a 401 if auth with both v3.1 & v3.2 token characteristics fail', async () => {
    mockPayload = {
      aud: 'not gov',
      ver: '1.0',
    };
    const mockHeader = jest.fn(() => 'Bearer someToken');
    const req: any = { header: mockHeader };
    const res: any = {
      status: mockStatus,
      end: mockEnd,
    };
    mockVerify
      // verification attempt with v3.2 token characteristics should fail
      .mockImplementationOnce(() => {
        throw new Error('unverifiedJwt');
      })
      // second attempt with v3.1 token characteristics should also fail
      .mockImplementationOnce(() => {
        throw new Error('unverifiedJwt');
      });
    const result = await authMiddleware(req, res);

    expect(result).toBeUndefined();
    expect(mockVerify).toHaveBeenCalledTimes(2);
    expect(mockVerify.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "someToken",
          "openIdMetadataKey",
          {
            "allowInvalidAsymmetricKeyTypes": true,
            "audience": "https://api.botframework.com",
            "clockTolerance": 300,
            "issuer": "https://sts.windows.net/f8cdef31-a31e-4b4a-93e4-5f571e91255a/",
          },
        ],
        [
          "someToken",
          "openIdMetadataKey",
          {
            "allowInvalidAsymmetricKeyTypes": true,
            "audience": "https://api.botframework.com",
            "clockTolerance": 300,
            "issuer": "https://sts.windows.net/d6d49420-f39b-4df7-a1dc-d59a935871db/",
          },
        ],
      ]
    `);
    expect(mockStatus).toHaveBeenCalledWith(401);
    expect(mockEnd).toHaveBeenCalled();
    expect(req.jwt).toBeUndefined();
  });
});
