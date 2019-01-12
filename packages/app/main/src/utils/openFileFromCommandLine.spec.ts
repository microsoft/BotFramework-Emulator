import {
  CommandHandler,
  CommandRegistry,
  CommandRegistryImpl,
  CommandService,
  DisposableImpl
} from "@bfemulator/sdk-shared";
import { openFileFromCommandLine } from "./openFileFromCommandLine";
import * as readFileSyncUtil from "./readFileSync";

jest.mock("./readFileSync", () => ({
  readFileSync: file => {
    if (file.includes("error.transcript")) {
      return "{}";
    }
    if (file.includes(".transcript")) {
      return "[]";
    }
    if (file.includes("bots.json")) {
      return `{'bots':[]}`;
    }
    return null;
  }
}));

class MockCommandService extends DisposableImpl implements CommandService {
  public registry: CommandRegistry = new CommandRegistryImpl();
  public remoteCalls = [];
  public localCalls = [];

  async remoteCall(...args: any[]) {
    this.remoteCalls.push(args);
    return null;
  }

  async call(...args: any[]) {
    this.localCalls.push(args);
    return null;
  }

  on(commandName: string, handler?: CommandHandler): any {
    return null;
  }
}

describe("The openFileFromCommandLine util", () => {
  let commandService: MockCommandService;
  beforeEach(() => {
    commandService = new MockCommandService();
  });

  it("should make the appropriate calls to open a .bot file", async () => {
    await openFileFromCommandLine("some/path.bot", commandService);
    expect(commandService.localCalls).toEqual([
      ["bot:open", "some/path.bot"],
      ["bot:set-active", null]
    ]);
    expect(commandService.remoteCalls).toEqual([["bot:load", null]]);
  });

  it("should make the appropriate calls to open a .transcript file", async () => {
    await openFileFromCommandLine("some/path.transcript", commandService);
    expect(commandService.remoteCalls).toEqual([
      [
        "transcript:open",
        "deepLinkedTranscript",
        {
          activities: [],
          inMemory: true
        }
      ]
    ]);
  });

  it("should throw when the transcript is not an array", async () => {
    let thrown: boolean;
    try {
      await openFileFromCommandLine("some/error.transcript", commandService);
    } catch (e) {
      thrown = true;
      expect(e.message).toEqual(
        "Invalid transcript file contents; should be an array of conversation activities."
      );
    }
    expect(thrown).toBeTruthy();
  });
});
