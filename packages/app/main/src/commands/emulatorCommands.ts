//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

import * as path from 'path';

import { SharedConstants } from '@bfemulator/app-shared';
import * as BotActions from '@bfemulator/app-shared/built/state/actions/botActions';
import {
  BotConfigWithPath,
  Command,
  CommandServiceImpl,
  CommandServiceInstance,
  ConversationService,
} from '@bfemulator/sdk-shared';
import * as fs from 'fs-extra';
import { sync as mkdirpSync } from 'mkdirp';
import { session } from 'electron';

import { BotHelpers } from '../botHelpers';
import { Emulator } from '../emulator';
import { emulatorApplication } from '../main';
import { store, getSettings } from '../state/store';
import { parseActivitiesFromChatFile, readFileSync, showSaveDialog, writeFile } from '../utils';
import { CustomActivity } from '../utils/conversation';
import { botProjectFileWatcher } from '../watchers';
import { TelemetryService } from '../telemetry';
import { ProtocolHandler } from '../protocolHandler';
import { CredentialManager } from '../credentialManager';
import { getCurrentConversationId } from '../state/helpers/chatHelpers';
import { getLocalhostServiceUrl } from '../utils/getLocalhostServiceUrl';

const Commands = SharedConstants.Commands.Emulator;

/** Registers emulator (actual conversation emulation logic) commands */
export class EmulatorCommands {
  @CommandServiceInstance()
  private commandService: CommandServiceImpl;
  // ---------------------------------------------------------------------------
  // Saves the conversation to a transcript file, with user interaction to set filename.
  @Command(Commands.SaveTranscriptToFile)
  protected async saveTranscriptToFile(valueTypes: number, conversationId: string): Promise<boolean> {
    const activeBot: BotConfigWithPath = BotHelpers.getActiveBot();
    const conversation = Emulator.getInstance().server.state.conversations.conversationById(conversationId);
    if (!conversation) {
      throw new Error(`${Commands.SaveTranscriptToFile}: Conversation ${conversationId} not found.`);
    }
    let botInfo = activeBot ? BotHelpers.getBotInfoByPath(activeBot.path) : {};

    const filename = showSaveDialog(emulatorApplication.mainWindow.browserWindow, {
      // TODO - Localization
      filters: [
        {
          name: 'Transcript Files',
          extensions: ['transcript'],
        },
      ],
      defaultPath: BotHelpers.getTranscriptsPath(activeBot, conversation),
      showsTagField: false,
      title: 'Save conversation transcript',
      buttonLabel: 'Save',
    });

    if (filename && filename.length) {
      mkdirpSync(path.dirname(filename));
      const transcripts = await conversation.getTranscript(valueTypes);
      writeFile(filename, transcripts);
      TelemetryService.trackEvent('transcript_save');
    } else {
      return false;
    }

    if (!activeBot) {
      return true;
    }

    // If there is no current bot directory, we should set the directory
    // that the transcript is saved in as the bot directory, copy the botfile over,
    // change the bots.json entry, and watch the directory.
    const { currentBotDirectory } = store.getState().bot;
    if (!currentBotDirectory && filename && filename.length) {
      const secret = await CredentialManager.getPassword(activeBot.path);
      const saveableBot = BotHelpers.toSavableBot(activeBot, secret);
      const botDirectory = path.dirname(filename);
      const botPath = path.join(botDirectory, `${activeBot.name}.bot`);
      botInfo = { ...botInfo, path: botPath };

      await saveableBot.save(botPath);
      BotHelpers.patchBotsJson(botPath, botInfo);
      await botProjectFileWatcher.watch(botPath);
      store.dispatch(BotActions.setDirectory(botDirectory));
    }

    return true;
  }

  @Command(Commands.ExtractActivitiesFromFile)
  protected async extractActivitiesFromDisk(
    filePath: string
  ): Promise<{ activities: CustomActivity[]; fileName: string; filePath: string }> {
    const transcriptPath = path.resolve(filePath);
    const stat = await fs.stat(transcriptPath);

    if (!stat || !stat.isFile()) {
      throw new Error(`${Commands.ExtractActivitiesFromFile}: File ${filePath} not found.`);
    }

    let activities;
    if (filePath.endsWith('.chat')) {
      // use chatdown to convert the chat file to activities
      activities = await parseActivitiesFromChatFile(filePath);
    } else {
      activities = JSON.parse(readFileSync(transcriptPath));
    }
    const { name, ext } = path.parse(transcriptPath);
    const fileName = `${name}${ext}`;

    return {
      activities,
      fileName,
      filePath,
    };
  }

