import { BotProjectFileWatcher } from "./botProjectFileWatcher";
import { ChatWatcher } from "./chatWatcher";
import { TranscriptsWatcher } from "./transcriptsWatcher";

export const botProjectFileWatcher = new BotProjectFileWatcher();
export const chatWatcher = new ChatWatcher();
export const transcriptsWatcher = new TranscriptsWatcher();
