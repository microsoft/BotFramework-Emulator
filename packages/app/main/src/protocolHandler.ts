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

import * as Path from 'path';
import * as QueryString from 'querystring';

import {
  FrameworkSettings,
  newBot,
  newEndpoint,
  newNotification,
  SharedConstants,
} from '@bfemulator/app-shared';
import {
  applyBotConfigOverrides,
  BotConfigOverrides,
  BotConfigWithPath,
  BotConfigWithPathImpl,
} from '@bfemulator/sdk-shared';
import { IEndpointService } from 'botframework-config/lib/schema';
import got from 'got';

import * as BotActions from './botData/actions/botActions';
import { getStore } from './botData/store';
import { Protocol } from './constants';
import { emulator } from './emulator';
import { mainWindow } from './main';
import { ngrokEmitter, running } from './ngrok';
import { getSettings } from './settingsData/store';
import { sendNotificationToClient } from './utils/sendNotificationToClient';

enum ProtocolDomains {
  livechat,
  transcript,
  bot,
}

enum ProtocolLiveChatActions {
  open,
}

enum ProtocolTranscriptActions {
  open,
}

enum ProtocolBotActions {
  open,
}

export interface Protocol {
  // the 'controller'
  domain?: string;
  // the 'action' or 'route' within the controller
  action?: string;
  // any extra info passed in
  args?: string;
  // object reprsentation of args
  parsedArgs?: { [key: string]: string } | any;
}

export interface ProtocolHandler {
  parseProtocolUrl: (url: string) => Protocol;
  dispatchProtocolAction: (protocol: Protocol) => void;
  performLiveChatAction: (protocol: Protocol) => void;
  performTranscriptAction: (protocol: Protocol) => void;
  performBotAction: (protocol: Protocol) => void;
}

