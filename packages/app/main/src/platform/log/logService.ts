import { Disposable, ILogService, ILogEntry } from '@bfemulator/app-shared';
import { Window } from '../window';

export class LogService extends Disposable implements ILogService {

  constructor(private _window: Window) {
    super();
  }

  logToLiveChat(conversationId: string, entry: ILogEntry): void {
    this._window.commandService.remoteCall("conversation:log:append", conversationId, entry);
  }
}
