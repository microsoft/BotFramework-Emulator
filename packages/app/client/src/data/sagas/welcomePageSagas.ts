import {
  BotInfo,
  newNotification,
  SharedConstants
} from "@bfemulator/app-shared";
import { ForkEffect, put, takeEvery } from "redux-saga/effects";

import { CommandServiceImpl } from "../../platform/commands/commandServiceImpl";
import { beginAdd } from "../action/notificationActions";
import {
  OPEN_CONTEXT_MENU_FOR_BOT,
  WelcomePageAction
} from "../action/welcomePageActions";

function* openContextMenuForBot(
  action: WelcomePageAction<BotInfo>
): IterableIterator<any> {
  const menuItems = [
    { label: "Move...", id: 0 },
    { label: "Open file location", id: 1 },
    { label: "Forget this bot", id: 2 }
  ];

  const result = yield CommandServiceImpl.remoteCall(
    SharedConstants.Commands.Electron.DisplayContextMenu,
    menuItems
  );
  switch (result.id) {
    case 0:
      yield* moveBotToNewLocation(action.payload);
      break;

    case 1:
      yield CommandServiceImpl.remoteCall(
        SharedConstants.Commands.Electron.OpenFileLocation,
        action.payload.path
      );
      break;

    case 2:
      yield CommandServiceImpl.remoteCall(
        SharedConstants.Commands.Bot.RemoveFromBotList,
        action.payload.path
      );
      break;

    default:
      // Canceled context menu
      break;
  }
}

function* moveBotToNewLocation(bot: BotInfo): IterableIterator<any> {
  const newPath = yield CommandServiceImpl.remoteCall(
    SharedConstants.Commands.Electron.ShowSaveDialog,
    {
      defaultPath: bot.path,
      buttonLabel: "Move",
      nameFieldLabel: "Name",
      filters: [{ extensions: [".bot"] }]
    }
  );
  if (!newPath) {
    return;
  }
  try {
    const { path: oldPath } = bot;
    bot.path = newPath;
    yield CommandServiceImpl.remoteCall(
      SharedConstants.Commands.Electron.RenameFile,
      { path: oldPath, newPath }
    );
    yield CommandServiceImpl.remoteCall(
      SharedConstants.Commands.Bot.PatchBotList,
      oldPath,
      bot
    );
  } catch (e) {
    const errMsg = `Error occurred while moving the bot file: ${e}`;
    const notification = newNotification(errMsg);
    yield put(beginAdd(notification));
  }
}

export function* welcomePageSagas(): IterableIterator<ForkEffect> {
  yield takeEvery(OPEN_CONTEXT_MENU_FOR_BOT, openContextMenuForBot);
}
