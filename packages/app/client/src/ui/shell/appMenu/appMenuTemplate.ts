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

import { CommandServiceInstance, CommandServiceImpl } from '@bfemulator/sdk-shared';
import { MenuItem } from '@bfemulator/ui-react';
import { SharedConstants } from '@bfemulator/app-shared';
import * as remote from '@electron/remote';

const {
  Channels: { HelpLabel, ReadmeUrl },
  Commands: {
    Bot: { Close },
    Electron: { OpenExternal, ShowMessageBox },
    Emulator: {
      ClearState,
      GetServiceUrl,
      PromptToOpenTranscript,
      SendConversationUpdateUserAdded,
      SendBotContactAdded,
      SendBotContactRemoved,
      SendTyping,
      SendPing,
      SendDeleteUserData,
    },
    UI: {
      ShowBotCreationDialog,
      ShowCustomActivityEditor,
      ShowMarkdownPage,
      ShowOpenBotDialog,
      ShowWelcomePage,
      ToggleFullScreen,
    },
  },
} = SharedConstants;

const CtrlOrCmd = process.platform === 'darwin' ? 'Cmd' : 'Ctrl';

export class AppMenuTemplate {
  @CommandServiceInstance()
  private static commandService: CommandServiceImpl;

  public static get template(): { [key: string]: MenuItem[] } {
    return {
      file: this.fileMenu,
      debug: this.debugMenu,
      edit: this.editMenu,
      view: this.viewMenu,
      conversation: this.conversationMenu,
      help: this.helpMenu,
    };
  }

  private static get fileMenu(): MenuItem[] {
    return [
      {
        label: 'New Bot Configuration...',
        onClick: () => AppMenuTemplate.commandService.call(ShowBotCreationDialog),
        subtext: `${CtrlOrCmd}+N`,
      },
      { type: 'separator' },
      {
        label: 'Open Bot',
        onClick: () => AppMenuTemplate.commandService.call(ShowOpenBotDialog),
        subtext: `${CtrlOrCmd}+O`,
      },
      {
        label: 'Open Recent...',
        type: 'submenu',
        items: [], // will be populated later
      },
      { type: 'separator' },
      { label: 'Open Transcript...', onClick: () => AppMenuTemplate.commandService.call(PromptToOpenTranscript) },
      { type: 'separator' },
      { label: 'Close tab', disabled: true, onClick: () => AppMenuTemplate.commandService.call(Close) },
      { type: 'separator' },
      { label: 'Sign in with Azure' }, // onClick defined later
      { label: 'Clear state', onClick: async () => await AppMenuTemplate.commandService.remoteCall(ClearState) },
      { type: 'separator' },
      {
        label: 'Themes',
        type: 'submenu',
        items: [], // will be populated later
      },
      { type: 'separator' },
      {
        label: 'Copy Emulator service URL',
        onClick: async () => {
          const url: string = await AppMenuTemplate.commandService.remoteCall(GetServiceUrl);
          remote.clipboard.writeText(url);
        },
      },
      { type: 'separator' },
      { label: 'Exit', onClick: () => remote.app.quit() },
    ];
  }

  private static get debugMenu(): MenuItem[] {
    return [{ label: 'Start Debugging', onClick: () => AppMenuTemplate.commandService.call(ShowOpenBotDialog, true) }];
  }

  private static get editMenu(): MenuItem[] {
    return [
      { label: 'Undo', onClick: () => remote.getCurrentWebContents().undo(), subtext: `${CtrlOrCmd}+Z` },
      { label: 'Redo', onClick: () => remote.getCurrentWebContents().redo(), subtext: `${CtrlOrCmd}+Y` },
      { type: 'separator' },
      { label: 'Cut', onClick: () => remote.getCurrentWebContents().cut(), subtext: `${CtrlOrCmd}+X` },
      { label: 'Copy', onClick: () => remote.getCurrentWebContents().copy(), subtext: `${CtrlOrCmd}+C` },
      { label: 'Paste', onClick: () => remote.getCurrentWebContents().paste(), subtext: `${CtrlOrCmd}+V` },
      { label: 'Delete', onClick: () => remote.getCurrentWebContents().delete() },
    ];
  }