export const ProtocolHandler = new class ProtocolHandlerImpl
  implements ProtocolHandler {
  /** Extracts useful information out of a protocol URL */
  public parseProtocolUrl(url: string): Protocol {
    const validProtocol = /^bfemulator:\/\//;
    if (!validProtocol.test(url)) {
      throw new Error(`Invalid protocol url. Must start with '${Protocol}'`);
    }

    // grab what's left after the protocol prefix (protocol automatically places '/' before query string params)
    const restOfUrl = url.substring(Protocol.length).replace(/\//g, '');

    // split into two parts: domain.action?args -> ['domain.action', 'args']
    const chunks = restOfUrl.split('?');
    const domainAndAction = chunks[0].split('.');

    const domain = (domainAndAction[0] || '').toLowerCase();
    const action = (domainAndAction[1] || '').toLowerCase();
    const args = chunks[1] || '';
    const parsedArgs = QueryString.parse(args);

    const info: Protocol = {
      domain,
      action,
      args,
      parsedArgs,
    };

    return info;
  }

  /** Uses information from a protocol URL and carries out the corresponding action */
  public dispatchProtocolAction(protocol: Protocol): void {
    switch (ProtocolDomains[protocol.domain]) {
      case ProtocolDomains.bot:
        this.performBotAction(protocol);
        break;

      case ProtocolDomains.livechat:
        this.performLiveChatAction(protocol);
        break;

      case ProtocolDomains.transcript:
        this.performTranscriptAction(protocol);
        break;

      default:
        break;
    }
  }

  /** Reads in a protocol URL and then performs the corresponding action if valid */
  public parseProtocolUrlAndDispatch(url: string): void {
    this.dispatchProtocolAction(this.parseProtocolUrl(url));
  }

  public performLiveChatAction(protocol: Protocol): void {
    switch (ProtocolLiveChatActions[protocol.action]) {
      case ProtocolLiveChatActions.open:
        this.openLiveChat(protocol);
        break;

      default:
        break;
    }
  }

  public performTranscriptAction(protocol: Protocol): void {
    switch (ProtocolTranscriptActions[protocol.action]) {
      case ProtocolTranscriptActions.open:
        this.openTranscript(protocol);
        break;

      default:
        break;
    }
  }

  public performBotAction(protocol: Protocol): void {
    switch (ProtocolBotActions[protocol.action]) {
      case ProtocolBotActions.open:
        this.openBot(protocol);
        break;

      default:
        break;
    }
  }

  /** Mocks a bot object with any configuration parsed from the
   *  protocol string and starts a live chat session with that bot
   */
  public async openLiveChat(protocol: Protocol): Promise<void> {
    // mock up a bot object
    const { botUrl, msaAppId, msaPassword } = protocol.parsedArgs;
    const bot: BotConfigWithPath = BotConfigWithPathImpl.fromJSON(newBot());
    bot.name = '';
    bot.path = SharedConstants.TEMP_BOT_IN_MEMORY_PATH;

    const endpoint: IEndpointService = newEndpoint();
    endpoint.endpoint = botUrl;
    endpoint.appId = msaAppId;
    endpoint.appPassword = msaPassword;
    endpoint.id = botUrl;
    endpoint.name = 'New livechat';

    bot.services.push(endpoint);
    getStore().dispatch(BotActions.mockAndSetActive(bot));

    const appSettings: FrameworkSettings = getSettings().framework;

    if (appSettings.ngrokPath) {
      const ngrokSpawnStatus = emulator.ngrok.getSpawnStatus();
      if (
        !ngrokSpawnStatus.triedToSpawn ||
        (ngrokSpawnStatus.triedToSpawn && ngrokSpawnStatus.err)
      ) {
        throw new Error(
          `Error while trying to spawn ngrok instance: ${ngrokSpawnStatus.err ||
            ''}`
        );
      }

      // make sure there is an active bot on the client side and the emulator object contains the new endpoint
      await mainWindow.commandService.remoteCall(
        SharedConstants.Commands.Bot.SetActive,
        bot,
        ''
      );
      await mainWindow.commandService.call(
        SharedConstants.Commands.Bot.RestartEndpointService
      );

      if (running()) {
        mainWindow.commandService.remoteCall(
          SharedConstants.Commands.Emulator.NewLiveChat,
          endpoint
        );
      } else {
        // if ngrok hasn't connected yet, wait for it to connect and start the livechat
        ngrokEmitter.once(
          'connect',
          (...args: any[]): void => {
            mainWindow.commandService.remoteCall(
              SharedConstants.Commands.Emulator.NewLiveChat,
              endpoint
            );
          }
        );
      }
    } else {
      // try to connect and let the chat log showExplorer the user the error
      mainWindow.commandService.remoteCall(
        SharedConstants.Commands.Emulator.NewLiveChat,
        endpoint
      );
    }
  }

  /** Downloads a transcript from a URL provided in the protocol string,
   *  parses out the list of activities, and has the client side open it
   */
  public openTranscript(protocol: Protocol): void {
    const { url } = protocol.parsedArgs;
    const options = { url };

    got(options)
      .then(res => {
        if (/^2\d\d$/.test(res.statusCode)) {
          if (res.body) {
            try {
              // parse the activities from the downloaded transcript
              const transcriptString = res.body;
              const conversationActivities = JSON.parse(transcriptString);
              if (!Array.isArray(conversationActivities)) {
                throw new Error(
                  'Invalid transcript file contents; should be an array of conversation activities.'
                );
              }
              const { name, ext } = Path.parse(url);
              const fileName = `${name}${ext}`;
              // open a transcript on the client side and pass in some
              // extra info to differentiate it from a transcript on disk
              mainWindow.commandService.remoteCall(
                SharedConstants.Commands.Emulator.OpenTranscript,
                'deepLinkedTranscript',
                { activities: conversationActivities, inMemory: true, fileName }
              );
            } catch (e) {
              throw new Error(
                `Error occured while reading downloaded transcript: ${e}`
              );
            }
          }
        } else {
          if (res.statusCode === 401) {
            // auth failed
            const stat = res.body || res.statusText || '';
            throw new Error(
              `Authorization error while trying to download transcript: ${stat}`
            );
          }
          if (res.statusCode === 404) {
            // transcript link is broken / doesn't exist anymore
            throw new Error(`Transcript file not found at: ${url}`);
          }
        }
      })
      .catch(err => {
        const errMsg = `Error downloading and parsing transcript file: ${err}`;
        const notification = newNotification(errMsg);
        sendNotificationToClient(notification, mainWindow.commandService);
      });
  }

  /** Opens the bot project associated with the .bot file at the specified path */
  public async openBot(protocol: Protocol): Promise<void> {
    const {
      path,
      secret,
    }: { path: string; secret: string } = protocol.parsedArgs;

    const endpointOverrides: Partial<IEndpointService> = parseEndpointOverrides(
      protocol.parsedArgs
    );
    const overrides: BotConfigOverrides = endpointOverrides
      ? { endpoint: endpointOverrides }
      : null;

    let bot: BotConfigWithPath;
    try {
      bot = await mainWindow.commandService.call(
        SharedConstants.Commands.Bot.Open,
        path,
        secret
      );
      if (!bot) {
        throw new Error(
          `Error occurred while trying to open bot at: ${path} inside of protocol handler.`
        );
      }
    } catch (e) {
      throw new Error(
        `Error occurred while trying to open bot at: ${path} inside of protocol handler.`
      );
    }

    // apply any overrides
    if (overrides) {
      bot = applyBotConfigOverrides(bot, overrides);
    }

    const appSettings: FrameworkSettings = getSettings().framework;
    if (appSettings.ngrokPath) {
      const ngrokSpawnStatus = emulator.ngrok.getSpawnStatus();
      if (
        !ngrokSpawnStatus.triedToSpawn ||
        (ngrokSpawnStatus.triedToSpawn && ngrokSpawnStatus.err)
      ) {
        throw new Error(
          `Error while trying to spawn ngrok instance: ${ngrokSpawnStatus.err ||
            ''}`
        );
      }

      if (running()) {
        try {
          await mainWindow.commandService.call(
            SharedConstants.Commands.Bot.SetActive,
            bot
          );
          await mainWindow.commandService.remoteCall(
            SharedConstants.Commands.Bot.Load,
            bot
          );
        } catch (e) {
          throw new Error(
            `(ngrok running) Error occurred while trying to deep link to bot project at: ${path}.`
          );
        }
      } else {
        // if ngrok hasn't connected yet, wait for it to connect and load the bot
        ngrokEmitter.once(
          'connect',
          async (...args: any[]): Promise<void> => {
            try {
              await mainWindow.commandService.call(
                SharedConstants.Commands.Bot.SetActive,
                bot
              );
              await mainWindow.commandService.remoteCall(
                SharedConstants.Commands.Bot.Load,
                bot
              );
            } catch (e) {
              throw new Error(
                `(ngrok running but not connected) Error occurred while trying to deep link to bot project at: ${path}.`
              );
            }
          }
        );
      }
    } else {
      try {
        await mainWindow.commandService.call(
          SharedConstants.Commands.Bot.SetActive,
          bot
        );
        await mainWindow.commandService.remoteCall(
          SharedConstants.Commands.Bot.Load,
          bot
        );
      } catch (e) {
        throw new Error(
          `(ngrok not configured) Error occurred while trying to deep link to bot project at: ${path}`
        );
      }
    }
  }
}();

/**
 * Takes the list of parsed protocol URI query params and constructs an endpoint service
 * override object if there are appropriate parameters
 * @param parsedArgs Parsed protocol URI query parameters
 */
export function parseEndpointOverrides(parsedArgs: {
  [key: string]: string;
}): Partial<IEndpointService> {
  if (!parsedArgs || !Object.keys(parsedArgs).length) {
    return null;
  }

  const endpointOverrides: Partial<IEndpointService> = {};
  const {
    appId = null,
    appPassword = null,
    endpoint = null,
    id = null,
  } = parsedArgs;

  if (appId) {
    endpointOverrides.appId = appId;
  }
  if (appPassword) {
    endpointOverrides.appPassword = appPassword;
  }
  if (endpoint) {
    endpointOverrides.endpoint = endpoint;
  }
  if (id) {
    endpointOverrides.id = id;
  }
  // if no overrides were parsed, then return null
  if (!Object.keys(endpointOverrides).length) {
    return null;
  }
  return endpointOverrides;
}
