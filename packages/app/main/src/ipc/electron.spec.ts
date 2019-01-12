import { Channel } from "@bfemulator/sdk-shared";
import { ElectronIPC, ElectronIPCServer } from "./electron";
import { ipcMain, Event } from "electron";

const mockWebContents = {
  send: () => {},
  on: () => {},
  once: () => {}
} as any;

jest.mock("electron", () => ({
  ipcMain: {
    on: (event, ...args) => void 0
  },

  Event: class mockEvent {
    sender: any;
    type: string;
    constructor(mockType: string) {
      this.type = mockType;
    }
  }
}));

describe("The ElectronIPC", () => {
  let ipc: ElectronIPC;
  beforeEach(() => {
    ipc = new ElectronIPC(mockWebContents);
  });

  it("should send messages via the webContents", () => {
    const spy = jest.spyOn(mockWebContents, "send");
    ipc.send("some-message-argument", {});
    expect(spy).toHaveBeenCalledWith(
      "ipc:message",
      "some-message-argument",
      {}
    );
  });

  it("should register a channel", () => {
    const channel = new Channel("a channel", {
      send: () => {}
    });
    ipc.registerChannel(channel);
    expect(ipc.getChannel("a channel")).toBe(channel);
  });

  it("should throw if a channel by the same name has been registered more than once", () => {
    const channel = new Channel("a channel", {
      send: () => {}
    });
    ipc.registerChannel(channel);
    const registerSameChannelAgain = () => ipc.registerChannel(channel);
    expect(registerSameChannelAgain).toThrow();
  });

  it("should route message through the appropriate channel", () => {
    const sender = { send: () => void 0 };
    const channel = new Channel("a channel", sender);
    const listener = {
      handler: () => {}
    };
    const spy = jest.spyOn(listener, "handler");
    channel.setListener("my:message", listener.handler);
    ipc.registerChannel(channel);
    ipc.onMessage(new Event("message") as any, "a channel", "my:message", {});
    expect(spy).toHaveBeenCalledWith({});
  });
});

describe("The ElectronIPCServer", () => {
  let ipc: ElectronIPC;
  beforeEach(() => {
    ipc = new ElectronIPC(mockWebContents);
  });

  it("should register an ElectronIPC instance and provide a working disposable", () => {
    const disposable = ElectronIPCServer.registerIPC(ipc);
    expect((ElectronIPCServer as any)._ipcs.has(ipc.webContents)).toBeTruthy();
    expect(disposable.dispose).not.toThrow();
    expect((ElectronIPCServer as any)._ipcs.has(ipc.webContents)).toBeFalsy();
  });

  it("should route messages from the main ipc to the registered ipc", () => {
    (ElectronIPCServer as any).initialized = false;
    let cb: any;
    (ipcMain as any).on = (
      type: string,
      callback: (event: Event, ...args: any[]) => void
    ) => {
      cb = callback;
    };
    const spy = jest.spyOn(ipc, "onMessage");
    ElectronIPCServer.registerIPC(ipc);
    const event = new Event("message");
    (event as any).sender = mockWebContents;

    cb(event, {});
    expect(spy).toHaveBeenCalledWith(event, {});
  });
});