  // ---------------------------------------------------------------------------
  // Get a speech token
  @Command(Commands.GetSpeechToken)
  protected getSpeechToken(endpointId: string, refresh: boolean) {
    const endpoint = Emulator.getInstance().server.state.endpoints.get(endpointId);

    return endpoint && endpoint.getSpeechToken(refresh);
  }

  // ---------------------------------------------------------------------------
  // Removes the conversation from the conversation set
  @Command(Commands.DeleteConversation)
  protected deleteConversation(conversationId: string) {
    return Emulator.getInstance().server.state.conversations.deleteConversation(conversationId);
  }

  @Command(Commands.StartEmulator)
  protected async startEmulator(forceRestart = false) {
    const emulator = Emulator.getInstance();
    if (!forceRestart && !!emulator.server.serverPort) {
      return;
    }
    await emulator.startup();
    const { framework } = getSettings();

    const { state } = emulator.server;
    state.locale = framework.locale;
  }

  @Command(Commands.OpenProtocolUrls)
  protected async openProtocolUrls() {
    const {
      protocol: { openUrls },
    } = store.getState();
    if (openUrls.length) {
      await Promise.all(openUrls.map(url => ProtocolHandler.parseProtocolUrlAndDispatch(url)));
    }
    openUrls.length = 0;
  }

  @Command(Commands.ClearState)
  protected async clearState() {
    const { signedInUser } = getSettings().azure;
    const signedInMessage = signedInUser
      ? 'This will log you out of Azure and remove any session based data. Continue?'
      : 'This will remove any session based data. Continue?';

    const bClearState = await this.commandService.call(SharedConstants.Commands.Electron.ShowMessageBox, true, {
      buttons: ['Cancel', 'OK'],
      cancelId: 0,
      message: signedInMessage,
      type: 'question',
    });

    if (bClearState === 1) {
      await this.commandService.call(SharedConstants.Commands.Electron.ShowMessageBox, false, {
        message: 'You have successfully cleared state.',
        title: 'Success!',
      });
      await session.defaultSession.clearStorageData({});
    }

    return true;
  }

  // ---------------------------------------------------------------------------
  // Sends a conversation update activity for the addition of the user to the current conversation
  @Command(Commands.SendConversationUpdateUserAdded)
  protected async sendConversationUpdateUserAdded() {
    ConversationService.addUser(getLocalhostServiceUrl(), getCurrentConversationId());
    TelemetryService.trackEvent('sendActivity_addUser');
  }

  // ---------------------------------------------------------------------------
  // Sends an activity for the addition of a bot contact to the current conversation
  @Command(Commands.SendBotContactAdded)
  protected async sendBotContactAdded() {
    ConversationService.botContactAdded(getLocalhostServiceUrl(), getCurrentConversationId());
    TelemetryService.trackEvent('sendActivity_botContactAdded');
  }

  // ---------------------------------------------------------------------------
  // Sends an activity for the removal of a bot contact from the current conversation
  @Command(Commands.SendBotContactRemoved)
  protected async sendBotContactRemoved() {
    ConversationService.botContactRemoved(getLocalhostServiceUrl(), getCurrentConversationId());
    TelemetryService.trackEvent('sendActivity_botContactRemoved');
  }

  // ---------------------------------------------------------------------------
  // Sends a typing activity to the current conversation
  @Command(Commands.SendTyping)
  protected async sendTyping() {
    ConversationService.typing(getLocalhostServiceUrl(), getCurrentConversationId());
    TelemetryService.trackEvent('sendActivity_typing');
  }

  // ---------------------------------------------------------------------------
  // Sends a ping activity to the current conversation
  @Command(Commands.SendPing)
  protected async sendPing() {
    ConversationService.ping(getLocalhostServiceUrl(), getCurrentConversationId());
    TelemetryService.trackEvent('sendActivity_ping');
  }

  // ---------------------------------------------------------------------------
  // Sends a delete user data activity to the current conversation
  @Command(Commands.SendDeleteUserData)
  protected async sendDeleteUserData() {
    ConversationService.deleteUserData(getLocalhostServiceUrl(), getCurrentConversationId());
    TelemetryService.trackEvent('sendActivity_deleteUserData');
  }

  // ---------------------------------------------------------------------------
  // Returns the current Emulator's service url
  @Command(Commands.GetServiceUrl)
  protected async getServiceUrl() {
    return Emulator.getInstance().server.getServiceUrl('');
  }
}
