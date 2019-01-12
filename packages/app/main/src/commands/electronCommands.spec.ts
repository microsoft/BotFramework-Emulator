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

import "../fetchProxy";
import { SharedConstants } from "@bfemulator/app-shared";
import { CommandRegistryImpl } from "@bfemulator/sdk-shared";
import * as Electron from "electron";
import { load } from "../botData/actions/botActions";
import { getStore } from "../botData/store";
import { mainWindow } from "../main";
import { registerCommands } from "./electronCommands";

let renameArgs;
jest.mock("fs-extra", () => ({
  stat: async () => ({ isFile: () => true }),
  statSync: () => ({ isFile: () => false }),
  pathExists: async (path: string = "") => !path.includes("error"),
  rename: async (...args: any[]) => (renameArgs = args)
}));

jest.mock("electron", () => ({
  app: {
    getName: () => "BotFramework Emulator",
    setName: (name: string) => void 0,
    getVersion: () => "4.x"
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

jest.mock("../main", () => ({
  mainWindow: {
    browserWindow: {
      setFullScreen: () => void 0,
      setTitle: () => void 0
    },
    commandService: {
      remoteCall: command => {
        if (command === "store:get-state") {
          return {
            chat: {
              chats: {
                "document-id": {
                  conversationId: "conversation-id"
                }
              }
            },
            editor: {
              activeEditor: "active-editor-id",
              editors: {
                "active-editor-id": {
                  activeDocumentId: "document-id",
                  documents: {
                    "document-id": {
                      contentType:
                        "application/vnd.microsoft.bfemulator.document.livechat"
                    }
                  }
                }
              }
            }
          };
        } else {
          throw new Error("mock not implemented");
        }
      }
    }
  }
}));

jest.mock("mkdirp", () => ({
  sync: () => ({})
}));

jest.mock("../utils/ensureStoragePath", () => ({
  ensureStoragePath: () => ""
}));

let mockRefreshFileMenu;
let mockUpdateRecentBotsList;
let mockInitAppMenu;
let mockSendActivityMenuItems;
jest.mock("../appMenuBuilder", () => ({
  get AppMenuBuilder() {
    return class {
      static sendActivityMenuItems = mockSendActivityMenuItems;
      static get initAppMenu() {
        return mockInitAppMenu;
      }
      static get refreshFileMenu() {
        return mockRefreshFileMenu;
      }
      static get updateRecentBotsList() {
        return mockUpdateRecentBotsList;
      }
    };
  }
}));

const mockCommandRegistry = new CommandRegistryImpl();
registerCommands(mockCommandRegistry);

describe("the electron commands", () => {
  it("should show a message box", async () => {
    const { handler } = mockCommandRegistry.getCommand(
      SharedConstants.Commands.Electron.ShowMessageBox
    );
    const showMessageBoxSpy = jest.spyOn(Electron.dialog, "showMessageBox");
    await handler(true, {});
    expect(showMessageBoxSpy).toHaveBeenCalledWith(mainWindow.browserWindow, {
      message: "",
      title: "BotFramework Emulator"
    });
  });

  it("should show the open dialog", async () => {
    const { handler } = mockCommandRegistry.getCommand(
      SharedConstants.Commands.Electron.ShowOpenDialog
    );
    const showOpenDialogSpy = jest.spyOn(Electron.dialog, "showOpenDialog");
    await handler({});

    expect(showOpenDialogSpy).toHaveBeenCalledWith(
      mainWindow.browserWindow,
      {}
    );
  });

  it("should show the save dialog", async () => {
    const { handler } = mockCommandRegistry.getCommand(
      SharedConstants.Commands.Electron.ShowSaveDialog
    );
    const showSaveDialogSpy = jest.spyOn(Electron.dialog, "showSaveDialog");

    await handler({});
    expect(showSaveDialogSpy).toHaveBeenCalledWith(
      mainWindow.browserWindow,
      {}
    );
  });

  it("should update the file menu", async () => {
    const { handler } = mockCommandRegistry.getCommand(
      SharedConstants.Commands.Electron.UpdateFileMenu
    );
    const mockBotInfo = {
      path: "this/is/my.json",
      displayName: "AuthBot",
      secret: "secret"
    };
    const store = getStore();
    store.dispatch(load([mockBotInfo]));

    mockRefreshFileMenu = jest.fn(() => null);
    mockUpdateRecentBotsList = jest.fn(() => null);

    await handler();

    expect(mockRefreshFileMenu).toHaveBeenCalled();
    expect(mockUpdateRecentBotsList).toHaveBeenCalledWith([mockBotInfo]);
  });

  it("should update the conversation menu", async () => {
    const { handler } = mockCommandRegistry.getCommand(
      SharedConstants.Commands.Electron.UpdateConversationMenu
    );
    const mockEditorState = {
      activeEditor: "primary",
      editors: {
        primary: {
          activeDocumentId: "someLiveChatDoc",
          documents: {
            someLiveChatDoc: {
              contentType: SharedConstants.ContentTypes.CONTENT_TYPE_LIVE_CHAT
            }
          }
        }
      }
    };
    mockSendActivityMenuItems = [
      { label: "sendConversationUpdate", enabled: false },
      { label: "sendTyping", enabled: false },
      { label: "ping", enabled: false }
    ];

    await handler(mockEditorState);

    // should enable all send activity menu items
    expect(mockSendActivityMenuItems.some(item => !item.enabled)).toBe(false);
  });

  it("should set full screen mode and set the application menu to null", async () => {
    const { handler } = mockCommandRegistry.getCommand(
      SharedConstants.Commands.Electron.SetFullscreen
    );
    const fullScreenSpy = jest.spyOn(mainWindow.browserWindow, "setFullScreen");
    const setApplicationMenuSpy = jest.spyOn(
      Electron.Menu,
      "setApplicationMenu"
    );

    await handler(true);
    expect(fullScreenSpy).toHaveBeenCalledWith(true);
    expect(setApplicationMenuSpy).toHaveBeenCalledWith(null);
  });

  it("should remove full screen mode and set the application menu back to normal", async () => {
    const { handler } = mockCommandRegistry.getCommand(
      SharedConstants.Commands.Electron.SetFullscreen
    );
    const fullScreenSpy = jest.spyOn(mainWindow.browserWindow, "setFullScreen");
    mockInitAppMenu = jest.fn(() => null);

    await handler(false);
    expect(fullScreenSpy).toHaveBeenCalledWith(false);
    expect(mockInitAppMenu).toHaveBeenCalled();
  });

  it("should set the title bar", async () => {
    const { handler } = mockCommandRegistry.getCommand(
      SharedConstants.Commands.Electron.SetTitleBar
    );
    let setTitleSpy = jest.spyOn(mainWindow.browserWindow, "setTitle");

    await handler();
    expect(setTitleSpy).toHaveBeenCalledWith(Electron.app.getName());

    setTitleSpy = jest.spyOn(mainWindow.browserWindow, "setTitle");
    await handler("preview");
    expect(setTitleSpy).toHaveBeenCalledWith(
      `${Electron.app.getName()} - preview`
    );
  });

  it("should rename a file", async () => {
    const { handler } = mockCommandRegistry.getCommand(
      SharedConstants.Commands.Electron.RenameFile
    );
    await handler({ path: "my/path/bot.bot", newPath: "my/path/bot1.bot" });
    expect(renameArgs).toEqual(["my/path/bot.bot", "my/path/bot1.bot"]);
  });

  it("should throw if the file to rename does not exist", async () => {
    const { handler } = mockCommandRegistry.getCommand(
      SharedConstants.Commands.Electron.RenameFile
    );
    let threw = false;
    try {
      await handler({ path: "error/bot.bot", newPath: "error/bot1.bot" });
    } catch (error) {
      expect(error.message).toBe(
        `Cannot rename File: error/bot.bot does not exist`
      );
      threw = true;
    }
    expect(threw).toBeTruthy();
  });
});
