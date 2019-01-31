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

import { join } from 'path';

import { SharedConstants } from '@bfemulator/app-shared';

import { AppMenuBuilder } from './appMenuBuilder';

jest.mock('./settingsData/store', () => ({
  getStore: () => ({
    getState: () => ({
      azure: { signedInUser: 'TheAmazingAuthLad@hotmail.com' },
      windowState: {
        availableThemes: [{ name: 'light' }, { name: 'dark' }, { name: 'midnight' }],
        theme: 'midnight',
      },
    }),
  }),
}));

let mockBuildFromTemplate;
let mockGetApplicationMenu;
let mockSetApplicationMenu;
const mockMenuClassAppend = jest.fn(() => null);
jest.mock('electron', () => ({
  app: {
    getName: () => 'bot-framework-emulator',
    getVersion: () => '4.2.0',
  },
  Menu: class {
    append = mockMenuClassAppend;
    items: any[] = [];
    static get buildFromTemplate() {
      return mockBuildFromTemplate;
    }
    static get getApplicationMenu() {
      return mockGetApplicationMenu;
    }
    static get setApplicationMenu() {
      return mockSetApplicationMenu;
    }
  },
  MenuItem: class {
    label: string;
    click: () => any;
    constructor(options: any) {
      this.label = options.label;
      this.click = options.click;
    }
  },
}));

const mockUpdateStatus = {
  Idle: 0,
  UpdateAvailable: 1,
  UpdateDownloading: 2,
  UpdateReadyToInstall: 3,
};
const mockAppUpdater = {
  status: mockUpdateStatus.Idle,
};
jest.mock('./appUpdater', () => ({
  get AppUpdater() {
    return mockAppUpdater;
  },
  get UpdateStatus() {
    return mockUpdateStatus;
  },
}));

let mockRemoteCall = () => null;
jest.mock('./emulator', () => ({}));
jest.mock('./main', () => ({
  mainWindow: {
    commandService: {
      get remoteCall() {
        return mockRemoteCall;
      },
    },
  },
}));

