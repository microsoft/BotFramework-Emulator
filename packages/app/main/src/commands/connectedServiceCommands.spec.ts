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
import { SharedConstants } from '@bfemulator/app-shared';
import { CommandRegistry, CommandServiceImpl, CommandServiceInstance } from '@bfemulator/sdk-shared';
import { ServiceTypes } from 'botframework-config/lib/schema';

import { ConnectedServiceCommands } from './connectedServiceCommands';

const mockServiceTypes = ServiceTypes;
jest.mock('../services/luisApiService', () => ({
  LuisApi: {
    getServices: function*() {
      yield { label: 'Retrieving luis models', progress: 50 };
      return { services: [{ type: mockServiceTypes.Luis }] };
    },
  },
}));

jest.mock('../services/qnaApiService', () => ({
  QnaApiService: {
    getKnowledgeBases: function*() {
      yield { label: 'Retrieving knowledge bases', progress: 50 };
      return { services: [{ type: mockServiceTypes.QnA }] };
    },
  },
}));

jest.mock('../services/storageAccountApiService', () => ({
  StorageAccountApiService: {
    getBlobStorageServices: function*() {
      yield { label: 'Retrieving Blob Containers', progress: 50 };
      return { services: [{ type: mockServiceTypes.BlobStorage }] };
    },
  },
}));

jest.mock('../main', () => ({
  mainWindow: {
    commandService: {
      call: async () => true,
      remoteCall: async () => true,
    },
    browserWindow: {},
  },
}));

jest.mock('../globals', () => ({
  getGlobal: () => ({ storagepath: '' }),
  setGlobal: () => void 0,
}));

jest.mock('electron', () => ({
  app: {
    getPath: () => './',
  },
  ipcMain: new Proxy(
    {},
    {
      get(): any {
        return () => ({});
      },
      has() {
        return true;
      },
    }
  ),
  ipcRenderer: new Proxy(
    {},
    {
      get(): any {
        return () => ({});
      },
      has() {
        return true;
      },
    }
  ),
}));

describe('The connected service commands', () => {
  let registry: CommandRegistry;
  let commandService: CommandServiceImpl;
  beforeAll(() => {
    new ConnectedServiceCommands();
    const decorator = CommandServiceInstance();
    const descriptor = decorator({ descriptor: {} }, 'none') as any;
    commandService = descriptor.descriptor.get();
    commandService.remoteCall = () => Promise.resolve(true) as any;
    registry = commandService.registry;
  });

  it('should retrieve luis models when the ServiceTypes.Luis is specified', async () => {
    const handler = registry.getCommand(SharedConstants.Commands.ConnectedService.GetConnectedServicesByType);

    const result = await handler('', mockServiceTypes.Luis);
    expect(result.services[0].type).toBe(mockServiceTypes.Luis);
  });

  it('should retrieve knowledge bases when the ServiceTypes.QnA is specified', async () => {
    const handler = registry.getCommand(SharedConstants.Commands.ConnectedService.GetConnectedServicesByType);

    const result = await handler('', mockServiceTypes.QnA);
    expect(result.services[0].type).toBe(mockServiceTypes.QnA);
  });

  it('should retrieve Blob Containers when the ServiceTypes.BlobStorage is specified', async () => {
    const handler = registry.getCommand(SharedConstants.Commands.ConnectedService.GetConnectedServicesByType);

    const result = await handler('', mockServiceTypes.BlobStorage);
    expect(result.services[0].type).toBe(mockServiceTypes.BlobStorage);
  });

  it('should throw if an unexpected service type is specified', async () => {
    const handler = registry.getCommand(SharedConstants.Commands.ConnectedService.GetConnectedServicesByType);
    let error;
    try {
      await handler('', mockServiceTypes.File);
    } catch (e) {
      error = e;
    }
    expect(error.message).toBe(`The ServiceTypes ${mockServiceTypes.File} is not a known service type`);
  });
});
