import { Bot } from "@bfemulator/app-shared";
import { Action } from "redux";

export const ADD_OR_UPDATE_BOT = "ADD_OR_UPDATE_BOT";
export declare type AddOrUpdateBotType = "ADD_OR_UPDATE_BOT";

export interface BotAction<P> extends Action {
  type: AddOrUpdateBotType;
  state: P;
}

export interface BotsPayload {
  bots: Bot[];
}

export function addOrUpdateBots(bots: Bot[]): BotAction<BotsPayload> {
  return {
    type: ADD_OR_UPDATE_BOT,
    state: { bots }
  };
}
