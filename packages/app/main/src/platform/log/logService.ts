import { Disposable } from "botframework-emulator-shared/built/base/lifecycle/disposable";
import { ILogService, LogLevel } from "botframework-emulator-shared/built/platform/log";
import { Window } from "../window";

export class LogService extends Disposable implements ILogService {

  constructor(private _window: Window) {
    super();
  }

  logToLiveChat(level: LogLevel, conversationId: string, ...args: any[]): void {
    this._window.commandService.remoteCall("conversation:log:append", level, conversationId, ...args);
  }
}
