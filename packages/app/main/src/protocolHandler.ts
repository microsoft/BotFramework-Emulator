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

import { FrameworkSettings, newBot, newEndpoint, SharedConstants } from '@bfemulator/app-shared';
import * as got from 'got';
import { IEndpointService } from 'msbot/bin/schema';
import { BotConfigWithPath, BotConfigWithPathImpl } from '@bfemulator/sdk-shared';
import * as Path from 'path';
import * as QueryString from 'querystring';
import { Protocol } from './constants';
import * as BotActions from './data-v2/action/bot';
import { mainWindow } from './main';
import { ngrokEmitter, running } from './ngrok';
import { getSettings } from './settings';
import { emulator } from './emulator';
import { getStore } from './data-v2/store';

enum ProtocolDomains {
  livechat,
  transcript,
  bot
}

enum ProtocolLiveChatActions {
  open
}

enum ProtocolTranscriptActions {
  open
}

enum ProtocolBotActions {
  open
}

interface Protocol {
  // the 'controller'
  domain?: string;
  // the 'action' or 'route' within the controller
  action?: string;
  // any extra info passed in
  args?: string;
  // object reprsentation of args
  parsedArgs?: { [key: string]: string } | any;
}

interface ProtocolHandler {
  parseProtocolUrl: (url: string) => Protocol;
  dispatchProtocolAction: (protocol: Protocol) => void;
  performLiveChatAction: (protocol: Protocol) => void;
  performTranscriptAction: (protocol: Protocol) => void;
  performBotAction: (protocol: Protocol) => void;
}

export const ProtocolHandler = new class ProtocolHandlerImpl implements ProtocolHandler {

  /** Extracts useful information out of a protocol URL */
  parseProtocolUrl(url: string): Protocol {
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
    const args = (chunks[1] || '');
    const parsedArgs = QueryString.parse(args);

    const info: Protocol = {
      domain,
      action,
      args,
      parsedArgs
    };

    return info;
  }

  /** Uses information from a protocol URL and carries out the corresponding action */
  dispatchProtocolAction(protocol: Protocol): void {
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
  parseProtocolUrlAndDispatch(url: string): void {
    this.dispatchProtocolAction(this.parseProtocolUrl(url));
  }

  performLiveChatAction(protocol: Protocol): void {
    switch (ProtocolLiveChatActions[protocol.action]) {
      case ProtocolLiveChatActions.open:
        this.openLiveChat(protocol);
        break;

      default:
        break;
    }
  }

  performTranscriptAction(protocol: Protocol): void {
    switch (ProtocolTranscriptActions[protocol.action]) {
      case ProtocolTranscriptActions.open:
        this.openTranscript(protocol);
        break;

      default:
        break;
    }
  }

  performBotAction(protocol: Protocol): void {
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
  private async openLiveChat(protocol: Protocol): Promise<void> {
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
      if (!ngrokSpawnStatus.triedToSpawn || (ngrokSpawnStatus.triedToSpawn && ngrokSpawnStatus.err)) {
        throw new Error(`Error while trying to spawn ngrok instance: ${ngrokSpawnStatus.err || ''}`);
      }

      // make sure there is an active bot on the client side and the emulator object contains the new endpoint
      await mainWindow.commandService.remoteCall('bot:set-active', bot, '');
      await mainWindow.commandService.call('bot:restart-endpoint-service');

      if (running()) {
        mainWindow.commandService.remoteCall('livechat:new', endpoint);
      } else {
        // if ngrok hasn't connected yet, wait for it to connect and start the livechat
        ngrokEmitter.once('connect', (...args: any[]): void => {
          mainWindow.commandService.remoteCall('livechat:new', endpoint);
        });
      }
    } else {
      // try to connect and let the chat log show the user the error
      mainWindow.commandService.remoteCall('livechat:new', endpoint);
    }
  }

  /** Downloads a transcript from a URL provided in the protocol string,
   *  parses out the list of activities, and has the client side open it
   */
  private openTranscript(protocol: Protocol): void {
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
                throw new Error('Invalid transcript file contents; should be an array of conversation activities.');
              }
              const { name, ext } = Path.parse(url);
              const fileName = `${name}${ext}`;
              // open a transcript on the client side and pass in some
              // extra info to differentiate it from a transcript on disk
              mainWindow.commandService.remoteCall('transcript:open', 'deepLinkedTranscript',
                { activities: conversationActivities, deepLink: true, fileName });
            } catch (e) {
              throw new Error(`Error occured while reading downloaded transcript: ${e}`);
            }
          }
        } else {
          if (res.statusCode === 401) {
            // auth failed
            const stat = res.body || res.statusText || '';
            throw new Error(`Authorization error while trying to download transcript: ${stat}`);
          }
          if (res.statusCode === 404) {
            // transcript link is broken / doesn't exist anymore
            throw new Error(`Transcript file not found at: ${url}`);
          }
        }
      })
      .catch(err => {
        // TODO: surface this error somewhere; native error box?
        console.error('Error downloading and parsing transcript file: ', err);
      });
  }

  /** Opens the bot project associated with the .bot file at the specified path */
  private openBot(protocol: Protocol): void {
    const { path, secret }: { path: string, secret: string } = protocol.parsedArgs;

    const appSettings: FrameworkSettings = getSettings().framework;
    if (appSettings.ngrokPath) {
      const ngrokSpawnStatus = emulator.ngrok.getSpawnStatus();
      if (!ngrokSpawnStatus.triedToSpawn || (ngrokSpawnStatus.triedToSpawn && ngrokSpawnStatus.err)) {
        throw new Error(`Error while trying to spawn ngrok instance: ${ngrokSpawnStatus.err || ''}`);
      }

      if (running()) {
        mainWindow.commandService.call('bot:load', path, secret)
          .then(() => console.log('opened bot successfully'))
          // TODO: surface this error somewhere; native error box?
          .catch(err => {
            throw new Error(`Error occurred while trying to deep link to bot project at: ${path}`);
          });
      } else {
        // if ngrok hasn't connected yet, wait for it to connect and load the bot
        ngrokEmitter.once('connect', (...args: any[]): void => {
          mainWindow.commandService.call('bot:load', path, secret)
            .then(() => console.log('opened bot successfully'))
            // TODO: surface this error somewhere; native error box?
            .catch(err => {
              throw new Error(`Error occurred while trying to deep link to bot project at: ${path}`);
            });
        });
      }
    } else {
      // load the bot and let the chat log show the user the error
      mainWindow.commandService.call('bot:load', path, secret)
        .then(() => console.log('opened bot successfully'))
        // TODO: surface this error somewhere; native error box?
        .catch(err => {
          throw new Error(`Error occurred while trying to deep link to bot project at: ${path}`);
        });
    }
  }
};
