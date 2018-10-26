import { SharedConstants } from '@bfemulator/app-shared';
import { BotConfigWithPathImpl, CommandRegistryImpl } from '@bfemulator/sdk-shared';
import { AppMenuBuilder } from '../appMenuBuilder';
import { load, setActive } from '../botData/actions/botActions';
import { getStore } from '../botData/store';
import { mainWindow } from '../main';
import { getThemes, loadSettings } from '../utils';
import { registerCommands } from './electronCommands';
import * as Electron from 'electron';

jest.mock('fs-extra', () => ({
  stat: async () => ({ isFile: () => true }),
  statSync: () => ({ isFile: () => false })
  // readFile: async () => JSON.stringify((mockConversation as any).transcript)
}));

jest.mock('electron', () => ({
  app: {
    getName: () => 'BotFramework Emulator',
    setName: (name: string) => void 0,
    getVersion: () => '4.x'
  },
  Menu: {
    setApplicationMenu: () => void 0,
    buildFromTemplate: () => void 0
  },
  dialog: {
    showMessageBox: () => void 0,
    showOpenDialog: () => void 0,
    showSaveDialog: () => void 0
  }
}));

jest.mock('../main', () => ({
  mainWindow: {
    browserWindow: { setFullScreen: () => void 0 }
  }
}));

jest.mock('mkdirp', () => ({
  sync: () => ({})
}));

jest.mock('../utils/ensureStoragePath', () => ({
  ensureStoragePath: () => ''
}));

const mockCommandRegistry = new CommandRegistryImpl();
registerCommands(mockCommandRegistry);

describe('the electron commands', () => {
  it('should show a message box', async () => {
    const { handler } = mockCommandRegistry.getCommand(SharedConstants.Commands.Electron.ShowMessageBox);
    const showMessageBoxSpy = jest.spyOn(Electron.dialog, 'showMessageBox');
    await handler(true, {});
    expect(showMessageBoxSpy).toHaveBeenCalledWith(mainWindow.browserWindow, {
      message: '',
      title: 'BotFramework Emulator'
    });
  });

  it('should show the open dialog', async () => {
    const { handler } = mockCommandRegistry.getCommand(SharedConstants.Commands.Electron.ShowOpenDialog);
    const showOpenDialogSpy = jest.spyOn(Electron.dialog, 'showOpenDialog');
    await handler({});

    expect(showOpenDialogSpy).toHaveBeenCalledWith(mainWindow.browserWindow, {});
  });

  it('should show the save dialog', async () => {
    const { handler } = mockCommandRegistry.getCommand(SharedConstants.Commands.Electron.ShowSaveDialog);
    const showSaveDialogSpy = jest.spyOn(Electron.dialog, 'showSaveDialog');

    await handler({});
    expect(showSaveDialogSpy).toHaveBeenCalledWith(mainWindow.browserWindow, {});
  });

  it('should update the file menu', async () => {
    const { handler } = mockCommandRegistry.getCommand(SharedConstants.Commands.Electron.UpdateFileMenu);
    const mockBotInfo = {
      path: 'this/is/my.json',
      displayName: 'AuthBot',
      secret: 'secret'
    };
    const store = getStore();
    store.dispatch(load([mockBotInfo]));

    const buildMenuFromTemplateSpy = jest.spyOn(Electron.Menu, 'buildFromTemplate');
    const setApplicationMenuSpy = jest.spyOn(Electron.Menu, 'setApplicationMenu');

    await handler();

    expect(buildMenuFromTemplateSpy).toHaveBeenCalled();
    expect(setApplicationMenuSpy).toHaveBeenCalled();
  });

  it('should set full screen mode and set the application menu to null', async () => {
    const { handler } = mockCommandRegistry.getCommand(SharedConstants.Commands.Electron.SetFullscreen);
    const fullScreenSpy = jest.spyOn(mainWindow.browserWindow, 'setFullScreen');
    const setApplicationMenuSpy = jest.spyOn(Electron.Menu, 'setApplicationMenu');

    await handler(true);
    expect(fullScreenSpy).toHaveBeenCalledWith(true);
    expect(setApplicationMenuSpy).toHaveBeenCalledWith(null);
  });

  it('should remove full screen mode and set the application menu back to normal', async () => {
    const { handler } = mockCommandRegistry.getCommand(SharedConstants.Commands.Electron.SetFullscreen);
    const fullScreenSpy = jest.spyOn(mainWindow.browserWindow, 'setFullScreen');
    const setApplicationMenuSpy = jest.spyOn(Electron.Menu, 'setApplicationMenu');
    const buildFromTemplateSpy = jest.spyOn(Electron.Menu, 'buildFromTemplate');

    await handler(false);
    expect(fullScreenSpy).toHaveBeenCalledWith(false);
    expect(buildFromTemplateSpy).toHaveBeenCalledWith(AppMenuBuilder.menuTemplate);
    expect(setApplicationMenuSpy).toHaveBeenCalledWith(undefined);
  });
});
