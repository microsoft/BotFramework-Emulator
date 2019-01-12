import { CommandServiceImpl } from "../../../../../platform/commands/commandServiceImpl";
import { getSpeechToken } from "./chat";

jest.mock("../../../../dialogs", () => ({
  AzureLoginPromptDialogContainer: () => ({}),
  AzureLoginSuccessDialogContainer: () => ({}),
  BotCreationDialog: () => ({}),
  DialogService: { showDialog: () => Promise.resolve(true) },
  SecretPromptDialog: () => ({})
}));

jest.mock("./chat.scss", () => ({}));

describe("ChatPanel tests", () => {
  it("should get speech token by calling remotely", async () => {
    const mockRemoteCall = jest.fn().mockResolvedValue("1A2B3C4");
    (CommandServiceImpl as any).remoteCall = mockRemoteCall;

    const speechToken = getSpeechToken(
      {
        appId: "APP_ID",
        appPassword: "APP_PASSWORD",
        endpoint: "http://example.com/",
        id: "123",
        name: "bot endpoint"
      },
      true
    );

    expect(speechToken).resolves.toBe("1A2B3C4");
    expect(mockRemoteCall).toHaveBeenCalledTimes(1);
  });
});
