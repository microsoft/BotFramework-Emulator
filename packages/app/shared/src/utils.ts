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

// We need to skip Webpack bundler on bundling 'electron':
// 1. We are using react-scripts, thus, we are not able to configure Webpack
// 2. To skip bundling, we can hack with window['require']

import { IBotConfig, IEndpointService, ServiceType, uniqueId } from '@bfemulator/sdk-shared';

export function isObject(item: any): boolean {
  return (item && typeof item === 'object' && !Array.isArray(item) && item !== null);
}

export function mergeDeep(target: any, source: any): any {
  let output = Object.assign({}, target);
  //if (isObject(target) && isObject(source)) {
  {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target))
          Object.assign(output, { [key]: source[key] });
        else
          output[key] = mergeDeep(target[key], source[key]);
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

export function deepCopySlow(obj: any): any {
  return JSON.parse(JSON.stringify(obj));
}

export const safeStringify = (o: any, space: string | number = undefined): string => {
  let cache = [];
  if (typeof o !== 'object')
    return `${o}`;
  return JSON.stringify(o, function (key, value) {
    if (typeof value === 'object' && value !== null) {
      if (cache.indexOf(value) !== -1) {
        return;
      }
      cache.push(value);
    }
    return value;
  }, space);
}

export const approximateObjectSize = (object: any, cache: any[] = []): number => {
  switch (typeof object) {
    case 'boolean':
      return 4;
    case 'number':
      return 8;
    case 'string':
      return object.length * 2;
    case 'object':
      let bytes = 0;
      cache.push(object);
      for (let i in object) {
        let value = object[i];
        //check for infinite recursion
        if (typeof value === 'object' && value !== null) {
          if (cache.indexOf(value) !== -1) {
            continue;
          }
          cache.push(value);
        }
        bytes += approximateObjectSize(value, cache);
      }
      return bytes;
    default:
      //value is null, undefined, or a function
      return 0;
  }
}

/** Tries to scan the bot record for a display string */
export const getBotDisplayName = (bot: IBotConfig = newBot()): string => {
  return bot.name || getBotId(bot) || (getFirstBotEndpoint(bot) ? getFirstBotEndpoint(bot).endpoint : null) || '¯\\_(ツ)_/¯';
}

/** Creates a new bot */
export const newBot = (...bots: IBotConfig[]): IBotConfig => {
  return Object.assign(
    {},
    {
      name: '',
      description: '',
      services: []
    },
    ...bots
  );
}

/** Creates a new endpoint */
export const newEndpoint = (...endpoints: IEndpointService[]): IEndpointService => {
  return Object.assign(
    {},
    {
      type: ServiceType.Endpoint,
      name: '',
      id: uniqueId(),
      appId: '',
      appPassword: '',
      endpoint: 'http://localhost:3978/api/messages'
    },
    ...endpoints
  );
}

/** Adds -- if missing -- an id to all of a bot's endpoint services */
export const addIdToBotEndpoints = (bot: IBotConfig): IBotConfig => {
  bot.services.map(service => {
    if (service.type === ServiceType.Endpoint && !service.id) {
      service.id = uniqueId();
      return service;
    }
    return service;
  });
  return bot;
}

/** Returns the first endpoint service of a bot */
export const getFirstBotEndpoint = (bot: IBotConfig): IEndpointService => {
  if (bot.services && bot.services.length) {
    return <IEndpointService> bot.services.find(service => service.type === ServiceType.Endpoint);
  }
  return null;
}

/** Hacky for getting a bot id by defaulting to the id of its first endpoint service */
export const getBotId = (bot: IBotConfig): string => {
  if (!bot)
    return null;

  const endpoint: IEndpointService = getFirstBotEndpoint(bot);
  if (endpoint) {
    if (!endpoint.id)
      addIdToBotEndpoints(bot);
    return endpoint.id;
  }

  throw new Error(`Could not find an id for bot: ${bot}`);
}
