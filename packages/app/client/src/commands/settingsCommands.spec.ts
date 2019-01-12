import { registerCommands } from "./settingsCommands";
import { CommandRegistryImpl } from "@bfemulator/sdk-shared";
import { SharedConstants } from "@bfemulator/app-shared";
import { clientAwareSettings } from "../data/reducer/clientAwareSettingsReducer";
import { combineReducers, createStore } from "redux";
import { store } from "../data/store";
import { clientAwareSettingsChanged } from "../data/action/clientAwareSettingsActions";

let mockStore = createStore(combineReducers({ clientAwareSettings }));
jest.mock("../data/store", () => ({
  get store() {
    return mockStore;
  }
}));

describe("the settings commands", () => {
  let registry: CommandRegistryImpl;
  beforeAll(() => {
    registry = new CommandRegistryImpl();
    registerCommands(registry);
  });

  it("should dispatch to the store when settings are sent from the main side", () => {
    const command = registry.getCommand(
      SharedConstants.Commands.Settings.ReceiveGlobalSettings
    ).handler;
    const dispatchSpy = jest.spyOn(store, "dispatch");
    command({});
    expect(dispatchSpy).toHaveBeenCalledWith(
      clientAwareSettingsChanged({} as any)
    );
  });
});