describe('AppMenuBuilder', () => {
  const mockSendActivityMenu = {
    submenu: {
      items: [{ label: 'userAdded' }, { label: 'userRemoved' }, { label: 'typing' }],
    },
  };
  const mockRecentBotsMenuClear = jest.fn(() => null);
  let mockAppendedBots;
  const mockRecentBotsMenuAppend = jest.fn(botItem => mockAppendedBots.push(botItem));
  const mockRecentBotsMenu = {
    enabled: false,
    submenu: {
      append: mockRecentBotsMenuAppend,
      clear: mockRecentBotsMenuClear,
      items: [{ label: 'localhost:3978' }, { label: 'echo-bot' }, { label: 'TestBotV4' }],
    },
  };
  const mockAutoUpdateRestartMenuItem = { visible: false };
  const mockAutoUpdateCheckMenuItem = { visible: false };
  const mockAutoUpdateDownloadingMenuItem = { visible: false };
  let appendedFileMenuItems;
  const mockFileMenuAppend = jest.fn(fileMenuItem => appendedFileMenuItems.push(fileMenuItem));
  const mockFileMenuClear = jest.fn(() => null);
  const mockFileMenu = {
    submenu: {
      append: mockFileMenuAppend,
      clear: mockFileMenuClear,
    },
  };
  let mockGetMenuItemById;
  let processPlatformBackup;

  beforeEach(() => {
    processPlatformBackup = process.platform;
    mockAppendedBots = [];
    appendedFileMenuItems = [];

    mockGetMenuItemById = jest.fn((id: string) => {
      switch (id) {
        case 'send-activity':
          return mockSendActivityMenu;

        case 'recent-bots':
          return mockRecentBotsMenu;

        case 'auto-update-restart':
          return mockAutoUpdateRestartMenuItem;

        case 'auto-update-check':
          return mockAutoUpdateCheckMenuItem;

        case 'auto-update-downloading':
          return mockAutoUpdateDownloadingMenuItem;

        case 'file':
          return mockFileMenu;

        default:
          return;
      }
    });
    mockBuildFromTemplate = jest.fn(() => null);
    mockGetApplicationMenu = jest.fn(() => ({
      getMenuItemById: mockGetMenuItemById,
    }));
    mockSetApplicationMenu = jest.fn(() => null);
  });

  afterEach(() => {
    Object.defineProperty(process, 'platform', {
      value: processPlatformBackup,
    });
  });

  it('should get the send activity menu items', () => {
    expect(AppMenuBuilder.sendActivityMenuItems).toEqual(mockSendActivityMenu.submenu.items);
    expect(mockGetMenuItemById).toHaveBeenCalledWith('send-activity');

    // shouldn't return anything if menu is falsy
    mockGetApplicationMenu = jest.fn(() => null);
    expect(AppMenuBuilder.sendActivityMenuItems).toEqual([]);
  });

  it('should get the recent bots menu items', () => {
    expect(AppMenuBuilder.recentBotsMenuItems).toEqual(mockRecentBotsMenu.submenu.items);
    expect(mockGetMenuItemById).toHaveBeenCalledWith('recent-bots');

    // shouldn't return anything if menu is falsy
    mockGetApplicationMenu = jest.fn(() => null);
    expect(AppMenuBuilder.recentBotsMenuItems).toEqual([]);
  });

  it('should refresh the app update menu', () => {
    mockAppUpdater.status = mockUpdateStatus.Idle;
    AppMenuBuilder.refreshAppUpdateMenu();

    expect(mockAutoUpdateRestartMenuItem.visible).toBe(false);
    expect(mockAutoUpdateCheckMenuItem.visible).toBe(true);
    expect(mockAutoUpdateDownloadingMenuItem.visible).toBe(false);

    mockAppUpdater.status = mockUpdateStatus.UpdateAvailable;
    AppMenuBuilder.refreshAppUpdateMenu();

    expect(mockAutoUpdateRestartMenuItem.visible).toBe(false);
    expect(mockAutoUpdateCheckMenuItem.visible).toBe(true);
    expect(mockAutoUpdateDownloadingMenuItem.visible).toBe(false);

    mockAppUpdater.status = mockUpdateStatus.UpdateReadyToInstall;
    AppMenuBuilder.refreshAppUpdateMenu();

    expect(mockAutoUpdateRestartMenuItem.visible).toBe(true);
    expect(mockAutoUpdateCheckMenuItem.visible).toBe(false);
    expect(mockAutoUpdateDownloadingMenuItem.visible).toBe(false);

    mockAppUpdater.status = mockUpdateStatus.UpdateDownloading;
    AppMenuBuilder.refreshAppUpdateMenu();

    expect(mockAutoUpdateRestartMenuItem.visible).toBe(false);
    expect(mockAutoUpdateCheckMenuItem.visible).toBe(false);
    expect(mockAutoUpdateDownloadingMenuItem.visible).toBe(true);
  });

  it('should update the recent bots list', () => {
    mockRemoteCall = jest.fn((..._args) => Promise.resolve(null));
    const mockBotPath = join('path', 'to', 'bot');
    const mockRecentBots = [
      { displayName: 'bot1', path: mockBotPath },
      { displayName: 'bot2' },
      { displayName: 'bot3' },
    ];
    AppMenuBuilder.updateRecentBotsList(mockRecentBots);

    expect(mockRecentBotsMenuClear).toHaveBeenCalled();
    expect(mockRecentBotsMenuAppend).toHaveBeenCalledTimes(mockRecentBots.length);
    expect(mockAppendedBots.some(bot => bot.label === 'bot1')).toBe(true);
    expect(mockAppendedBots.some(bot => bot.label === 'bot2')).toBe(true);
    expect(mockAppendedBots.some(bot => bot.label === 'bot3')).toBe(true);
    const botWithPath = mockAppendedBots.find(bot => bot.label === 'bot1');
    botWithPath.click();
    expect(mockRemoteCall).toHaveBeenCalledWith(SharedConstants.Commands.Bot.Switch, mockBotPath);
    expect(mockRecentBotsMenu.enabled).toBe(true);
  });

  it('should refresh the file menu', () => {
    const mockFileItems = ['fileItem1', 'fileItem2', 'fileItem3'];
    mockBuildFromTemplate = jest.fn(() => ({
      items: mockFileItems,
    }));

    AppMenuBuilder.refreshFileMenu();

    // should copy over the previous "Recent Bots" menu items
    expect(mockMenuClassAppend).toHaveBeenCalledTimes(3);
    expect(mockMenuClassAppend).toHaveBeenCalledWith(mockRecentBotsMenu.submenu.items[0]);
    expect(mockMenuClassAppend).toHaveBeenCalledWith(mockRecentBotsMenu.submenu.items[1]);
    expect(mockMenuClassAppend).toHaveBeenCalledWith(mockRecentBotsMenu.submenu.items[2]);

    // build the new file menu and copy all the items over
    expect(mockBuildFromTemplate).toHaveBeenCalledTimes(1);
    expect(mockFileMenuClear).toHaveBeenCalled();
    expect(mockFileMenuAppend).toHaveBeenCalledTimes(mockFileItems.length);
    expect(mockFileMenuAppend).toHaveBeenCalledWith(mockFileItems[0]);
    expect(mockFileMenuAppend).toHaveBeenCalledWith(mockFileItems[1]);
    expect(mockFileMenuAppend).toHaveBeenCalledWith(mockFileItems[2]);
  });

  it('should initialize the app menu for Win / Linux', async () => {
    let appMenuTemplate;
    mockBuildFromTemplate = jest.fn(template => {
      // when trying to build from the template, pull the template out
      // so that we can examine it and return some menu placeholder
      appMenuTemplate = template;
      return 'I am a menu';
    });
    const mockState = {
      chat: {
        chats: {
          someDocId: {
            conversationId: 'someConversationId',
          },
        },
      },
      editor: {
        activeEditor: 'primary',
        editors: {
          primary: {
            activeDocumentId: 'someDocId',
            documents: {
              someDocId: {
                contentType: SharedConstants.ContentTypes.CONTENT_TYPE_LIVE_CHAT,
              },
            },
          },
        },
      },
    };
    mockRemoteCall = jest.fn(commandName => {
      if ((commandName = SharedConstants.Commands.Misc.GetStoreState)) {
        return Promise.resolve(mockState);
      } else {
        return Promise.resolve({});
      }
    });
    Object.defineProperty(process, 'platform', { value: 'win32' });
    await AppMenuBuilder.initAppMenu();

    // verify that each section of the menu is the expected length
    expect(appMenuTemplate).toHaveLength(5); // file, edit, view, convo, help

    const fileMenuTemplate = appMenuTemplate[0].submenu;
    expect(fileMenuTemplate).toHaveLength(16);

    // should show the currently signed in user
    const azureSignInItem = fileMenuTemplate[9];
    expect(azureSignInItem.label).toBe('Sign out (TheAmazingAuthLad@hotmail.com)');

    // should list all available themes and selected theme (midnight) as checked
    const themeMenu = fileMenuTemplate[11];
    expect(themeMenu.label).toBe('Themes');
    expect(themeMenu.submenu).toHaveLength(3); // light, dark, midnight
    expect(themeMenu.submenu[2].label).toBe('midnight');
    expect(themeMenu.submenu[2].checked).toBe(true);

    const editMenuTemplate = appMenuTemplate[1].submenu;
    expect(editMenuTemplate).toHaveLength(7);

    const viewMenuTemplate = appMenuTemplate[2].submenu;
    expect(viewMenuTemplate).toHaveLength(5);

    const convoMenuTemplate = appMenuTemplate[3].submenu;
    expect(convoMenuTemplate).toHaveLength(1);
    const sendActivityMenu = convoMenuTemplate[0].submenu;
    expect(sendActivityMenu).toHaveLength(7);

    const helpMenuTemplate = appMenuTemplate[4].submenu;
    expect(helpMenuTemplate).toHaveLength(13);

    expect(mockSetApplicationMenu).toHaveBeenCalledWith('I am a menu');
  });

  it('should initialize the app menu for Mac', async () => {
    let appMenuTemplate;
    mockBuildFromTemplate = jest.fn(template => {
      // when trying to build from the template, pull the template out
      // so that we can examine it and return some menu placeholder
      appMenuTemplate = template;
      return 'I am a menu';
    });
    const mockState = {
      chat: {
        chats: {
          someDocId: {
            conversationId: 'someConversationId',
          },
        },
      },
      editor: {
        activeEditor: 'primary',
        editors: {
          primary: {
            activeDocumentId: 'someDocId',
            documents: {
              someDocId: {
                contentType: SharedConstants.ContentTypes.CONTENT_TYPE_LIVE_CHAT,
              },
            },
          },
        },
      },
    };
    mockRemoteCall = jest.fn(commandName => {
      if ((commandName = SharedConstants.Commands.Misc.GetStoreState)) {
        return Promise.resolve(mockState);
      } else {
        return Promise.resolve({});
      }
    });
    Object.defineProperty(process, 'platform', { value: 'darwin' });
    await AppMenuBuilder.initAppMenu();

    // verify that each section of the menu is the expected length
    expect(appMenuTemplate).toHaveLength(7); // app, file, edit, view, window, convo, help

    const macAppMenuTemplate = appMenuTemplate[0].submenu;
    expect(macAppMenuTemplate).toHaveLength(9);

    const windowMenuTemplate = appMenuTemplate[4].submenu;
    expect(windowMenuTemplate).toHaveLength(5);
  });
});
