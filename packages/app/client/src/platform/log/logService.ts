import { Disposable } from "botframework-emulator-shared/built/base/lifecycle/disposable";
import { ILogService, LogLevel } from "botframework-emulator-shared/built/platform/log";
import { CommandRegistry } from "botframework-emulator-shared/built/platform/commands/commandRegistry";
import * as ChatActions from "../../data/action/chatActions";
import store from "../../data/store";

export const LogService = new class extends Disposable implements ILogService {

  init() { }

  constructor() {
    super();
    CommandRegistry.registerCommand("conversation:log:append", (context: any, ...args: any[]): any => {
      const level = args.shift();
      const conversationId = args.shift();
      this.logToLiveChat(level, conversationId, ...args);
    });
  }

  logToLiveChat(level: LogLevel, conversationId: string, ...args: any[]): void {
    store.dispatch(ChatActions.appendToLog(level, conversationId, ...args));
  }
}
