import { BrowserWindow } from "electron";
import "../fetchProxy";
import { AzureAuthWorkflowService } from "./azureAuthWorkflowService";

const mockEvent = Event; // this is silly but required by jest
const mockArmToken =
  "eyJhbGciOiJSU0EyNTYiLCJraWQiOiJmZGtqc2FoamdmIiwieDV0IjoiZiJ9." +
  "eyJ1cG4iOiJnbGFzZ293QHNjb3RsYW5kLmNvbSJ9." +
  "7gjdshgfdsk98458205jfds9843fjds";

jest.mock("jsonwebtoken", () => ({
  verify: () => true
}));
let mockResponses;

jest.mock("node-fetch", () => {
  const fetch = (url, opts) => {
    return {
      ok: true,
      json: async () => mockResponses.pop(),
      text: async () => "{}"
    };
  };
  (fetch as any).Headers = class {};
  (fetch as any).Response = class {};
  return fetch;
});

jest.mock("rsa-pem-from-mod-exp", () => () => ({}));

jest.mock("electron", () => ({
  BrowserWindow: class MockBrowserWindow {
    public static reporters = [];
    public listeners = [] as any;
    public webContents = {
      history: [
        "http://someotherUrl",
        `https://dev.botframework.com/cb/#t=13&access_token=${mockArmToken}`
      ]
    };

    private static report(...args: any[]) {
      this.reporters.forEach(r => r(args));
    }

    constructor(...args: any[]) {
      MockBrowserWindow.report("constructor", ...args);
    }

    setMenu() {
      // no-op
    }

    addListener(type: string, handler: (event: any) => void) {
      this.listeners.push({ type, handler });
      MockBrowserWindow.report("addListener", type, handler);
      if (type === "page-title-updated") {
        [
          ["http://someotherUrl"],
          [`http://localhost/#t=13&id_token=${mockArmToken}`]
        ].forEach((url, index) => {
          let evt = new mockEvent("page-title-updated");
          (evt as any).sender = {
            history: [`http://localhost/#t=13&access_token=${mockArmToken}`]
          };
          setTimeout(() => {
            this.listeners.forEach(l => l.type === evt.type && l.handler(evt));
          }, 25 * index);
        });
      }
    }

    once(type: string, handler: (event: any) => void) {
      this.listeners.push({ type, handler });
      MockBrowserWindow.report("once", type, handler);
    }

    dispatch(event: any) {
      this.listeners.forEach(l => l.type === event.type && l.handler(event));
      MockBrowserWindow.report("dispatch", event);
    }

    show() {
      MockBrowserWindow.report("show");
    }

    close() {
      MockBrowserWindow.report("hide");
    }

    loadURL(url: string) {
      MockBrowserWindow.report("loadURL", url);
      let evt = new mockEvent("ready-to-show");
      setTimeout(() => {
        this.listeners.forEach(l => l.type === evt.type && l.handler(evt));
      });
    }
  }
}));

describe("The azureAuthWorkflowService", () => {
  beforeEach(() => {
    mockResponses = [
      { access_token: mockArmToken },
      { jwks_uri: "http://localhost", keys: { find: () => ({}) } },
      {
        authorization_endpoint: "http://localhost",
        jwks_uri: "http://localhost",
        token_endpoint: "http://localhost"
      }
    ];
    (BrowserWindow as any).reporters = [];
  });

  it('should make the appropriate calls and receive the expected values with the "retrieveAuthToken"', async () => {
    let reportedValues = [];
    let reporter = v => reportedValues.push(v);
    (BrowserWindow as any).reporters.push(reporter);
    const it = AzureAuthWorkflowService.retrieveAuthToken(false);
    let value = undefined;
    let ct = 0;
    while (true) {
      let next = it.next(value);
      if (next.done) {
        break;
      }
      value = await next.value;
      if (!ct) {
        expect(value instanceof BrowserWindow).toBe(true);
        expect(reportedValues.length).toBe(3);
        const [, uri] = reportedValues[1];
        const idx = uri.indexOf("#");
        const parts = uri.substring(idx).split("&");
        [
          "response_type",
          "client_id",
          "redirect_uri",
          "state",
          "client-request-id",
          "nonce",
          "response_mode",
          "resource"
        ].forEach((part, index) => {
          expect(parts[index].includes(part));
        });
        reportedValues.length = 0;
      }

      if (ct === 1) {
        expect(value.access_token).toBe(mockArmToken);
        // Not sure if this is valuable or not.
        expect(reportedValues.length).toBe(3);
      }
      // Token validation
      if (ct === 2) {
        expect(value).toBe(true);
      }
      // Token delivery
      if (ct === 4) {
        expect(value.arm_token).toBe(mockArmToken);
      }
      ct++;
    }
    expect(ct).toBe(4);
  });
});