  private static get viewMenu(): MenuItem[] {
    const maxZoomFactor = 3; // 300%
    const minZoomFactor = 0.25; // 25%;

    return [
      { label: 'Reset Zoom', onClick: () => remote.getCurrentWebContents().setZoomLevel(0), subtext: `${CtrlOrCmd}+0` },
      {
        label: 'Zoom In',
        onClick: () => {
          const webContents = remote.getCurrentWebContents();
          const zoomFactor = webContents.getZoomFactor();
          const newZoomFactor = zoomFactor + 0.1;
          if (newZoomFactor >= maxZoomFactor) {
            webContents.setZoomFactor(maxZoomFactor);
          } else {
            webContents.setZoomFactor(newZoomFactor);
          }
        },
        subtext: `${CtrlOrCmd}+=`,
      },
      {
        label: 'Zoom Out',
        onClick: () => {
          const webContents = remote.getCurrentWebContents();
          const zoomFactor = webContents.getZoomFactor();
          const newZoomFactor = zoomFactor - 0.1;
          if (newZoomFactor <= minZoomFactor) {
            webContents.setZoomFactor(minZoomFactor);
          } else {
            webContents.setZoomFactor(newZoomFactor);
          }
        },
        subtext: `${CtrlOrCmd}+-`,
      },
      { type: 'separator' },
      {
        label: 'Toggle Full Screen',
        onClick: async () => {
          await AppMenuTemplate.commandService.call(ToggleFullScreen);
        },
        subtext: 'F11',
      },
      {
        label: 'Toggle Developer Tools',
        onClick: () => remote.getCurrentWebContents().toggleDevTools(),
        subtext: `${CtrlOrCmd}+Shift+I`,
      },
    ];
  }

  private static get conversationMenu(): MenuItem[] {
    return [
      {
        label: 'Send System Activity',
        type: 'submenu',
        items: [
          {
            label: 'Custom activity (New)',
            onClick: () => AppMenuTemplate.commandService.call(ShowCustomActivityEditor),
          },
          {
            label: 'conversationUpdate ( user added )',
            onClick: () => AppMenuTemplate.commandService.remoteCall(SendConversationUpdateUserAdded),
          },
          {
            label: 'contactRelationUpdate ( bot added )',
            onClick: () => AppMenuTemplate.commandService.remoteCall(SendBotContactAdded),
          },
          {
            label: 'contactRelationUpdate ( bot removed )',
            onClick: () => AppMenuTemplate.commandService.remoteCall(SendBotContactRemoved),
          },
          {
            label: 'typing',
            onClick: () => AppMenuTemplate.commandService.remoteCall(SendTyping),
          },
          {
            label: 'ping',
            onClick: () => AppMenuTemplate.commandService.remoteCall(SendPing),
          },
          {
            label: 'deleteUserData',
            onClick: () => AppMenuTemplate.commandService.remoteCall(SendDeleteUserData),
          },
        ],
      },
    ];
  }

  private static get helpMenu(): MenuItem[] {
    const { openLink } = this;
    const appName = remote.app.getName();
    const appVersion = remote.app.getVersion();

    return [
      { label: 'Welcome', onClick: () => AppMenuTemplate.commandService.call(ShowWelcomePage) },
      { type: 'separator' },
      { label: 'Privacy', onClick: openLink('https://privacy.microsoft.com/privacystatement') },
      { label: 'License', onClick: openLink('https://aka.ms/bot-framework-emulator-license') },
      { label: 'Credits', onClick: openLink('https://aka.ms/bot-framework-emulator-credits') },
      { type: 'separator' },
      { label: 'Report an issue', onClick: openLink('https://aka.ms/cy106f') },
      { type: 'separator' },
      { label: 'Check for update...' }, // onClick defined later
      { type: 'separator' },
      {
        label: 'Get started with channels (Bot Inspector)',
        onClick: () => AppMenuTemplate.commandService.call(ShowMarkdownPage, ReadmeUrl, HelpLabel),
      },
      {
        label: 'About',
        onClick: () =>
          AppMenuTemplate.commandService.remoteCall(ShowMessageBox, null, {
            type: 'info',
            title: appName,
            message: appName + '\r\nversion: ' + appVersion,
            buttons: ['Dismiss'],
          }),
      },
    ];
  }

  private static openLink = (url: string) => (): void => {
    AppMenuTemplate.commandService.remoteCall(OpenExternal, url);
  };
}
