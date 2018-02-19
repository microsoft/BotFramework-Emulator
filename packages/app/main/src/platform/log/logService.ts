import { Disposable } from "botframework-emulator-shared/built/base/lifecycle/disposable";
import { ILogService, ILogEntry } from "botframework-emulator-shared/built/platform/log";
import { Window } from "../window";

export class LogService extends Disposable implements ILogService {

  constructor(private _window: Window) {
    super();
  }

  logToLiveChat(conversationId: string, entry: ILogEntry): void {
    this._window.commandService.remoteCall("conversation:log:append", conversationId, entry);
  }
}
