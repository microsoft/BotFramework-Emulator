import * as React from "react";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import { combineReducers, createStore } from "redux";
import { bot } from "../../../data/reducer/bot";
import { BotSettingsEditor } from "./botSettingsEditor";
import { BotSettingsEditorContainer } from "./botSettingsEditorContainer";
import { BotConfigWithPathImpl } from "@bfemulator/sdk-shared";
import { setActive } from "../../../data/action/botActions";
import { SharedConstants } from "@bfemulator/app-shared";
import * as crypto from "crypto";

const mockStore = createStore(combineReducers({ bot }));
const mockBot = BotConfigWithPathImpl.fromJSON({});
const mockElement = {
  setAttribute: () => {
    // mock
  },
  removeAttribute: () => {
    // mock
  },
  select: () => {
    // mock
  }
};
const mockWindow = {
  crypto: {
    getRandomValues: (array: Uint8Array) => {
      array.set(crypto.randomBytes(32));
    }
  },
  btoa: (bytes: any) => Buffer.from(bytes).toString("base64"),
  document: {
    getElementById: () => mockElement,
    execCommand: () => {
      // mock
    }
  }
};

jest.mock("./botSettingsEditor.scss", () => ({}));
jest.mock("../../../data/store", () => ({
  get store() {
    return mockStore;
  }
}));

jest.mock("../service", () => ({
  DialogService: {
    showDialog: () => Promise.resolve(true),
    hideDialog: () => Promise.resolve(false)
  }
}));

let mockRemoteCommandsCalled = [];
const mockSharedConstants = SharedConstants; // thanks Jest!
jest.mock("../../../platform/commands/commandServiceImpl", () => ({
  CommandServiceImpl: {
    remoteCall: async (commandName: string, ...args: any[]) => {
      mockRemoteCommandsCalled.push({ commandName, args: args });
      switch (commandName) {
        case mockSharedConstants.Commands.File.SanitizeString:
          return args[0];

        case mockSharedConstants.Commands.Electron.ShowSaveDialog:
          return "/test/path";

        default:
          return true;
      }
    }
  }
}));

jest.mock("../../../utils", () => ({
  generateBotSecret: () => {
    return Math.random() + "";
  }
}));

