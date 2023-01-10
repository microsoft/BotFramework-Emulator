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

import * as React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import { MenuItem } from '@bfemulator/ui-react';
import {
  azureAuthSettings,
  bot,
  editor,
  executeCommand,
  rememberTheme,
  update,
  windowState,
  SharedConstants,
  UpdateStatus,
} from '@bfemulator/app-shared';

import { AppMenuContainer } from './appMenuContainer';
import { AppMenu, AppMenuProps } from './appMenu';
import { AppMenuTemplate } from './appMenuTemplate';

jest.mock('electron', () => ({
  ipcRenderer: {
    on: jest.fn(),
  },
  remote: {
    app: {
      getName: () => 'bfemulator',
      getVersion: () => 'v4',
    },
  },
}));

const mockStore = createStore(
  combineReducers({
    bot,
    editor,
    settings: combineReducers({
      azure: azureAuthSettings,
      windowState,
    }),
    update,
  })
);

// don't block on commands with a resolver
const dispatchSpy = jest.spyOn(mockStore, 'dispatch').mockImplementation((action: any) => {
  if (action.payload && action.payload.resolver) {
    action.payload.resolver();
  }
});

const {
  Commands: {
    Azure: { SignUserOutOfAzure },
    Bot,
    Electron: { CheckForUpdates, QuitAndInstall },
    UI: { InvalidateAzureArmToken, SignInToAzure },
  },
} = SharedConstants;

