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

import { AppUpdater } from './appUpdater';

let mockAutoUpdater: any = {
  quitAndInstall: null,
  downloadUpdate: null,
  checkForUpdates: null,
  setFeedURL: null,
};

const defaultSettings = {
  autoUpdate: false,
  usePrereleases: false,
};

let mockSettings: any;

jest.mock('electron-updater', () => ({
  get autoUpdater() {
    return mockAutoUpdater;
  },
  UpdateInfo: typeof {},
}));

jest.mock('./settingsData/store', () => ({
  getSettings: () => ({ framework: mockSettings }),
}));

describe('AppUpdater', () => {
  beforeEach(() => {
    mockAutoUpdater = {};
    mockSettings = { ...defaultSettings };
  });

  it('should get userInitiated', () => {
    const tmp = (AppUpdater as any)._userInitiated;
    (AppUpdater as any)._userInitiated = true;

    expect(AppUpdater.userInitiated).toBe(true);
    (AppUpdater as any)._userInitiated = tmp;
  });

  it('should get status', () => {
    const tmp = (AppUpdater as any)._status;
    (AppUpdater as any)._status = true;

    expect(AppUpdater.status).toBe(true);
    (AppUpdater as any)._status = tmp;
  });

  it('should get downloadProgress', () => {
    const tmp = (AppUpdater as any)._downloadProgress;
    (AppUpdater as any)._downloadProgress = true;

    expect(AppUpdater.downloadProgress).toBe(true);
    (AppUpdater as any)._downloadProgress = tmp;
  });

  it('should get updateDownloaded', () => {
    const tmp = (AppUpdater as any)._updateDownloaded;
    (AppUpdater as any)._updateDownloaded = true;

    expect(AppUpdater.updateDownloaded).toBe(true);
    (AppUpdater as any)._updateDownloaded = tmp;
  });

  it('should return the correct repo depending on the prerelease setting', () => {
    AppUpdater.allowPrerelease = true;
    expect(AppUpdater.repo).toBe('BotFramework-Emulator-Nightlies');

    AppUpdater.allowPrerelease = false;
    expect(AppUpdater.repo).toBe('BotFramework-Emulator');
  });

  it('should get and set autoDownload', () => {
    mockAutoUpdater.autoDownload = false;
    AppUpdater.autoDownload = true;

    expect(mockAutoUpdater.autoDownload).toBe(true);
    expect(AppUpdater.autoDownload).toBe(true);
  });

  it('should get and set allowPrerelease', () => {
    mockAutoUpdater.allowPrerelease = false;
    AppUpdater.allowPrerelease = true;

    expect(mockAutoUpdater.allowPrerelease).toBe(true);
    expect(AppUpdater.allowPrerelease).toBe(true);
  });

  it('should startup and check for updates', () => {
    mockSettings.usePrereleases = false;
    mockSettings.autoUpdate = true;

    const mockOn = jest.fn((_eventName: string, _handler: () => any) => null);
    const mockSetFeedURL = jest.fn((_options: any) => null);
    mockAutoUpdater.on = mockOn;
    mockAutoUpdater.setFeedURL = mockSetFeedURL;

    const tmp = AppUpdater.checkForUpdates;
    const mockCheckForUpdates = jest.fn(_ => Promise.resolve(true));
    AppUpdater.checkForUpdates = mockCheckForUpdates;

    AppUpdater.startup();

    expect(AppUpdater.autoDownload).toBe(true);
    expect(AppUpdater.allowPrerelease).toBe(false);
    expect(mockAutoUpdater.autoInstallOnAppQuit).toBe(true);
    expect(mockAutoUpdater.logger).toBe(null);

    // event handlers should have been set up
    expect(mockOn).toHaveBeenCalledTimes(6);

    expect(mockCheckForUpdates).toHaveBeenCalledWith(false);

    AppUpdater.checkForUpdates = tmp;
  });

  it('should startup and not check for updates if autoUpdate is false ', () => {
    mockSettings.usePrereleases = true;
    mockSettings.autoUpdate = false;

    const mockOn = jest.fn((_eventName: string, _handler: () => any) => null);
    const mockSetFeedURL = jest.fn((_options: any) => null);
    mockAutoUpdater.on = mockOn;
    mockAutoUpdater.setFeedURL = mockSetFeedURL;

    const tmp = AppUpdater.checkForUpdates;
    const mockCheckForUpdates = jest.fn(_ => Promise.resolve(true));
    AppUpdater.checkForUpdates = mockCheckForUpdates;

    AppUpdater.startup();

    expect(AppUpdater.autoDownload).toBe(false);
    expect(AppUpdater.allowPrerelease).toBe(true);

    expect(mockCheckForUpdates).not.toHaveBeenCalled();

    AppUpdater.checkForUpdates = tmp;
  });

  it('should check for updates from the stable release repo', () => {
    const mockSetFeedURL = jest.fn((_options: any) => null);
    const mockCheckForUpdates = jest.fn((_userInitiated: boolean) =>
      Promise.resolve()
    );
    mockAutoUpdater.setFeedURL = mockSetFeedURL;
    mockAutoUpdater.checkForUpdates = mockCheckForUpdates;

    AppUpdater.checkForUpdates(true);

    expect(AppUpdater.userInitiated).toBe(true);

    expect(mockSetFeedURL).toHaveBeenCalledWith({
      repo: 'BotFramework-Emulator',
      owner: 'Microsoft',
      provider: 'github',
    });

    expect(mockCheckForUpdates).toHaveBeenCalledTimes(1);
  });

  it('should check for updates from the nightly release repo', () => {
    mockSettings.usePrereleases = true;
    const mockSetFeedURL = jest.fn((_options: any) => null);
    const mockCheckForUpdates = jest.fn((_userInitiated: boolean) =>
      Promise.resolve()
    );
    mockAutoUpdater.setFeedURL = mockSetFeedURL;
    mockAutoUpdater.checkForUpdates = mockCheckForUpdates;

    AppUpdater.checkForUpdates(false);

    expect(mockSetFeedURL).toHaveBeenCalledWith({
      repo: 'BotFramework-Emulator-Nightlies',
      owner: 'Microsoft',
      provider: 'github',
    });

    expect(mockCheckForUpdates).toHaveBeenCalledTimes(1);
  });

  it('should throw if there is an error while trying to check for updates', async () => {
    const mockCheckForUpdates = jest.fn((_userInitiated: boolean) =>
      Promise.reject('ERROR')
    );
    mockAutoUpdater.checkForUpdates = mockCheckForUpdates;
    mockAutoUpdater.setFeedURL = () => null;

    await expect(AppUpdater.checkForUpdates(false)).rejects.toBe(
      'There was an error while checking for the latest update: ERROR'
    );
  });

  it('should download updates', async () => {
    const mockDownloadUpdate = jest.fn(() => Promise.resolve(true));
    mockAutoUpdater.downloadUpdate = mockDownloadUpdate;

    await AppUpdater.downloadUpdate(false);

    expect(mockDownloadUpdate).toHaveBeenCalledTimes(1);
  });

  it('should throw if there is an error while trying to download updates', async () => {
    mockAutoUpdater.downloadUpdate = () => Promise.reject('ERROR');

    await expect(AppUpdater.downloadUpdate(false)).rejects.toBe(
      'There was an error while trying to download the latest update: ERROR'
    );
  });

  it('should quit and install', () => {
    const mockQuitAndInstall = jest.fn(
      (isSilent: boolean, forceRunAfter: boolean) => null
    );
    mockAutoUpdater.quitAndInstall = mockQuitAndInstall;

    AppUpdater.quitAndInstall();

    expect(mockQuitAndInstall).toHaveBeenCalledTimes(1);
    expect(mockQuitAndInstall).toHaveBeenCalledWith(false, true);
  });

  it('should throw if there is an error while trying to quit and install', () => {
    mockAutoUpdater.quitAndInstall = () => {
      throw 'ERROR';
    };

    expect(() => AppUpdater.quitAndInstall()).toThrow(
      'There was an error while trying to quit and install the latest update: ERROR'
    );
  });
});
