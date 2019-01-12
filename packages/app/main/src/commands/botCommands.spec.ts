import { SharedConstants } from "@bfemulator/app-shared";
import {
  BotConfigWithPathImpl,
  CommandRegistryImpl
} from "@bfemulator/sdk-shared";
import { BotConfiguration } from "botframework-config";
import { ServiceTypes } from "botframework-config/lib/schema";
import * as path from "path";
import { combineReducers, createStore } from "redux";
import * as BotActions from "../botData/actions/botActions";
import { setActive } from "../botData/actions/botActions";
import { bot } from "../botData/reducers/bot";
import { State } from "../botData/state";
import * as store from "../botData/store";
import { getStore } from "../botData/store";
import * as helpers from "../botHelpers";
import { emulator } from "../emulator";
import { mainWindow } from "../main";
import {
  botProjectFileWatcher,
  chatWatcher,
  transcriptsWatcher
} from "../watchers";
import { registerCommands } from "./botCommands";

const mockBotConfig = BotConfiguration;
let mockStore;
(store as any).getStore = function() {
  return mockStore || (mockStore = createStore(combineReducers({ bot })));
};

jest.mock("../botHelpers", () => ({
  saveBot: async () => void 0,
  toSavableBot: () => mockBotConfig.fromJSON(mockBot),
  patchBotsJson: async () => true,
  pathExistsInRecentBots: () => true,
  getBotInfoByPath: () => ({ secret: "secret" }),
  loadBotWithRetry: () => mockBot,
  getActiveBot: () => mockBot,
  removeBotFromList: async () => true
}));

jest.mock("../utils/ensureStoragePath", () => ({
  ensureStoragePath: () => ""
}));

jest.mock("../emulator", () => ({
  emulator: {
    framework: {
      server: {
        botEmulator: {
          facilities: {
            endpoints: {
              reset: () => null,
              push: () => null
            }
          }
        }
      }
    }
  }
}));
const mockCommandRegistry = new CommandRegistryImpl();
const mockBot = BotConfigWithPathImpl.fromJSON({
  path: path.normalize("some/path.bot"),
  name: "AuthBot",
  description: "",
  padlock: "",
  services: [
    {
      appId: "4f8fde3f-48d3-4d8a-a954-393efe39809e",
      id: "cded37c0-83f2-11e8-ac6d-b7172cd24b28",
      type: "endpoint",
      appPassword: "REDACTED",
      endpoint: "http://localhost:55697/api/messages",
      name: "authsample"
    }
  ]
} as any);

registerCommands(mockCommandRegistry);
jest.mock("../main", () => ({
  mainWindow: {
    commandService: {
      call: async () => true,
      remoteCall: async () => true
    }
  }
}));

const mockOn = { on: () => mockOn, close: () => void 0 };
jest.mock("chokidar", () => ({
  watch: () => ({
    on: () => mockOn
  })
}));

