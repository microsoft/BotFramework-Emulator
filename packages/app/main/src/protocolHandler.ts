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

import { openBotViaUrlAction, openTranscript, newNotification, SharedConstants } from '@bfemulator/app-shared';
import got from 'got';
import { IEndpointService } from 'botframework-config/lib/schema';
import {
  applyBotConfigOverrides,
  BotConfigOverrides,
  BotConfigWithPath,
  CommandServiceImpl,
  CommandServiceInstance,
} from '@bfemulator/sdk-shared';

import { Protocol } from './constants';
import { store } from './state/store';
import { sendNotificationToClient } from './utils/sendNotificationToClient';
import { TelemetryService } from './telemetry';

enum ProtocolDomains {
  livechat,
  transcript,
  bot,
  inspector,
}

export enum ProtocolLiveChatActions {
  open,
}

export enum ProtocolTranscriptActions {
  open,
}

export enum ProtocolBotActions {
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

class ProtocolHandlerImpl implements ProtocolHandler {
  @CommandServiceInstance()
  private commandService: CommandServiceImpl;

  /** Extracts useful information out of a protocol URL */
  public parseProtocolUrl(url: string): Protocol {
    const parsedUrl = new URL(url);
    if (!Protocol.startsWith(parsedUrl.protocol)) {
      throw new Error(`Invalid protocol url. Must start with '${Protocol}'`);
    }

    // grab what's left after the protocol prefix (protocol automatically places '/' before query string params)
    const domainAndAction = (parsedUrl.hostname || '').toLowerCase().split('.');
    const [domain = '', action = ''] = domainAndAction;
    const parsedArgs = {};
    parsedUrl.searchParams.forEach((value: string, key: string) => (parsedArgs[key] = value));
    return {
      domain,
      action,
      args: (parsedUrl.search || '').replace(/(\?)/, ''),
      parsedArgs,
    };
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

      case ProtocolDomains.inspector:
        this.performInspectorAction(protocol);
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
    const {
      botUrl: endpoint,
      msaAppId: appId,
      msaAppPassword: appPassword,
      cloud: channelService,
    } = protocol.parsedArgs;
    store.dispatch(
      openBotViaUrlAction({
        endpoint,
        appId,
        appPassword,
        mode: 'livechat',
        channelService,
      })
    );
  }

  public performTranscriptAction(protocol: Protocol): void {
    this.openTranscript(protocol);
  }

  public performBotAction(protocol: Protocol): void {
    this.openBot(protocol);
  }

  public performInspectorAction(protocol: Protocol): void {
    const {
      botUrl: endpoint,
      msaAppId: appId,
      msaAppPassword: appPassword,
      cloud: channelService,
    } = protocol.parsedArgs;
    store.dispatch(
      openBotViaUrlAction({
        endpoint,
        appId,
        appPassword,
        mode: 'debug',
        channelService,
      })
    );
  }

  /** Downloads a transcript from a URL provided in the protocol string,
   *  parses out the list of activities, and has the client side open it
   */
  public openTranscript(protocol: Protocol): Promise<void> {
    const { url } = protocol.parsedArgs;

    return got(url)
      .then(res => {
        if (res.statusCode === 200) {
          if (res.body) {
            try {
              // parse the activities from the downloaded transcript
              const transcriptString = res.body;
              const activities = JSON.parse(transcriptString);
              if (!Array.isArray(activities)) {
                throw new Error('Invalid transcript file contents; should be an array of conversation activities.');
              }
              const { name, ext } = Path.parse(url);
              const filename = `${name}${ext}`;
              store.dispatch(openTranscript(filename, activities));
            } catch (e) {
              throw new Error(`Error occured while reading downloaded transcript: ${e}`);
            }
          }
        } else {
          if (res.statusCode === 401) {
            // auth failed
            const stat = res.body || res.statusMessage || '';
            throw new Error(`Authorization error while trying to download transcript: ${stat}`);
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
        sendNotificationToClient(notification, this.commandService);
      });
  }

  /** Opens the bot project associated with the .bot file at the specified path */
  public async openBot(protocol: Protocol): Promise<void> {
    const { path, secret }: { path: string; secret: string } = protocol.parsedArgs;

    const endpointOverrides: Partial<IEndpointService> = parseEndpointOverrides(protocol.parsedArgs);
    const overrides: BotConfigOverrides = endpointOverrides ? { endpoint: endpointOverrides } : null;

    let bot: BotConfigWithPath;
    try {
      bot = (await this.commandService.call(SharedConstants.Commands.Bot.Open, path, secret)) as BotConfigWithPath;
      if (!bot) {
        throw new Error(
          `Error occurred while trying to open bot at ${path} inside of protocol handler: Bot is invalid.`
        );
      }
    } catch (e) {
      throw new Error(`Error occurred while trying to open bot at ${path} inside of protocol handler: ${e}`);
    }

    // apply any overrides
    if (overrides) {
      bot = applyBotConfigOverrides(bot, overrides);
    }

    try {
      await this.commandService.call(SharedConstants.Commands.Bot.SetActive, bot);
      await this.commandService.remoteCall(SharedConstants.Commands.Bot.Load, bot);
    } catch (e) {
      throw new Error(`Error occurred while trying to deep link to bot project at ${path}: ${e}`);
    }

    const numOfServices = bot.services && bot.services.length;
    TelemetryService.trackEvent('bot_open', {
      method: 'protocol',
      numOfServices,
      source: 'path',
    });
  }
}

export const ProtocolHandler = new ProtocolHandlerImpl();

/**
 * Takes the list of parsed protocol URI query params and constructs an endpoint service
 * override object if there are appropriate parameters
 * @param parsedArgs Parsed protocol URI query parameters
 */
export function parseEndpointOverrides(parsedArgs: { [key: string]: string }): Partial<IEndpointService> {
  if (!parsedArgs || !Object.keys(parsedArgs).length) {
    return null;
  }

  const endpointOverrides: Partial<IEndpointService> = {};
  const { appId = null, appPassword = null, endpoint = null, id = null } = parsedArgs;

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
