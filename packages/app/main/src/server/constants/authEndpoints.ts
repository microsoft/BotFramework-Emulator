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

export const authentication = {
  channelService: 'https://dev.botframework.com/',
  tokenEndpoint: 'https://login.microsoftonline.com/botframework.com/oauth2/v2.0/token',
  tokenEndpointSingleTenant: 'https://login.microsoftonline.com/{tenant-id}/oauth2/v2.0/token',
  openIdMetadata: 'https://login.microsoftonline.com/botframework.com/v2.0/.well-known/openid-configuration',
  botTokenAudience: 'https://api.botframework.com',
};

export const usGovernmentAuthentication = {
  channelService: 'https://botframework.azure.us',
  tokenEndpoint: 'https://login.microsoftonline.us/cab8a31a-1906-4287-a0d8-4eef66b95f6e/oauth2/v2.0/token',
  openIdMetadata:
    'https://login.microsoftonline.us/cab8a31a-1906-4287-a0d8-4eef66b95f6e/v2.0/.well-known/openid-configuration',
  botTokenAudience: 'https://api.botframework.us',
  tokenIssuerV1: 'https://sts.windows.net/cab8a31a-1906-4287-a0d8-4eef66b95f6e/',
  tokenIssuerV2: 'https://login.microsoftonline.us/cab8a31a-1906-4287-a0d8-4eef66b95f6e/v2.0',
};

export const v31Authentication = {
  tokenIssuer: 'https://sts.windows.net/d6d49420-f39b-4df7-a1dc-d59a935871db/',
};

export const v32Authentication = {
  tokenIssuerSingleTenant: 'https://sts.windows.net/{tenant-id}/',
  tokenIssuerV1: 'https://sts.windows.net/f8cdef31-a31e-4b4a-93e4-5f571e91255a/',
  tokenIssuerV2: 'https://login.microsoftonline.com/f8cdef31-a31e-4b4a-93e4-5f571e91255a/v2.0',
};

export const speech = {
  // Access token for Cognitive Services API
  tokenEndpoint: 'https://login.botframework.com/v3/speechtoken/speechservices',
};
