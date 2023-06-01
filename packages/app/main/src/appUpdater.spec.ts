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

import { CommandServiceImpl, CommandServiceInstance } from '@bfemulator/sdk-shared';
import { setFrameworkSettings, setUpdateStatus, SharedConstants, UpdateStatus } from '@bfemulator/app-shared';

import { AppUpdater } from './appUpdater';
import { TelemetryService } from './telemetry';
import { AppMenuBuilder } from './appMenuBuilder';

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

jest.mock('./appMenuBuilder', () => ({
  AppMenuBuilder: {
    refreshAppUpdateMenu: jest.fn(),
  },
}));

jest.mock('electron-updater', () => ({
  get autoUpdater() {
    return mockAutoUpdater;
  },
  UpdateInfo: typeof {},
}));

const mockDispatch = jest.fn(() => null);
jest.mock('./state/store', () => ({
  getSettings: () => ({
    get framework() {
      return mockSettings;
    },
  }),
  store: {
    getState: () => ({
      bot: {
        botFiles: [],
      },
      get framework() {
        return mockSettings;
      },
    }),
    get dispatch() {
      return mockDispatch;
    },
    subscribe: () => null,
  },
}));

jest.mock('./telemetry', () => ({
  TelemetryService: {
    trackEvent: () => null,
  },
}));

