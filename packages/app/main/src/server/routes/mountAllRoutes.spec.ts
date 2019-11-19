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
import { mountAttachmentsRoutes } from './channel/attachments/mountAttachmentsRoutes';
import { mountBotStateRoutes } from './channel/botState/mountBotStateRoutes';
import { mountConversationsRoutes } from './channel/conversations/mountConversationsRoutes';
import { mountDirectLineRoutes } from './directLine/mountDirectLineRoutes';
import { mountEmulatorRoutes } from './emulator/mountEmulatorRoutes';
import { mountSessionRoutes } from './channel/session/mountSessionRoutes';
import { mountUserTokenRoutes } from './channel/userToken/mountUserTokenRoutes';
import { mountAllRoutes } from './mountAllRoutes';

const mockMountAttachmentsRoutes = jest.fn();
jest.mock('./channel/attachments/mountAttachmentsRoutes', () => ({
  mountAttachmentsRoutes: server => mockMountAttachmentsRoutes(server),
}));
const mockMountBotStateRoutes = jest.fn();
jest.mock('./channel/botState/mountBotStateRoutes', () => ({
  mountBotStateRoutes: server => mockMountBotStateRoutes(server),
}));
const mockMountConversationsRoutes = jest.fn();
jest.mock('./channel/conversations/mountConversationsRoutes', () => ({
  mountConversationsRoutes: server => mockMountConversationsRoutes(server),
}));
const mockMountDirectLineRoutes = jest.fn();
jest.mock('./directLine/mountDirectLineRoutes', () => ({
  mountDirectLineRoutes: server => mockMountDirectLineRoutes(server),
}));
const mockMountEmulatorRoutes = jest.fn();
jest.mock('./emulator/mountEmulatorRoutes', () => ({
  mountEmulatorRoutes: server => mockMountEmulatorRoutes(server),
}));
const mockMountSessionRoutes = jest.fn();
jest.mock('./channel/session/mountSessionRoutes', () => ({
  mountSessionRoutes: server => mockMountSessionRoutes(server),
}));
const mockMountUserTokenRoutes = jest.fn();
jest.mock('./channel/userToken/mountUserTokenRoutes', () => ({
  mountUserTokenRoutes: server => mockMountUserTokenRoutes(server),
}));

describe('mountAllRoutes', () => {
  it('should mount all routes', () => {
    const emulatorServer: any = {};
    mountAllRoutes(emulatorServer);

    expect(mockMountAttachmentsRoutes).toHaveBeenCalledWith(emulatorServer);
    expect(mockMountBotStateRoutes).toHaveBeenCalledWith(emulatorServer);
    expect(mockMountConversationsRoutes).toHaveBeenCalledWith(emulatorServer);
    expect(mockMountDirectLineRoutes).toHaveBeenCalledWith(emulatorServer);
    expect(mockMountEmulatorRoutes).toHaveBeenCalledWith(emulatorServer);
    expect(mockMountSessionRoutes).toHaveBeenCalledWith(emulatorServer);
    expect(mockMountUserTokenRoutes).toHaveBeenCalledWith(emulatorServer);
  });
});
