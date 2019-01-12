import { SharedConstants } from "@bfemulator/app-shared";
import { CommandService } from "@bfemulator/sdk-shared";
import * as path from "path";

import { readFileSync } from "./readFileSync";

export async function openFileFromCommandLine(
  fileToBeOpened: string,
  commandService: CommandService
): Promise<void> {
  const { Bot, Emulator } = SharedConstants.Commands;
  if (path.extname(fileToBeOpened) === ".bot") {
    try {
      const bot = await commandService.call(Bot.Open, fileToBeOpened);
      await commandService.call(Bot.SetActive, bot);
      await commandService.remoteCall(Bot.Load, bot);
    } catch (e) {
      throw new Error(
        `Error while trying to open a .bot file via double click at: ${fileToBeOpened}`
      );
    }
  } else if (path.extname(fileToBeOpened) === ".transcript") {
    const transcript = readFileSync(fileToBeOpened);
    const conversationActivities = JSON.parse(transcript);
    if (!Array.isArray(conversationActivities)) {
      throw new Error(
        "Invalid transcript file contents; should be an array of conversation activities."
      );
    }

    // open a transcript on the client side and pass in
    // some extra info to differentiate it from a transcript on disk
    await commandService.remoteCall(
      Emulator.OpenTranscript,
      "deepLinkedTranscript",
      {
        activities: conversationActivities,
        inMemory: true
      }
    );
  }
}