const { Bot } = SharedConstants.Commands;
describe("The botCommands", () => {
  it("should create/save a new bot", async () => {
    const botToSave = BotConfigWithPathImpl.fromJSON(mockBot as any);
    const patchBotInfoSpy = jest.spyOn(
      (helpers as any).default,
      "patchBotsJson"
    );
    const saveBotSpy = jest.spyOn((helpers as any).default, "saveBot");

    const mockBotInfo = {
      path: path.normalize(botToSave.path),
      displayName: "AuthBot",
      secret: "secret",
      chatsPath: path.normalize("some/dialogs"),
      transcriptsPath: path.normalize("some/transcripts")
    };
    const command = mockCommandRegistry.getCommand(Bot.Create);
    const result = await command.handler(botToSave, "secret");
    expect(patchBotInfoSpy).toHaveBeenCalledWith(botToSave.path, mockBotInfo);
    expect(saveBotSpy).toHaveBeenCalledWith(botToSave);
    expect(result).toEqual(botToSave);
  });

  it("should open a bot and set the default transcript and chat path if none exists", async () => {
    const mockBotInfo = {
      secret: "secret",
      transcriptsPath: "",
      chatsPath: ""
    };
    const syncWithClientSpy = jest.spyOn(
      mainWindow.commandService,
      "remoteCall"
    );
    const pathExistsInRecentBotsSpy = jest
      .spyOn((helpers as any).default, "pathExistsInRecentBots")
      .mockReturnValue(true);
    const getBotInfoByPathSpy = jest
      .spyOn((helpers as any).default, "getBotInfoByPath")
      .mockReturnValue(mockBotInfo);
    const loadBotWithRetrySpy = jest
      .spyOn((helpers as any).default, "loadBotWithRetry")
      .mockResolvedValue(mockBot);
    const command = mockCommandRegistry.getCommand(Bot.Open);
    const result = await command.handler("bot/path", "secret");

    expect(pathExistsInRecentBotsSpy).toHaveBeenCalledWith("bot/path");
    expect(getBotInfoByPathSpy).toHaveBeenCalledWith("bot/path");
    expect(loadBotWithRetrySpy).toHaveBeenCalledWith("bot/path", "secret");
    expect(result).toEqual(mockBot);
    expect(mockBotInfo.transcriptsPath).toBe(path.normalize("bot/transcripts"));
    expect(mockBotInfo.chatsPath).toBe(path.normalize("bot/dialogs"));
    expect(syncWithClientSpy).toHaveBeenCalled();
  });

  it("should set the active bot", async () => {
    const botProjectFileWatcherSpy = jest.spyOn(botProjectFileWatcher, "watch");
    const commandServiceSpy = jest.spyOn(mainWindow.commandService, "call");
    const command = mockCommandRegistry.getCommand(Bot.SetActive);
    const result = await command.handler(mockBot);

    expect(botProjectFileWatcherSpy).toHaveBeenCalledWith(mockBot.path);
    expect(commandServiceSpy).toHaveBeenCalledWith(Bot.RestartEndpointService);
    const state: State = store.getStore().getState() as State;
    expect(state.bot.activeBot).toEqual(mockBot);
    expect(state.bot.currentBotDirectory).toBe("some");
    expect(result).toEqual("some");
  });

  it("should restart the endpoint service", async () => {
    store.getStore().dispatch(setActive(mockBot));
    const resetSpy = jest.spyOn(
      emulator.framework.server.botEmulator.facilities.endpoints,
      "reset"
    );
    const pushSpy = jest.spyOn(
      emulator.framework.server.botEmulator.facilities.endpoints,
      "push"
    );
    const command = mockCommandRegistry.getCommand(Bot.RestartEndpointService);
    const result = await command.handler();

    expect(resetSpy).toHaveBeenCalled();
    expect(pushSpy).toHaveBeenCalled();
    expect(result).toBeUndefined();
  });

  it("should add or update the service as expected", async () => {
    const serviceToSave = mockBot.services[0];
    serviceToSave.name = "A new Name";
    serviceToSave.id = "";
    const remoteCallSpy = jest.spyOn(mainWindow.commandService, "remoteCall");
    const command = mockCommandRegistry.getCommand(Bot.AddOrUpdateService)
      .handler;
    await command(serviceToSave.type, serviceToSave);
    const savedBot = mockBotConfig.fromJSON(
      store.getStore().getState().bot.activeBot
    );

    expect(savedBot.services[0]).toEqual(serviceToSave);
    expect(serviceToSave.id).not.toEqual("");
    expect(remoteCallSpy).toHaveBeenCalledWith(
      SharedConstants.Commands.Bot.SetActive,
      savedBot,
      savedBot.getPath()
    );
  });

  it("should throw when updating a service fails", async () => {
    const serviceToUpdate = mockBot.services[0];
    jest.spyOn(store.getStore(), "dispatch").mockImplementationOnce(() => {
      throw new Error("");
    });
    const { handler } = mockCommandRegistry.getCommand(Bot.AddOrUpdateService);
    let threw = false;
    try {
      await handler(serviceToUpdate.type, serviceToUpdate);
    } catch (e) {
      threw = true;
    }
    jest.restoreAllMocks();
    expect(threw).toBeTruthy();
  });

  it("should throw when saving a new service and the service types do not match", async () => {
    const serviceToSave = JSON.parse(JSON.stringify(mockBot.services[0]));
    serviceToSave.id = null;
    serviceToSave.type = ServiceTypes.AppInsights;
    const { handler } = mockCommandRegistry.getCommand(Bot.AddOrUpdateService);
    let threw = false;
    try {
      await handler(ServiceTypes.Luis, serviceToSave);
    } catch (e) {
      threw = true;
      expect(e.message).toEqual("serviceType does not match");
    }
    expect(threw).toBeTruthy();
  });

  it("should remove a service as expected", async () => {
    const serviceToRemove = mockBot.services[0];
    const remoteCallSpy = jest.spyOn(mainWindow.commandService, "remoteCall");
    const { handler } = mockCommandRegistry.getCommand(Bot.RemoveService);
    await handler(serviceToRemove.type, serviceToRemove.id);
    const savedBot = mockBotConfig.fromJSON(
      store.getStore().getState().bot.activeBot
    );
    expect(savedBot.services.length).toBe(0);

    expect(remoteCallSpy).toHaveBeenCalledWith(
      SharedConstants.Commands.Bot.SetActive,
      savedBot,
      savedBot.getPath()
    );
  });

  it("should throw when removing a service fails", async () => {
    const serviceToRemove = mockBot.services[0];
    jest.spyOn(store.getStore(), "dispatch").mockImplementationOnce(() => {
      throw new Error("");
    });
    const { handler } = mockCommandRegistry.getCommand(Bot.RemoveService);
    let threw = false;
    try {
      await handler(serviceToRemove.type, serviceToRemove.id);
    } catch (e) {
      threw = true;
    }
    jest.restoreAllMocks();
    expect(threw).toBeTruthy();
  });

  it("should patch the bots list and watch for chat and transcript changes", async () => {
    const mockBotInfo = {
      path: path.normalize("this/is/my.json"),
      displayName: "AuthBot",
      secret: "secret"
    };
    const transcriptWatchSpy = jest.spyOn(transcriptsWatcher, "watch");
    const chatWatcherSpy = jest.spyOn(chatWatcher, "watch");

    const { handler } = mockCommandRegistry.getCommand(
      SharedConstants.Commands.Bot.PatchBotList
    );
    await handler(mockBotInfo.path, mockBotInfo);
    expect(transcriptWatchSpy).toHaveBeenCalledWith(
      path.normalize("this/is/transcripts")
    );
    expect(chatWatcherSpy).toHaveBeenCalledWith(
      path.normalize("this/is/dialogs")
    );
  });

  it("should remove a bot from the list", async () => {
    const callSpy = jest
      .spyOn(mainWindow.commandService, "call")
      .mockResolvedValue(true);
    const { handler } = mockCommandRegistry.getCommand(
      SharedConstants.Commands.Bot.RemoveFromBotList
    );
    const removeBotFromListSpy = jest
      .spyOn((helpers as any).default, "removeBotFromList")
      .mockResolvedValue(true);
    await handler("some/bot/path.json");
    expect(callSpy).toHaveBeenCalledWith(
      "shell:showExplorer-message-box",
      true,
      {
        buttons: ["Cancel", "OK"],
        cancelId: 0,
        defaultId: 1,
        message: "Remove Bot some/bot/path.json from bots list. Are you sure?",
        type: "question"
      }
    );
    expect(removeBotFromListSpy).toHaveBeenCalledWith("some/bot/path.json");
  });

  it("should close the bot", async () => {
    const { handler } = mockCommandRegistry.getCommand(
      SharedConstants.Commands.Bot.Close
    );
    const dispatchSpy = jest.spyOn(getStore(), "dispatch");
    await handler();
    expect(dispatchSpy).toHaveBeenCalledWith(BotActions.close());
  });
});
