import { CommandServiceImpl } from '../platform/commands/commandServiceImpl';
import { SharedConstants } from '@bfemulator/app-shared';

export const globalHandlers: EventListener = (event: KeyboardEvent): void => {
  // Meta corresponds to 'Command' on Mac
  const ctrlOrCmdPressed = event.ctrlKey || event.metaKey;
  const key = event.key.toLowerCase();

  if (ctrlOrCmdPressed && key ===  'o') {
    const { Commands: { Bot: { OpenBrowse }} } = SharedConstants;
    CommandServiceImpl.call(OpenBrowse).catch();
  }

  if (ctrlOrCmdPressed && key ===  'n') {
    const { Commands: { UI: { ShowBotCreationDialog }} } = SharedConstants;
    CommandServiceImpl.call(ShowBotCreationDialog).catch();
  }
};