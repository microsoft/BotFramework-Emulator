import { ILogService, ILogEntry } from '@bfemulator/app-shared';
import { Disposable } from '@bfemulator/sdk-shared';
import * as ChatActions from '../../data/action/chatActions';
import store from '../../data/store';
import { CommandRegistry } from '../../commands';
import * as chatHelpers from '../../data/chatHelpers';

export function registerCommands() {
  CommandRegistry.registerCommand("conversation:log:append", (conversationId: string, entry: ILogEntry): any => {
    LogService.logToChat(conversationId, entry);
  });
}

export const LogService = new class extends Disposable implements ILogService {

  init() { }

  logToChat(conversationId: string, entry: ILogEntry): void {
    const documentId = chatHelpers.documentIdForConversation(conversationId);
    if (documentId) {
      store.dispatch(ChatActions.appendToLog(documentId, entry));
    }
  }
}