describe('<AppMenu />', () => {
  let wrapper: ReactWrapper<AppMenuProps, Record<string, unknown>, AppMenu>;
  let instance: AppMenu;
  let containerWrapper;

  beforeEach(() => {
    containerWrapper = mount(
      <Provider store={mockStore}>
        <AppMenuContainer />
      </Provider>
    );
    wrapper = containerWrapper.find(AppMenu) as ReactWrapper<AppMenuProps, Record<string, unknown>, AppMenu>;
    instance = wrapper.instance();
    dispatchSpy.mockClear();
  });

  it('should render without any errors', () => {
    expect(instance).toBeTruthy();
  });

  it('should update the menu items in the template', () => {
    instance.props = {
      ...instance.props,
      activeBot: undefined,
      activeDocumentType: SharedConstants.ContentTypes.CONTENT_TYPE_WELCOME_PAGE,
      availableThemes: [
        { name: 'Light', href: '' },
        { name: 'Dark', href: '' },
        { name: 'High contrast', href: '' },
      ],
      currentTheme: 'Light',
      recentBots: [
        { displayName: 'bot1', path: 'path1' },
        { displayName: 'bot2', path: 'path2' },
        { displayName: 'bot3', path: 'path3' },
        { displayName: 'bot4', path: 'path4' },
      ],
    };
    const menuTemplate = (instance as any).updateMenu(AppMenuTemplate.template);

    expect(Object.keys(menuTemplate)).toHaveLength(6);
    expect(menuTemplate['file'][3].items.length).toBe(4); // recent bots menu should be populated
    expect(menuTemplate['file'][9].disabled).toBe(true); // "Close tab" should be disabled
    expect(menuTemplate['file'][14].items.length).toBe(3); // themes menu should be populated
    expect(menuTemplate['conversation'][0].disabled).toBe(true); // send activity menu should be disabled on welcome page
  });

  it('should return an empty list of theme menu items when there is no current theme', () => {
    instance.props = {
      ...instance.props,
      currentTheme: undefined,
    };
    const themeItems: MenuItem[] = (instance as any).getThemeMenuItems();

    expect(themeItems).toEqual([]);
  });

  it('should generate the theme menu items', () => {
    instance.props = {
      ...instance.props,
      availableThemes: [
        { name: 'Light', href: '' },
        { name: 'Dark', href: '' },
        { name: 'High contrast', href: '' },
      ],
      currentTheme: 'Light',
    };
    const themeItems: MenuItem[] = (instance as any).getThemeMenuItems();

    expect(themeItems).toHaveLength(3);
    expect(themeItems.reduce((labels, item) => [...labels, item.label], [])).toEqual([
      'Light',
      'Dark',
      'High contrast',
    ]);
    expect(themeItems[0].checked).toBe(true); // current theme should be checked

    themeItems[1].onClick();
    expect(dispatchSpy).toHaveBeenCalledWith(rememberTheme('Dark'));
  });

  it('should generate the recent bots menu items', () => {
    instance.props = {
      ...instance.props,
      recentBots: [
        { displayName: 'bot1', path: 'path1' },
        { displayName: 'bot2', path: 'path2' },
        { displayName: 'bot3', path: 'path3' },
      ],
    };
    const recentBotsItems: MenuItem[] = (instance as any).getRecentBotsMenuItems();

    expect(recentBotsItems).toHaveLength(3);
    expect(recentBotsItems.reduce((labels, item) => [...labels, item.label], [])).toEqual(['bot1', 'bot2', 'bot3']);

    recentBotsItems[0].onClick();
    expect(dispatchSpy).toHaveBeenCalledWith(executeCommand(false, Bot.Switch, null, 'path1'));
  });

  it('should generate the recent bots menu when there are no recent bots', () => {
    instance.props = {
      ...instance.props,
      recentBots: [],
    };
    const recentBotsItems: MenuItem[] = (instance as any).getRecentBotsMenuItems();

    expect(recentBotsItems).toHaveLength(1);
    expect(recentBotsItems.reduce((labels, item) => [...labels, item.label], [])).toEqual(['No recent bots']);
  });

  it('should get an app update menu item for when an update is ready to install', () => {
    instance.props = { ...instance.props, appUpdateStatus: UpdateStatus.UpdateReadyToInstall };
    const updateItem: MenuItem = (instance as any).getAppUpdateMenuItem();

    expect(updateItem.label).toBe('Restart to update...');
    expect(updateItem.disabled).toBe(false);

    updateItem.onClick();
    expect(dispatchSpy).toHaveBeenCalledWith(executeCommand(true, QuitAndInstall, null));
  });

  it('should get an app update menu item for when the app is downloading an update', () => {
    instance.props = { ...instance.props, appUpdateStatus: UpdateStatus.UpdateDownloading };
    const updateItem: MenuItem = (instance as any).getAppUpdateMenuItem();

    expect(updateItem.label).toBe('Update downloading...');
    expect(updateItem.disabled).toBe(true);
  });

  it('should get an app update menu item for when an update is available ', () => {
    instance.props = { ...instance.props, appUpdateStatus: UpdateStatus.UpdateAvailable };
    const updateItem: MenuItem = (instance as any).getAppUpdateMenuItem();

    expect(updateItem.label).toBe('Check for update...');
    expect(updateItem.disabled).toBe(false);

    updateItem.onClick();
    expect(dispatchSpy).toHaveBeenCalledWith(executeCommand(true, CheckForUpdates, null));
  });

  it('should get an app update menu item for when the updater is idle', () => {
    instance.props = { ...instance.props, appUpdateStatus: UpdateStatus.Idle };
    const updateItem: MenuItem = (instance as any).getAppUpdateMenuItem();

    expect(updateItem.label).toBe('Check for update...');
    expect(updateItem.disabled).toBe(false);

    updateItem.onClick();
    expect(dispatchSpy).toHaveBeenCalledWith(executeCommand(true, CheckForUpdates, null));
  });

  it('should get a sign in menu item for a signed out user', async () => {
    instance.props = { ...instance.props, signedInUser: undefined };
    const signInItem: MenuItem = (instance as any).getSignInMenuItem();

    expect(signInItem.label).toBe('Sign in with Azure');

    await signInItem.onClick();

    expect(dispatchSpy).toHaveBeenCalledWith(executeCommand(false, SignInToAzure, expect.any(Function)));
  });

  it('should get a sign out menu item for a signed in user', async () => {
    instance.props = { ...instance.props, signedInUser: 'clippy@microsoft.com' };
    const signInItem: MenuItem = (instance as any).getSignInMenuItem();

    expect(signInItem.label).toBe('Sign out (clippy@microsoft.com)');

    await signInItem.onClick();

    expect(dispatchSpy).toHaveBeenCalledWith(executeCommand(true, SignUserOutOfAzure, expect.any(Function)));
    expect(dispatchSpy).toHaveBeenCalledWith(executeCommand(false, InvalidateAzureArmToken, expect.any(Function)));
  });
});
