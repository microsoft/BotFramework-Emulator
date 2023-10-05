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
  invalidateArmToken,
  AzureAuthAction,
  AzureAuthWorkflow,
  EditorActions,
  NavBarActions,
  OpenEditorAction,
  SelectNavBarAction,
  SharedConstants,
} from '@bfemulator/app-shared';
import { CommandRegistry, CommandServiceImpl, CommandServiceInstance } from '@bfemulator/sdk-shared';
import * as remote from '@electron/remote';

import { CONTENT_TYPE_APP_SETTINGS, DOCUMENT_ID_APP_SETTINGS } from '../constants';
import * as editorHelpers from '../state/helpers/editorHelpers';
import { store } from '../state/store';
import {
  AzureLoginPromptDialogContainer,
  AzureLoginSuccessDialogContainer,
  BotCreationDialogContainer,
  DialogService,
  OpenBotDialogContainer,
  SecretPromptDialogContainer,
} from '../ui/dialogs';

import { UiCommands } from './uiCommands';

jest.mock('electron', () => ({
  remote: {
    app: {
      isPackaged: false,
    },
    getCurrentWindow: (() => {
      const currentWindow = {
        setFullScreen(value: boolean) {
          this._fullScreen = value;
        },
        isFullScreen(value: boolean) {
          return this._fullsScreen;
        },
      };
      return () => currentWindow;
    })(),
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

const Commands = SharedConstants.Commands.UI;

describe('the uiCommands', () => {
  let commandService: CommandServiceImpl;
  let registry: CommandRegistry;
  beforeAll(() => {
    new UiCommands();
    const decorator = CommandServiceInstance();
    const descriptor = decorator({ descriptor: {} }, 'none') as any;
    commandService = descriptor.descriptor.get();
    registry = commandService.registry;
  });

  it('should showExplorer the welcome page when the ShowWelcomePage command is dispatched', async () => {
    const spy = jest.spyOn(editorHelpers, 'showWelcomePage');
    await registry.getCommand(Commands.ShowWelcomePage)();
    expect(spy).toHaveBeenCalled();
  });

  it('should call DialogService.showDialog when the ShowBotCreationDialog command is dispatched', async () => {
    const spy = jest.spyOn(DialogService, 'showDialog').mockResolvedValueOnce(true);
    const result = await registry.getCommand(Commands.ShowBotCreationDialog)();
    expect(spy).toHaveBeenCalledWith(BotCreationDialogContainer);
    expect(result).toBe(true);
  });

  it('should call DialogService.showDialog when the ShowSecretPromptDialog command is dispatched', async () => {
    const spy = jest.spyOn(DialogService, 'showDialog').mockResolvedValueOnce(true);
    const result = await registry.getCommand(Commands.ShowSecretPromptDialog)();
    expect(spy).toHaveBeenCalledWith(SecretPromptDialogContainer);
    expect(result).toBe(true);
  });

  it('should call DialogService.showDialog when the ShowOpenBotDialog command is dispatched', async () => {
    const spy = jest.spyOn(DialogService, 'showDialog').mockResolvedValue(true);
    const result = await registry.getCommand(Commands.ShowOpenBotDialog)();
    expect(spy).toHaveBeenCalledWith(OpenBotDialogContainer, { isDebug: false, mode: undefined });
    expect(result).toBe(true);

    await registry.getCommand(Commands.ShowOpenBotDialog)(true);
    expect(spy).toHaveBeenCalledWith(OpenBotDialogContainer, { isDebug: true, mode: 'debug' });
  });

  describe('should dispatch the appropriate action to the store', () => {
    it('when the SwitchNavBarTab command is dispatched', () => {
      // eslint-disable-next-line prefer-const
      let arg: SelectNavBarAction = {} as SelectNavBarAction;
      store.dispatch = action => ((arg as any) = action);
      registry.getCommand(Commands.SwitchNavBarTab)('Do it Nauuuw!');
      expect(arg.type).toBe(NavBarActions.select);
      expect(arg.payload.selection).toBe('Do it Nauuuw!');
    });

    it('when the ShowAppSettings command is dispatched', () => {
      // eslint-disable-next-line prefer-const
      let arg: OpenEditorAction = {} as OpenEditorAction;
      store.dispatch = action => ((arg as any) = action);
      registry.getCommand(Commands.ShowAppSettings)();
      expect(arg.type).toBe(EditorActions.open);
      expect(arg.payload.contentType).toBe(CONTENT_TYPE_APP_SETTINGS);
      expect(arg.payload.documentId).toBe(DOCUMENT_ID_APP_SETTINGS);
      expect(arg.payload.isGlobal).toBe(true);
    });

    it('when the SignInToAzure command is dispatched', async () => {
      // eslint-disable-next-line prefer-const
      let arg: AzureAuthAction<AzureAuthWorkflow> = {} as AzureAuthAction<AzureAuthWorkflow>;
      store.dispatch = action => ((arg as any) = action);
      registry.getCommand(Commands.SignInToAzure)();
      expect(arg.payload.loginSuccessDialog).toBe(AzureLoginSuccessDialogContainer);
      expect(arg.payload.promptDialog).toBe(AzureLoginPromptDialogContainer);
    });

    it('when the InvalidateArmToken command is dispatched', async () => {
      // eslint-disable-next-line prefer-const
      let arg: AzureAuthAction<void> = {} as AzureAuthAction<void>;
      store.dispatch = action => ((arg as any) = action);
      registry.getCommand(Commands.InvalidateAzureArmToken)();
      expect(arg).toEqual(invalidateArmToken());
    });
  });

  it('should set the proper href on the theme tag when the SwitchTheme command is dispatched', () => {
    const remoteCallSpy = jest.spyOn(commandService, 'remoteCall');
    const link = document.createElement('link');
    link.id = 'themeVars';
    document.querySelector('head').appendChild(link);
    registry.getCommand(Commands.SwitchTheme)('light', './light.css');
    expect(link.href).toBe('http://localhost/light.css');
    expect(remoteCallSpy).toHaveBeenCalledWith(SharedConstants.Commands.Telemetry.TrackEvent, 'app_chooseTheme', {
      themeName: 'light',
    });
  });

  describe('when showing the markdow page', () => {
    it('should detect when the user is offline', async () => {
      const dispatchedActions = [];
      store.dispatch = action => {
        dispatchedActions.push(action);
        return action;
      };
      await registry.getCommand(Commands.ShowMarkdownPage)('http://localhost', 'Yo!', { navigator: { onLine: false } });
      expect(dispatchedActions.length).toBe(1);
      expect(dispatchedActions[0].payload.meta).toEqual({
        markdown: '',
        label: 'Yo!',
        onLine: false,
      });
    });

    it('should detect when the user has no internet even though they are connected to a network', async () => {
      const dispatchedActions = [];
      store.dispatch = action => {
        dispatchedActions.push(action);
        return action;
      };
      jest.spyOn(commandService, 'remoteCall').mockRejectedValueOnce('oh noes! ENOTFOUND');
      await registry.getCommand(Commands.ShowMarkdownPage)('http://localhost', 'Yo!', { navigator: { onLine: true } });
      expect(dispatchedActions.length).toBe(1);
      expect(dispatchedActions[0].payload.meta).toEqual({
        markdown: '',
        label: 'Yo!',
        onLine: false,
      });
    });

    it('should attempt to fetch the markdown and decode it from a Uint8Array', async () => {
      const dispatchedActions = [];
      store.dispatch = action => {
        dispatchedActions.push(action);
        return action;
      };
      jest.spyOn(commandService, 'remoteCall').mockResolvedValueOnce(true);
      await registry.getCommand(Commands.ShowMarkdownPage)('http://localhost', 'Yo!', { navigator: { onLine: true } });
      expect(dispatchedActions.length).toBe(1);
      expect(dispatchedActions[0].payload).toEqual({
        contentType: 'application/vnd.microsoft.bfemulator.document.markdown',
        documentId: 'markdown-page',
        isGlobal: true,
        meta: {
          markdown: 'Hi! I am in your decode',
          label: 'Yo!',
          onLine: true,
        },
      });
    });
  });

  it('should set full screen mode', async () => {
    const handler = registry.getCommand(SharedConstants.Commands.UI.ToggleFullScreen);
    const fullScreenSpy = jest.spyOn(remote.getCurrentWindow(), 'setFullScreen');

    await handler(true);
    expect(fullScreenSpy).toHaveBeenCalledWith(true);
  });

  it('should leave full screen mode', async () => {
    const handler = registry.getCommand(SharedConstants.Commands.UI.ToggleFullScreen);
    const fullScreenSpy = jest.spyOn(remote.getCurrentWindow(), 'setFullScreen');

    await handler(false);
    expect(fullScreenSpy).toHaveBeenCalledWith(false);
  });
});
