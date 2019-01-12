import { newNotification, SharedConstants } from "@bfemulator/app-shared";
import { CommandRegistryImpl } from "@bfemulator/sdk-shared";
import { clientAwareSettingsChanged } from "../data/action/clientAwareSettingsActions";
import { beginAdd } from "../data/action/notificationActions";
import { bot } from "../data/reducer/bot";
import { chat } from "../data/reducer/chat";
import { clientAwareSettings } from "../data/reducer/clientAwareSettingsReducer";
import { editor } from "../data/reducer/editor";
import { combineReducers, createStore } from "redux";
import { RootState, store } from "../data/store";
import { CommandServiceImpl } from "../platform/commands/commandServiceImpl";
import { registerCommands } from "./emulatorCommands";

const mockEndpoint = {
  endpoint: "https://localhost:8080/api/messages"
};

let mockStore;
jest.mock("../data/store", () => ({
  get store() {
    return mockStore;
  }
}));
jest.mock("../ui/dialogs/", () => ({}));

describe("The emulator commands", () => {
  let registry: CommandRegistryImpl;
  beforeAll(() => {
    registry = new CommandRegistryImpl();
    registerCommands(registry);
  });

  beforeEach(() => {
    mockStore = createStore(
      combineReducers({ bot, chat, clientAwareSettings, editor })
    );
    mockStore.dispatch(
      clientAwareSettingsChanged({
        users: { currentUserId: "1234" },
        cwd: "path",
        locale: "en-us",
        serverUrl: "https://localhost"
      })
    );
  });

  it("Should open a new emulator tabbed document for an endpoint", () => {
    const { handler } = registry.getCommand(
      SharedConstants.Commands.Emulator.NewLiveChat
    );
    const documentId = handler(mockEndpoint, false);
    const state: RootState = mockStore.getState();
    const documentIds = Object.keys(state.chat.chats);
    expect(documentIds.length).toBe(1);
    expect(state.editor.editors.primary.activeDocumentId).toBe(documentId);
  });

  it("should set the active tab of an existing chat", () => {
    const { handler } = registry.getCommand(
      SharedConstants.Commands.Emulator.NewLiveChat
    );
    const documentId = handler(mockEndpoint, false);
    const secondDocumentId = handler({
      endpoint: "https://localhost:8181/api/messages"
    });
    // At this point we should have 2 open documents
    // with the second on
    expect(mockStore.getState().editor.editors.primary.activeDocumentId).toBe(
      secondDocumentId
    );
    handler(mockEndpoint, true); // re-open the original document
    expect(mockStore.getState().editor.editors.primary.activeDocumentId).toBe(
      documentId
    );
  });

  it("should open a transcript", () => {
    const { handler } = registry.getCommand(
      SharedConstants.Commands.Emulator.OpenTranscript
    );
    const filePath = "transcript.transcript";
    handler(filePath, filePath);

    const state = mockStore.getState();
    expect(state.chat.chats[filePath]).toBeTruthy();
    expect(state.editor.editors.primary.activeDocumentId).toBe(filePath);
  });

  it("Should prompt to open a transcript", async () => {
    const { handler } = registry.getCommand(
      SharedConstants.Commands.Emulator.PromptToOpenTranscript
    );
    const remoteCallSpy = jest
      .spyOn(CommandServiceImpl, "remoteCall")
      .mockResolvedValue("transcript.transcript");
    const callSpy = jest.spyOn(CommandServiceImpl, "call");

    await handler();

    expect(remoteCallSpy).toHaveBeenCalledWith(
      "shell:showExplorer-open-dialog",
      {
        buttonLabel: "Choose file",
        filters: [{ extensions: ["transcript"], name: "Transcript Files" }],
        properties: ["openFile"],
        title: "Open transcript file"
      }
    );

    expect(callSpy).toHaveBeenCalledWith(
      "transcript:open",
      "transcript.transcript"
    );
  });

  it("should dispatch a notification when opening a transcript fails", async () => {
    const { handler } = registry.getCommand(
      SharedConstants.Commands.Emulator.PromptToOpenTranscript
    );
    const remoteCallSpy = jest
      .spyOn(CommandServiceImpl, "remoteCall")
      .mockResolvedValue("transcript.transcript");
    const callSpy = jest
      .spyOn(CommandServiceImpl, "call")
      .mockImplementationOnce(() => {
        throw new Error("Oh noes!");
      });
    const dispatchSpy = jest.spyOn(mockStore, "dispatch");
    const errMsg = `Error while opening transcript file: Error: Oh noes!`;
    const notification = newNotification(errMsg);
    const action = beginAdd(notification);
    action.payload.notification.timestamp = jasmine.any(Number) as any;
    action.payload.notification.id = jasmine.any(String) as any;
    await handler();
    expect(remoteCallSpy).toHaveBeenCalled();
    expect(callSpy).toHaveBeenCalledWith(
      "transcript:open",
      "transcript.transcript"
    );
    expect(dispatchSpy).toHaveBeenCalledWith(action);
    jest.restoreAllMocks();
  });

  it("should reload a transcript", async () => {
    const { handler: openTranscriptHandler } = registry.getCommand(
      SharedConstants.Commands.Emulator.OpenTranscript
    );
    await openTranscriptHandler("transcript.transcript");
    let state = mockStore.getState();
    expect(state.chat.changeKey).toBe(1);
    const { handler } = registry.getCommand(
      SharedConstants.Commands.Emulator.ReloadTranscript
    );
    await handler("transcript.transcript");
    state = mockStore.getState();
    expect(state.chat.changeKey).toBe(3);
  });
});
