import { ILogService, ILogEntry } from '@bfemulator/app-shared';
import { Disposable } from '@bfemulator/sdk-shared';
import * as ChatActions from '../../data/action/chatActions';
import store from '../../data/store';
import { CommandRegistry } from '../../commands';

export function registerCommands() {
  CommandRegistry.registerCommand("conversation:log:append", (conversationId: string, entry: ILogEntry): any => {
    LogService.logToLiveChat(conversationId, entry);
  });
}

export const LogService = new class extends Disposable implements ILogService {

  init() { }

  logToLiveChat(conversationId: string, entry: ILogEntry): void {
    store.dispatch(ChatActions.appendToLog(conversationId, entry));
  }
}
