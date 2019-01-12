import { resources } from "../reducer/resourcesReducer";
import { applyMiddleware, combineReducers, createStore } from "redux";
import { resourceSagas } from "./resourcesSagas";
import { BotConfigWithPathImpl } from "@bfemulator/sdk-shared";
import { ServiceTypes } from "botframework-config/lib/schema";
import sagaMiddlewareFactory from "redux-saga";
import {
  openContextMenuForResource,
  openResource,
  openResourcesSettings,
  renameResource
} from "../action/resourcesAction";
import { SharedConstants } from "@bfemulator/app-shared/built";
import { Component } from "react";

const sagaMiddleWare = sagaMiddlewareFactory();
const mockStore = createStore(
  combineReducers({ resources }),
  {},
  applyMiddleware(sagaMiddleWare)
);
sagaMiddleWare.run(resourceSagas);

jest.mock("../store", () => ({
  get store() {
    return mockStore;
  }
}));
jest.mock("../../ui/dialogs/service", () => ({
  DialogService: {
    showDialog: () => Promise.resolve(true),
    hideDialog: () => Promise.resolve({ path: "somePath" })
  }
}));

const mockRemoteCommandsCalled = [];
const mockLocalCommandsCalled = [];
const mockSharedConstants = SharedConstants; // thanks Jest!
let mockContextMenuResponse;
jest.mock("../../platform/commands/commandServiceImpl", () => ({
  CommandServiceImpl: {
    remoteCall: async (commandName: string, ...args: any[]) => {
      mockRemoteCommandsCalled.push({ commandName, args: args });
      switch (commandName) {
        case mockSharedConstants.Commands.Electron.DisplayContextMenu:
          return mockContextMenuResponse;

        case mockSharedConstants.Commands.Electron.ShowMessageBox:
          return 1;

        default:
          return true;
      }
    },
    call: async (commandName: string, ...args: any[]) => {
      mockLocalCommandsCalled.push({ commandName, args: args });
    }
  }
}));

describe("The ResourceSagas", () => {
  beforeEach(() => {
    mockRemoteCommandsCalled.length = 0;
    mockLocalCommandsCalled.length = 0;
  });

  describe("should open the context menu for the specified resource", () => {
    let mockResource;
    beforeEach(() => {
      mockResource = BotConfigWithPathImpl.serviceFromJSON({
        type: ServiceTypes.File,
        path: "the/file/path",
        name: "testChat"
      } as any);
    });

    it("and open the file location when chosen from the options", async () => {
      mockContextMenuResponse = { id: 0 };
      await mockStore.dispatch(openContextMenuForResource(mockResource as any));
      expect(mockRemoteCommandsCalled.length).toBe(2);
      [
        {
          commandName: "electron:display-context-menu",
          args: [
            [
              {
                label: "Open file location",
                id: 0
              },
              {
                label: "Rename",
                id: 1
              },
              {
                label: "Delete",
                id: 2
              }
            ]
          ]
        },
        {
          commandName: "shell:open-file-location",
          args: ["the/file/path"]
        }
      ].forEach((command, index) =>
        expect(mockRemoteCommandsCalled[index]).toEqual(command)
      );
    });

    it('and put the resource in the store as the "resourceToRename" property when "edit" is chosen', async () => {
      mockContextMenuResponse = { id: 1 };
      await mockStore.dispatch(openContextMenuForResource(mockResource as any));
      const { resourceToRename } = (mockStore.getState() as any).resources;
      expect(resourceToRename).toEqual(mockResource);
    });

    it('should orchestrate the removal of the file when "delete" is chosen', async () => {
      mockContextMenuResponse = { id: 2 };
      await mockStore.dispatch(openContextMenuForResource(mockResource as any));
      await Promise.resolve();
      expect(mockRemoteCommandsCalled.length).toBe(3);
      [
        {
          commandName: "electron:display-context-menu",
          args: [
            [
              { label: "Open file location", id: 0 },
              { label: "Rename", id: 1 },
              {
                label: "Delete",
                id: 2
              }
            ]
          ]
        },
        {
          commandName: "shell:showExplorer-message-box",
          args: [
            true,
            {
              type: "info",
              title: "Delete this file",
              buttons: ["Cancel", "Delete"],
              defaultId: 1,
              message:
                "This action cannot be undone. Are you sure you want to delete testChat?",
              cancelId: 0
            }
          ]
        },
        {
          commandName: "shell:unlink-file",
          args: ["the/file/path"]
        }
      ].forEach((command, index) =>
        expect(mockRemoteCommandsCalled[index]).toEqual(command)
      );
    });
  });

  describe("should orchestrate the renaming of a resource", () => {
    let mockResource;
    beforeEach(() => {
      mockResource = BotConfigWithPathImpl.serviceFromJSON({
        type: ServiceTypes.File,
        path: "the/file/path",
        name: "testChat"
      } as any);
    });

    it("and display an error dialog when the new name is invalid", async () => {
      mockResource.name = "";
      await mockStore.dispatch(renameResource(mockResource));
      expect(mockRemoteCommandsCalled.length).toBe(1);
      expect(mockRemoteCommandsCalled[0]).toEqual({
        commandName: "shell:showExplorer-message-box",
        args: [
          true,
          {
            type: "error",
            title: "Invalid file name",
            buttons: ["Ok"],
            defaultId: 1,
            message: "A valid file name must be used",
            cancelId: 0
          }
        ]
      });
    });

    it('and set the "resourceToRename" to null in the store after a successful rename', async () => {
      await mockStore.dispatch(renameResource(mockResource));
      expect(mockRemoteCommandsCalled.length).toBe(1);
      expect(mockRemoteCommandsCalled[0]).toEqual({
        args: [
          {
            name: "testChat",
            path: "the/file/path",
            type: "file"
          }
        ],
        commandName: "shell:rename-file"
      });
      const { resourceToRename } = (mockStore.getState() as any).resources;
      expect(resourceToRename).toBeNull();
    });
  });

  describe(",when opening the resource in the Emulator", () => {
    let mockResource;
    beforeEach(() => {
      mockResource = BotConfigWithPathImpl.serviceFromJSON({
        type: ServiceTypes.File,
        path: "the/file/path/chat.chat",
        name: "testChat"
      } as any);
    });

    it("should open a chat file", async () => {
      await mockStore.dispatch(openResource(mockResource as any));
      expect(mockLocalCommandsCalled).toEqual([
        {
          commandName: "chat:open",
          args: ["the/file/path/chat.chat", true]
        }
      ]);
    });

    it("should open a transcript file", async () => {
      mockResource.path = "the/file/path/transcript.transcript";
      await mockStore.dispatch(openResource(mockResource as any));
      expect(mockLocalCommandsCalled).toEqual([
        {
          commandName: "transcript:open",
          args: ["the/file/path/transcript.transcript"]
        }
      ]);
    });
  });

  it("should open the resource settings dialog and process the results as expected", async () => {
    const mockClass = class extends Component {};
    await mockStore.dispatch(openResourcesSettings({ dialog: mockClass }));
    await Promise.resolve();

    expect(mockRemoteCommandsCalled).toEqual([
      { commandName: "bot:list:patch", args: [undefined, true] }
    ]);
  });
});