jest.mock('electron', () => ({
  app: {
    on: () => void 0,
    setName: () => void 0,
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
  systemPreferences: {
    isInvertedColorScheme: jest.fn(() => true),
    on: jest.fn(() => null),
  },
}));

const mockSendNotification = jest.fn().mockResolvedValue(undefined);
jest.mock('./utils/sendNotificationToClient', () => ({
  get sendNotificationToClient() {
    return mockSendNotification;
  },
}));

jest.mock('./emulator', () => ({
  Emulator: {
    initialize: jest.fn(),
    getInstance: () => ({
      ngrok: {
        ngrokEmitter: {
          on: () => null,
        },
      },
    }),
  },
}));

describe('AppUpdater', () => {
  let mockTrackEvent;
  const trackEventBackup = TelemetryService.trackEvent;
  let commandService: CommandServiceImpl;

  beforeAll(() => {
    const decorator = CommandServiceInstance();
    const descriptor = decorator({ descriptor: {} }, 'none') as any;
    commandService = descriptor.descriptor.get();
  });

  beforeEach(() => {
    mockAutoUpdater = {};
    mockSettings = { ...defaultSettings };
    mockTrackEvent = jest.fn(() => Promise.resolve());
    TelemetryService.trackEvent = mockTrackEvent;
    mockDispatch.mockClear();
    mockSendNotification.mockClear();
  });

  afterAll(() => {
    TelemetryService.trackEvent = trackEventBackup;
  });

  it('should get userInitiated', () => {
    const tmp = (AppUpdater as any)._userInitiated;
    (AppUpdater as any)._userInitiatedResolver = () => void 0;

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

  it('should startup and check for updates', async () => {
    mockSettings.usePrereleases = false;
    mockSettings.autoUpdate = true;

    const mockOn = jest.fn((_eventName: string, _handler: () => any) => null);
    const mockSetFeedURL = jest.fn((_options: any) => null);
    mockAutoUpdater.on = mockOn;
    mockAutoUpdater.setFeedURL = mockSetFeedURL;

    const tmp = AppUpdater.checkForUpdates;
    const mockCheckForUpdates = jest.fn(_ => Promise.resolve(true));
    AppUpdater.checkForUpdates = mockCheckForUpdates;

    await AppUpdater.startup();

    expect(AppUpdater.autoDownload).toBe(true);
    expect(AppUpdater.allowPrerelease).toBe(false);
    expect(mockAutoUpdater.autoInstallOnAppQuit).toBe(true);
    expect(mockAutoUpdater.logger).toBe(null);

    // event handlers should have been set up
    expect(mockOn).toHaveBeenCalledTimes(5);

    expect(mockCheckForUpdates).toHaveBeenCalledWith(false);

    AppUpdater.checkForUpdates = tmp;
  });

  it('should check for updates from the stable release repo', async () => {
    const mockSetFeedURL = jest.fn((_options: any) => null);
    const mockCheckForUpdates = jest.fn(async () => {
      AppUpdater._userInitiatedResolver();
    });
    mockAutoUpdater.setFeedURL = mockSetFeedURL;
    mockAutoUpdater.checkForUpdates = mockCheckForUpdates;

    await AppUpdater.checkForUpdates(true);

    expect(AppUpdater.userInitiated).toBe(true);

    expect(mockSetFeedURL).toHaveBeenCalledWith({
      repo: 'BotFramework-Emulator',
      owner: 'Microsoft',
      provider: 'github',
    });

    expect(mockCheckForUpdates).toHaveBeenCalledTimes(1);
    expect(mockTrackEvent).toHaveBeenCalledWith('update_check', {
      auto: !AppUpdater.userInitiated,
      prerelease: false,
    });
  });

  it('should check for updates from the nightly release repo', async () => {
    mockSettings.usePrereleases = true;
    const mockSetFeedURL = jest.fn((_options: any) => null);
    const mockCheckForUpdates = jest.fn(() => Promise.resolve());
    mockAutoUpdater.setFeedURL = mockSetFeedURL;
    mockAutoUpdater.checkForUpdates = mockCheckForUpdates;

    await AppUpdater.checkForUpdates(false);

    expect(mockSetFeedURL).toHaveBeenCalledWith({
      repo: 'BotFramework-Emulator-Nightlies',
      owner: 'Microsoft',
      provider: 'github',
    });

    expect(mockCheckForUpdates).toHaveBeenCalledTimes(1);
    expect(mockTrackEvent).toHaveBeenCalledWith('update_check', {
      auto: !AppUpdater.userInitiated,
      prerelease: true,
    });
  });

  it('should throw if there is an error while trying to check for updates', async () => {
    const mockCheckForUpdates = jest.fn(() => Promise.reject('ERROR'));
    mockAutoUpdater.checkForUpdates = mockCheckForUpdates;
    mockAutoUpdater.setFeedURL = () => null;

    await expect(AppUpdater.checkForUpdates(false)).rejects.toThrowError(
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

    await expect(AppUpdater.downloadUpdate(false)).rejects.toThrowError(
      'There was an error while trying to download the latest update: ERROR'
    );
  });

  it('should quit and install', () => {
    const mockQuitAndInstall = jest.fn((isSilent: boolean, forceRunAfter: boolean) => null);
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

  it('should show a progress indicator and download the update; not install', async () => {
    const downloadUpdateSpy = jest.spyOn(AppUpdater, 'downloadUpdate').mockResolvedValueOnce(undefined);
    jest.spyOn(AppMenuBuilder, 'refreshAppUpdateMenu').mockReturnValueOnce(undefined);
    const remoteCallSpy = jest
      .spyOn(commandService, 'remoteCall')
      // result from dialog
      .mockResolvedValueOnce(0)
      // update progress indicator
      .mockResolvedValueOnce(undefined)
      // show progress indicator
      .mockResolvedValueOnce(undefined);
    AppUpdater.autoDownload = false;
    await (AppUpdater as any).onUpdateAvailable({ version: 'v4.5.0' });

    expect(remoteCallSpy).toHaveBeenCalledTimes(3);
    expect(downloadUpdateSpy).toHaveBeenCalledWith(false);

    remoteCallSpy.mockClear();
    downloadUpdateSpy.mockClear();
  });

  it('should show a progress indicator and download & install the update', async () => {
    const downloadUpdateSpy = jest.spyOn(AppUpdater, 'downloadUpdate').mockResolvedValueOnce(undefined);
    jest.spyOn(AppMenuBuilder, 'refreshAppUpdateMenu').mockReturnValueOnce(undefined);
    const remoteCallSpy = jest
      .spyOn(commandService, 'remoteCall')
      // result from dialog
      .mockResolvedValueOnce(1)
      // update progress indicator
      .mockResolvedValueOnce(undefined)
      // show progress indicator
      .mockResolvedValueOnce(undefined);
    AppUpdater.autoDownload = false;
    await (AppUpdater as any).onUpdateAvailable({ version: 'v4.5.0' });

    expect(remoteCallSpy).toHaveBeenCalledTimes(3);
    expect(downloadUpdateSpy).toHaveBeenCalledWith(true);

    remoteCallSpy.mockClear();
    downloadUpdateSpy.mockClear();
  });

  it('should show a progress indicator and download & install the update, and opt into auto updates', async () => {
    const downloadUpdateSpy = jest.spyOn(AppUpdater, 'downloadUpdate').mockResolvedValueOnce(undefined);
    jest.spyOn(AppMenuBuilder, 'refreshAppUpdateMenu').mockReturnValueOnce(undefined);
    const remoteCallSpy = jest
      .spyOn(commandService, 'remoteCall')
      // result from dialog
      .mockResolvedValueOnce(2)
      // update progress indicator
      .mockResolvedValueOnce(undefined)
      // show progress indicator
      .mockResolvedValueOnce(undefined);
    AppUpdater.autoDownload = false;
    await (AppUpdater as any).onUpdateAvailable({ version: 'v4.5.0' });

    expect(remoteCallSpy).toHaveBeenCalledTimes(3);
    expect(downloadUpdateSpy).toHaveBeenCalledWith(true);
    expect(mockDispatch).toHaveBeenCalledWith(setFrameworkSettings({ ...mockSettings, autoUpdate: true }));

    remoteCallSpy.mockClear();
    downloadUpdateSpy.mockClear();
    mockDispatch.mockClear();
  });

  it('should not show anything if the user closes the update available dialog', async () => {
    jest.spyOn(AppMenuBuilder, 'refreshAppUpdateMenu').mockReturnValueOnce(undefined);
    const remoteCallSpy = jest.spyOn(commandService, 'remoteCall').mockResolvedValueOnce(undefined);
    AppUpdater.autoDownload = false;
    await (AppUpdater as any).onUpdateAvailable({ version: 'v4.5.0' });

    expect(remoteCallSpy).toHaveBeenCalledTimes(1);

    remoteCallSpy.mockClear();
  });

  it('should download the update silently if auto download is enabled', async () => {
    const downloadUpdateSpy = jest.spyOn(AppUpdater, 'downloadUpdate').mockResolvedValueOnce(undefined);
    AppUpdater.autoDownload = true;
    await (AppUpdater as any).onUpdateAvailable({ version: 'v4.5.0' });

    expect(downloadUpdateSpy).toHaveBeenCalledWith(false);

    downloadUpdateSpy.mockClear();
  });

  it('should quit and install after the update has been downloaded', async () => {
    const quitAndInstall = jest.spyOn(AppUpdater, 'quitAndInstall').mockReturnValue(undefined);
    (AppUpdater as any)._installAfterDownload = true;
    await (AppUpdater as any).onUpdateDownloaded({ version: 'v4.5.0' });

    expect(quitAndInstall).toHaveBeenCalled();

    quitAndInstall.mockClear();
  });

  it('should send a notification to quit and install after the update has been downloaded', async () => {
    const remoteCallSpy = jest.spyOn(commandService, 'remoteCall').mockResolvedValueOnce(undefined);
    jest.spyOn(AppMenuBuilder, 'refreshAppUpdateMenu').mockReturnValueOnce(undefined);
    (AppUpdater as any)._installAfterDownload = false;
    await (AppUpdater as any).onUpdateDownloaded({ version: 'v4.5.0' });

    expect(remoteCallSpy).toHaveBeenCalledWith(SharedConstants.Commands.UI.UpdateProgressIndicator, {
      label: 'Download finished.',
      progress: 100,
    });
    expect(mockSendNotification).toHaveBeenCalled();

    remoteCallSpy.mockClear();
  });

  it('should get and set _status', () => {
    (AppUpdater as any)._updaterStatus = UpdateStatus.Idle;

    expect((AppUpdater as any)._status).toBe(UpdateStatus.Idle);

    (AppUpdater as any)._status = UpdateStatus.UpdateAvailable;

    expect((AppUpdater as any)._updaterStatus).toBe(UpdateStatus.UpdateAvailable);
    expect(mockDispatch).toHaveBeenCalledWith(setUpdateStatus(UpdateStatus.UpdateAvailable));
  });
});