describe("The BotSettingsEditor dialog should", () => {
  let parent;
  let node;
  beforeEach(() => {
    mockStore.dispatch(setActive(mockBot));
    mockRemoteCommandsCalled.length = 0;
    parent = mount(
      <Provider store={mockStore}>
        <BotSettingsEditorContainer window={mockWindow} />
      </Provider>
    );
    node = parent.find(BotSettingsEditor);
  });

  it("should render deeply", () => {
    expect(parent.find(BotSettingsEditorContainer)).not.toBe(null);
    expect(parent.find(BotSettingsEditor)).not.toBe(null);
  });

  it("should contain a cancel function in the props", () => {
    expect(typeof (node.props() as any).cancel).toBe("function");
  });

  it("should update the state when the reveal key is clicked", () => {
    const instance = node.instance();
    instance.setState({ encryptKey: true });
    expect(instance.state.revealSecret).toBeFalsy();
    instance.onRevealSecretClick();
    expect(instance.state.revealSecret).toBeTruthy();
  });

  it('should copy the secret to the clipboard when "onCopyClick" is executed', () => {
    const instance = node.instance();
    instance.setState({
      encryptKey: true,
      secret:
        "MsKgJGZJw7Vqw51YwpZhw7LCk2MzwpZZwoLDkMKPIWfCq8K7wobDp8OvwqvCmsO+EAY="
    });
    const elementSpies = {
      select: jest.spyOn(mockElement, "select"),
      setAttribute: jest.spyOn(mockElement, "setAttribute"),
      removeAttribute: jest.spyOn(mockElement, "removeAttribute")
    };
    const documentSpies = {
      execCommand: jest.spyOn(mockWindow.document, "execCommand"),
      getElementById: jest.spyOn(mockWindow.document, "getElementById")
    };
    instance.onCopyClick();

    expect(elementSpies.select).toHaveBeenCalled();
    expect(elementSpies.removeAttribute).toHaveBeenCalledWith("disabled");
    expect(elementSpies.setAttribute).toHaveBeenCalledWith("disabled", "");
    expect(documentSpies.execCommand).toHaveBeenCalledWith("copy");
    expect(documentSpies.getElementById).toHaveBeenCalledWith("key-input");
  });

  // TODO: Re-enable ability to re-generate secret after 4.1
  // See 'https://github.com/Microsoft/BotFramework-Emulator/issues/964' for more information

  // it('should generate a new secret when the "onResetClick" function is executed', () => {
  //   const instance = node.instance();
  //   const secret = instance.generatedSecret;
  //   instance.onResetClick();
  //   expect(instance.generatedSecret).not.toEqual(secret);
  // });

  describe("onSaveClick", () => {
    it("should make the expected calls when saving a bot from protocol", async () => {
      const instance = node.instance();
      instance.setState({
        path: SharedConstants.TEMP_BOT_IN_MEMORY_PATH,
        secret:
          "MsKgJGZJw7Vqw51YwpZhw7LCk2MzwpZZwoLDkMKPIWfCq8K7wobDp8OvwqvCmsO+EAY="
      });
      await instance.onSaveClick();
      expect(mockRemoteCommandsCalled.length).toBe(7);
      [
        {
          commandName: "file:sanitize-string",
          args: [""]
        },
        {
          commandName: "shell:showExplorer-save-dialog",
          args: [
            {
              filters: [
                {
                  name: "Bot Files",
                  extensions: ["bot"]
                }
              ],
              defaultPath: "",
              showsTagField: false,
              title: "Save as",
              buttonLabel: "Save"
            }
          ]
        },
        {
          args: [
            "TEMP_BOT_IN_MEMORY",
            {
              displayName: "",
              path: "/test/path",
              secret:
                "MsKgJGZJw7Vqw51YwpZhw7LCk2MzwpZZwoLDkMKPIWfCq8K7wobDp8OvwqvCmsO+EAY="
            }
          ],
          commandName: "bot:list:patch"
        },
        {
          commandName: "bot:save",
          args: [
            {
              description: "",
              name: "",
              overrides: null,
              path: "/test/path",
              padlock: "",
              services: [],
              version: "2.0"
            }
          ]
        },
        {
          args: [
            {
              description: "",
              name: "",
              overrides: null,
              path: "/test/path",
              padlock: "",
              services: [],
              version: "2.0"
            }
          ],
          commandName: "bot:set-active"
        },
        {
          commandName: "menu:update-file-menu",
          args: []
        },
        {
          commandName: "electron:set-title-bar",
          args: ["/test/path"]
        }
      ].forEach((command, index) =>
        expect(mockRemoteCommandsCalled[index]).toEqual(command)
      );
    });

    it("should make the expected calls when saving a bot", async () => {
      const instance = node.instance();
      instance.setState({
        path: "a/test/path",
        secret:
          "MsKgJGZJw7Vqw51YwpZhw7LCk2MzwpZZwoLDkMKPIWfCq8K7wobDp8OvwqvCmsO+EAY="
      });
      await instance.onSaveClick();
      expect(mockRemoteCommandsCalled.length).toBe(3);
      [
        {
          commandName: "bot:list:patch",
          args: [
            "a/test/path",
            {
              secret:
                "MsKgJGZJw7Vqw51YwpZhw7LCk2MzwpZZwoLDkMKPIWfCq8K7wobDp8OvwqvCmsO+EAY="
            }
          ]
        }
      ].forEach((command, index) => {
        expect(mockRemoteCommandsCalled[index]).toEqual(command);
      });
    });
  });
});
