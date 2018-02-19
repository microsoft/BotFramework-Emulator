import { Disposable } from "botframework-emulator-shared/built/base/lifecycle/disposable";
import { ILogService, ILogEntry } from "botframework-emulator-shared/built/platform/log";
import { CommandRegistry } from "botframework-emulator-shared/built/platform/commands/commandRegistry";
import * as ChatActions from "../../data/action/chatActions";
import store from "../../data/store";

export const LogService = new class extends Disposable implements ILogService {

  init() { }

  constructor() {
    super();
    CommandRegistry.registerCommand("conversation:log:append", (context: any, conversationId: string, entry: ILogEntry): any => {
      this.logToLiveChat(conversationId, entry);
    });
  }

  logToLiveChat(conversationId: string, entry: ILogEntry): void {
    store.dispatch(ChatActions.appendToLog(conversationId, entry));
  }
}
