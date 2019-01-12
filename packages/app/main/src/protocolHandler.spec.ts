// Allows us to bypass all the setup required in ./main
//
// NOTE: A significant part of protocolHandler is not testable
// because of call to "jest.mock('./main', ...)" which is needed
// to bypass setup of all ./main dependencies. To test the remaineder
// of the protocol handler, we need to mock the CommandService which is
// a property of main. However, any mocks written for the CommandService
// will be overwritten due to the call to "jest.mock('./main', ...)"

jest.mock("./main", () => ({}));
jest.mock("./globals", () => ({
  getGlobal: () => ({}),
  setGlobal: () => null
}));
import "./fetchProxy";
import {
  Protocol,
  ProtocolHandler,
  parseEndpointOverrides
} from "./protocolHandler";

describe("Protocol handler tests", () => {
  describe("parseProtocolUrl() functionality", () => {
    it("should return an info object about the parsed URL", () => {
      const info: Protocol = ProtocolHandler.parseProtocolUrl(
        "bfemulator://bot.open?path=somePath"
      );
      expect(info.domain).toBe("bot");
      expect(info.action).toBe("open");
      expect(info.args).toEqual("path=somePath");
      expect(info.parsedArgs).toEqual({ path: "somePath" });
    });

    it("should throw on an invalid protocol url", () => {
      expect(() =>
        ProtocolHandler.parseProtocolUrl("invalidProtocolUrl://blah")
      ).toThrow();
    });
  });

  it("should dispatch the result of parseProtocolUrl", () => {
    // preserve functions that will be mocked
    const tmpParseProtocolUrl = ProtocolHandler.parseProtocolUrl;
    const tmpDispatchProtocolAction = ProtocolHandler.dispatchProtocolAction;

    // mock functions
    const mockParseProtocolUrl = jest.fn(() => ({}));
    const mockDispatchProtocolAction = jest.fn(() => null);

    ProtocolHandler.parseProtocolUrl = mockParseProtocolUrl;
    ProtocolHandler.dispatchProtocolAction = mockDispatchProtocolAction;

    ProtocolHandler.parseProtocolUrlAndDispatch("someUrl");
    expect(mockParseProtocolUrl).toHaveBeenCalledTimes(1);
    expect(mockDispatchProtocolAction).toHaveBeenCalledTimes(1);

    // restore functions to original form
    ProtocolHandler.parseProtocolUrl = tmpParseProtocolUrl;
    ProtocolHandler.dispatchProtocolAction = tmpDispatchProtocolAction;
  });

  describe("dispatching protocol actions", () => {
    let tmpPerformBotAction;
    let tmpPerformLiveChatAction;
    let tmpPerformTranscriptAction;

    beforeEach(() => {
      tmpPerformBotAction = ProtocolHandler.performBotAction;
      tmpPerformLiveChatAction = ProtocolHandler.performLiveChatAction;
      tmpPerformTranscriptAction = ProtocolHandler.performTranscriptAction;
    });

    afterEach(() => {
      ProtocolHandler.performBotAction = tmpPerformBotAction;
      ProtocolHandler.performLiveChatAction = tmpPerformLiveChatAction;
      ProtocolHandler.performTranscriptAction = tmpPerformTranscriptAction;
    });

    it("shouldn\t do anything on an unrecognized action", () => {
      const mockPerformBotAction = jest.fn(() => null);
      ProtocolHandler.performBotAction = mockPerformBotAction;
      const mockPerformLiveChatAction = jest.fn(() => null);
      ProtocolHandler.performLiveChatAction = mockPerformLiveChatAction;
      const mockPerformTranscriptAction = jest.fn(() => null);
      ProtocolHandler.performTranscriptAction = mockPerformTranscriptAction;

      ProtocolHandler.dispatchProtocolAction({ domain: "invalidDomain" });

      expect(mockPerformBotAction).not.toHaveBeenCalled();
      expect(mockPerformLiveChatAction).not.toHaveBeenCalled();
      expect(mockPerformTranscriptAction).not.toHaveBeenCalled();
    });

    it("should dispatch a bot action", () => {
      const mockPerformBotAction = jest.fn(() => null);
      ProtocolHandler.performBotAction = mockPerformBotAction;

      ProtocolHandler.dispatchProtocolAction({ domain: "bot" });

      expect(mockPerformBotAction).toHaveBeenCalledTimes(1);
    });

    it("should dispatch a livechat action", () => {
      const mockPerformLiveChatAction = jest.fn(() => null);
      ProtocolHandler.performLiveChatAction = mockPerformLiveChatAction;

      ProtocolHandler.dispatchProtocolAction({ domain: "livechat" });

      expect(mockPerformLiveChatAction).toHaveBeenCalledTimes(1);
    });

    it("should dispatch a transcript action", () => {
      const mockPerformTranscriptAction = jest.fn(() => null);
      ProtocolHandler.performTranscriptAction = mockPerformTranscriptAction;

      ProtocolHandler.dispatchProtocolAction({ domain: "transcript" });

      expect(mockPerformTranscriptAction).toHaveBeenCalledTimes(1);
    });
  });

  describe("parseEndpointOverrides() functionality", () => {
    it("should return null when passed a falsy object", () => {
      const result = parseEndpointOverrides(null);
      expect(result).toBe(null);
    });

    it("should return null when passed an empty object", () => {
      const result = parseEndpointOverrides({});
      expect(result).toBe(null);
    });

    it("should return an endpoint object with overrides", () => {
      const parsedArgs = {
        appId: "someAppId",
        appPassword: "someAppPw",
        endpoint: "someEndpoint",
        someOtherArg: "someOtherArg"
      };

      const overrides = parseEndpointOverrides(parsedArgs);
      expect(Object.keys(overrides).length).toBe(3);
      expect(overrides.appId).toBe("someAppId");
      expect(overrides.appPassword).toBe("someAppPw");
      expect(overrides.endpoint).toBe("someEndpoint");
    });

    it("should return null if no overrides were parsed", () => {
      const parsedArgs = {
        notAnOverride: "testing",
        notAnOverrideEither: "testing"
      };

      const overrides = parseEndpointOverrides(parsedArgs);
      expect(overrides).toBe(null);
    });
  });

  // unmock mainWindow
  jest.unmock("./main");
  jest.unmock("./globals");
});
