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
// Software), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED AS IS, WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

import { normalize } from 'path';

import {
  BotConfigWithPath,
  BotConfigWithPathImpl,
  CommandServiceImpl,
  CommandServiceInstance,
} from '@bfemulator/sdk-shared';
import { BotConfiguration } from 'botframework-config';
import { load } from '@bfemulator/app-shared/built/state/actions/botActions';

import { CredentialManager } from './credentialManager';
import { BotHelpers } from './botHelpers';

jest.mock('electron', () => ({
  app: {
    getPath: () => '/downloads',
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

const mockDispatch = jest.fn(_action => null);
jest.mock('./state/store', () => ({
  store: {
    getState: () => ({
      bot: {
        activeBot: {
          name: 'someBot',
          description: '',
          padlock: '',
          path: 'somePath',
          services: [],
        },
        botFiles: [
          { path: 'path1', displayName: 'name1', secret: '' },
          { path: 'path2', displayName: 'name2', secret: '' },
          { path: 'path3', displayName: 'name3', secret: '' },
          { path: 'path4', displayName: 'name4', secret: 'ffsafsdfdsa' },
        ],
      },
    }),
    dispatch: action => mockDispatch(action),
  },
}));

describe('The botHelpers', () => {
  let commandService: CommandServiceImpl;

  beforeAll(() => {
    const decorator = CommandServiceInstance();
    const descriptor = decorator({ descriptor: {} }, 'none') as any;
    commandService = descriptor.descriptor.get();
  });

  beforeEach(() => {
    mockDispatch.mockClear();
  });

  it('getActiveBot() should retrieve the active bot', () => {
    const activeBot = BotHelpers.getActiveBot();
    expect(activeBot).toEqual({
      name: 'someBot',
      description: '',
      padlock: '',
      path: 'somePath',
      services: [],
    });
  });

  it('getBotInfoByPath() should get the bot info matching the specified path', () => {
    const info = BotHelpers.getBotInfoByPath('path2');
    expect(info).toEqual({ path: 'path2', displayName: 'name2', secret: '' });
  });

  it('pathExistsInRecentBots() should determine if the specified path exists in the recent bot list', () => {
    const pathExists = BotHelpers.pathExistsInRecentBots('path1');
    expect(pathExists).toBe(true);
  });

  it(`removeBotFromList() should remove the bot from the list based on the specified path`, async () => {
    await BotHelpers.removeBotFromList('path4');

    const newBotsList = [
      { path: 'path1', displayName: 'name1', secret: '' },
      { path: 'path2', displayName: 'name2', secret: '' },
      { path: 'path3', displayName: 'name3', secret: '' },
    ];
    expect(mockDispatch).toHaveBeenCalledWith(load(newBotsList));
  });

  it('cloneBot() should clone the specified bot as expected', () => {
    const bot1 = null;
    expect(BotHelpers.cloneBot(bot1)).toBe(null);

    const bot2: BotConfigWithPath = BotConfigWithPathImpl.fromJSON({
      version: '',
      name: 'someName',
      description: 'someDescription',
      padlock: 'somePadlock',
      services: [],
      path: 'somePath',
      overrides: null,
    });
    expect(BotHelpers.cloneBot(bot2)).toEqual(bot2);
  });

  it('toSavableBot() should convert the specified bot to a savable instance', () => {
    const bot1 = null;
    expect(() => BotHelpers.toSavableBot(bot1)).toThrowError('Cannot convert null bot to savable bot.');

    const bot2: BotConfigWithPath = BotConfigWithPathImpl.fromJSON({
      version: '',
      name: 'someName',
      description: 'someDescription',
      services: [],
      path: 'somePath',
      overrides: null,
    });
    const secret = 'lgCbJPXnfOlatjbBDKMbh0ie6bc8PD/cjqA/2tPgMS0=';
    const savableBot = BotHelpers.toSavableBot(bot2, secret);

    const expectedBot = new BotConfiguration();
    expectedBot.name = 'someName';
    expectedBot.description = 'someDescription';
    expectedBot.services = [];

    expect(savableBot.name).toEqual(expectedBot.name);
    expect(savableBot.description).toEqual(expectedBot.description);
    expect(savableBot.services).toEqual(expectedBot.services);
    // secret key should've been refreshed
    expect(savableBot.padlock).not.toEqual(secret);
  });

  it('promptForSecretAndRetry() should prompt the user for the bot secret', async () => {
    commandService.remoteCall = jest
      .fn()
      .mockImplementationOnce(() => Promise.resolve(null))
      .mockImplementation(() => Promise.resolve('secret'));

    // if prompt for secret is dismissed, this should return null
    expect(await BotHelpers.promptForSecretAndRetry('somePath')).toBe(null);

    // should throw because it will get to the end of the function and try
    // to load a .bot file at 'somePath'
    try {
      await BotHelpers.promptForSecretAndRetry('somePath');
    } catch (e) {
      expect(e.code).toBe('ENOENT');
    }
  });

  describe('saveBot()', () => {
    it('should save a bot using the provided secret', async () => {
      const mockSave = jest.fn().mockResolvedValueOnce(true);
      const mockValidateSecret = jest.fn(() => null);
      jest
        .spyOn(BotHelpers, 'toSavableBot')
        .mockReturnValueOnce({ save: mockSave, validateSecret: mockValidateSecret });
      const result = await BotHelpers.saveBot({ path: 'path' } as any, 'secret');

      expect(result).toBe(true);
      expect(mockValidateSecret).toHaveBeenCalledWith('secret');
      expect(mockSave).toHaveBeenCalledWith('secret');
    });

    it('should save a bot using the secret from the store', async () => {
      const mockSave = jest.fn().mockResolvedValueOnce(true);
      const mockValidateSecret = jest.fn(() => null);
      jest
        .spyOn(BotHelpers, 'toSavableBot')
        .mockReturnValueOnce({ save: mockSave, validateSecret: mockValidateSecret });
      jest.spyOn(CredentialManager, 'getPassword').mockResolvedValueOnce('secret');
      const result = await BotHelpers.saveBot({ path: 'path' } as any, undefined);

      expect(result).toBe(true);
      expect(mockValidateSecret).toHaveBeenCalledWith('secret');
      expect(mockSave).toHaveBeenCalledWith('secret');
    });
  });

  describe('loadBotWithRetry()', () => {
    it('should load the bot if the correct secret is provided (happy path)', async () => {
      const botConfigLoadSpy = jest
        .spyOn(BotConfiguration, 'load')
        .mockResolvedValueOnce({ path: 'path', name: 'boticus' });
      const getPasswordSpy = jest.spyOn(CredentialManager, 'getPassword').mockResolvedValueOnce('secret');
      const setPasswordSpy = jest.spyOn(CredentialManager, 'setPassword');
      jest.spyOn(BotHelpers, 'pathExistsInRecentBots').mockReturnValueOnce(false);
      const patchBotsSpy = jest.spyOn(BotHelpers, 'patchBotsJson').mockResolvedValueOnce(true);
      const result = await BotHelpers.loadBotWithRetry('path', 'secret');

      expect(botConfigLoadSpy).toHaveBeenCalledWith('path', 'secret');
      expect(patchBotsSpy).toHaveBeenCalledWith('path', { path: 'path', displayName: 'boticus' });
      expect(getPasswordSpy).toHaveBeenCalledWith('path');
      expect(setPasswordSpy).not.toHaveBeenCalled();
      expect(result).toEqual({
        description: '',
        name: 'boticus',
        overrides: null,
        padlock: '',
        path: 'path',
        services: [],
        version: '2.0',
      });
    });

    it('should update the secret in the store if there is no secret in the store', async () => {
      jest.spyOn(BotConfiguration, 'load').mockResolvedValueOnce({ path: 'path', name: 'boticus' });
      jest.spyOn(CredentialManager, 'getPassword').mockResolvedValueOnce(undefined);
      const setPasswordSpy = jest.spyOn(CredentialManager, 'setPassword');
      jest.spyOn(BotHelpers, 'pathExistsInRecentBots').mockReturnValueOnce(false);
      jest.spyOn(BotHelpers, 'patchBotsJson').mockResolvedValueOnce(true);
      const result = await BotHelpers.loadBotWithRetry('path', 'secret');

      expect(setPasswordSpy).toHaveBeenCalledWith('path', 'secret');
      expect(result).toEqual({
        description: '',
        name: 'boticus',
        overrides: null,
        padlock: '',
        path: 'path',
        services: [],
        version: '2.0',
      });
    });

    it('should update the secret in the store if it does not match the supplied secret', async () => {
      jest.spyOn(BotConfiguration, 'load').mockResolvedValueOnce({ path: 'path', name: 'boticus' });
      jest.spyOn(CredentialManager, 'getPassword').mockResolvedValueOnce('otherSecret');
      const setPasswordSpy = jest.spyOn(CredentialManager, 'setPassword');
      jest.spyOn(BotHelpers, 'pathExistsInRecentBots').mockReturnValueOnce(false);
      jest.spyOn(BotHelpers, 'patchBotsJson').mockResolvedValueOnce(true);
      const result = await BotHelpers.loadBotWithRetry('path', 'secret');

      expect(setPasswordSpy).toHaveBeenCalledWith('path', 'secret');
      expect(result).toEqual({
        description: '',
        name: 'boticus',
        overrides: null,
        padlock: '',
        path: 'path',
        services: [],
        version: '2.0',
      });
    });

    it('should try loading the bot again if a secret was found in the store', async () => {
      jest
        .spyOn(BotConfiguration, 'load')
        // enter catch block on first attempt
        .mockRejectedValueOnce(new Error('provided secret was wrong'))
        // return a bot on second attempt
        .mockResolvedValueOnce({ path: 'path' });
      const loadBotWithRetrySpy = jest.spyOn(BotHelpers, 'loadBotWithRetry');
      jest.spyOn(BotHelpers, 'pathExistsInRecentBots').mockReturnValue(true);
      jest.spyOn(CredentialManager, 'getPassword').mockResolvedValue('secret');
      const result = await BotHelpers.loadBotWithRetry('path', 'secret');

      expect(result).toEqual({
        description: '',
        name: '',
        overrides: null,
        padlock: '',
        path: 'path',
        services: [],
        version: '2.0',
      });
      expect(loadBotWithRetrySpy).toHaveBeenCalledTimes(2);
    });

    it('should prompt the user for a secret if there is no secret in the credential store', async () => {
      jest.spyOn(BotConfiguration, 'load').mockRejectedValueOnce(new Error('provided secret was wrong'));
      jest.spyOn(CredentialManager, 'getPassword').mockResolvedValue(undefined);
      const promptForSecretSpy = jest.spyOn(BotHelpers, 'promptForSecretAndRetry').mockResolvedValueOnce(null);
      const result = await BotHelpers.loadBotWithRetry('path', undefined);

      expect(result).toBe(null);
      expect(promptForSecretSpy).toHaveBeenCalled();
    });

    it('should throw if it catches an error not related to loading a bot without a secret', async () => {
      try {
        jest.spyOn(BotConfiguration, 'load').mockRejectedValue(new Error('something went wrong'));
        await BotHelpers.loadBotWithRetry('path', undefined);
      } catch (e) {
        expect(e).toEqual(new Error('something went wrong'));
      }
    });
  });

  describe('getTranscriptsPath()', () => {
    it('should return a value directory path with an active bot', async () => {
      const result = BotHelpers.getTranscriptsPath({ path: '/foo/bar' } as any, { mode: 'livechat' } as any);
      expect(result).toBe(normalize('/foo/transcripts'));
    });

    it('should return a value directory path with a bot opened via url', async () => {
      const result = BotHelpers.getTranscriptsPath({ path: '/foo/bar' } as any, { mode: 'livechat-url' } as any);
      expect(result).toBe(normalize('/downloads/transcripts'));
    });
  });
});
