import { SettingsImpl } from "@bfemulator/app-shared";
import { combineReducers, createStore } from "redux";
import { bot } from "./botData/reducers/bot";
import * as store from "./botData/store";
import { emulator } from "./emulator";
import { NgrokService } from "./ngrokService";
import { setFramework } from "./settingsData/actions/frameworkActions";
import reducers from "./settingsData/reducers";
import { getStore } from "./settingsData/store";

jest.mock("./emulator", () => ({
  emulator: {
    framework: {
      serverUrl: "http://localhost:3000",
      locale: "en-us",
      bypassNgrokLocalhost: true,
      serverPort: 8080,
      ngrokPath: "/usr/bin/ngrok",
      server: {
        botEmulator: {
          facilities: {
            conversations: {
              getConversationIds: () => ["12", "123"]
            },
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

let mockSettingsStore;
const mockCreateStore = () => createStore(reducers);
const mockSettingsImpl = SettingsImpl;
jest.mock("./settingsData/store", () => ({
  getStore: function() {
    return mockSettingsStore || (mockSettingsStore = mockCreateStore());
  },
  getSettings: function() {
    return new mockSettingsImpl(mockSettingsStore.getState());
  },
  get dispatch() {
    return mockSettingsStore.dispatch;
  }
}));

let mockStore;
(store as any).getStore = function() {
  return mockStore || (mockStore = createStore(combineReducers({ bot })));
};

let mockCallsToLog = [];
jest.mock("./main", () => ({
  mainWindow: {
    logService: {
      logToChat: (...args: any[]) => {
        mockCallsToLog.push({ name: "remoteCall", args });
      }
    }
  }
}));

jest.mock("./ngrok", () => {
  let connected = false;
  return {
    running: () => connected,
    connect: (opts, cb) => (
      (connected = true),
      cb(null, "http://fdsfds.ngrok.io", "http://fdsfds.ngrok.io")
    ),
    kill: cb => ((connected = false), cb(null, !connected))
  };
});

describe("The ngrokService", () => {
  let ngrokService = new NgrokService();

  beforeEach(() => {
    getStore().dispatch(setFramework(emulator.framework as any));
    mockCallsToLog.length = 0;
  });

  it("should be a singleton", () => {
    expect(ngrokService).toBe(new NgrokService());
  });

  it("should not invoke ngrok for localhost urls", async () => {
    const serviceUrl = await ngrokService.getServiceUrl(
      "http://localhost:3030/v3/messages"
    );
    expect(serviceUrl).toBe("http://localhost:8080");
  });

  it("should connect to ngrok when a remote endpoint is used", async () => {
    const serviceUrl = await ngrokService.getServiceUrl(
      "http://myBot.someorg:3030/v3/messages"
    );
    expect(serviceUrl).toBe("http://fdsfds.ngrok.io");
  });

  it("should broadcast to each conversation that ngrok has reconnected", async () => {
    await ngrokService.getServiceUrl("http://myBot.someorg:3030/v3/messages");
    ngrokService.broadcastNgrokReconnected();
    expect(mockCallsToLog.length).toBe(8);
  });

  it('should report its status to the specified conversation when "report()" is called', async () => {
    await ngrokService.getServiceUrl("http://myBot.someorg:3030/v3/messages");
    ngrokService.report("12");
    expect(mockCallsToLog.length).toBe(3);
  });

  it("should reportNotConfigured() when no ngrokPath is specified", async () => {
    (ngrokService as any)._ngrokPath = "";
    ngrokService.report("12");
    expect(mockCallsToLog.length).toBe(3);
    expect(mockCallsToLog[0].args[1].payload.text).toBe(
      "ngrok not configured (only needed when connecting to remotely hosted bots)"
    );
  });
});
