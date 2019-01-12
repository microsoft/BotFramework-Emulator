import { BotInfo } from "@bfemulator/app-shared";
import { Action } from "redux";

export const OPEN_CONTEXT_MENU_FOR_BOT = "OPEN_CONTEXT_MENU_FOR_BOT";

export interface WelcomePageAction<T> extends Action {
  payload: T;
}

export function openContextMenuForBot(
  bot: BotInfo
): WelcomePageAction<BotInfo> {
  return {
    type: OPEN_CONTEXT_MENU_FOR_BOT,
    payload: bot
  };
}
