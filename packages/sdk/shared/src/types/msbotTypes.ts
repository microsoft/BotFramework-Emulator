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

/**
 * Source:
 * https://github.com/Microsoft/botbuilder-tools/blob/master/MSBot/src/schema.ts
 * https://github.com/Microsoft/botbuilder-tools/blob/master/MSBot/src/BotConfig.ts (for ServiceType enum only)
 */

export enum ServiceType {
  Endpoint = 'endpoint',
  AzureBotService = 'abs',
  Luis = 'luis',
  QnA = 'qna',
  Dispatch = 'dispatch',
  File = 'file'
}

export interface ConnectedService {
  // ServiceType of the service (LUIS, QnA, etc.)
  readonly type: ServiceType;

  // Friendly name for the service
  name: string;

  // unique Id for the service (appid, etc)
  id?: string;
}

export interface EndpointService extends ConnectedService {
  // type = ServiceTypes.Endpoint
  // id = bot id

  // MSA Appid
  appId: string;

  // MSA app password for the bot
  appPassword: string;

  // endpoint of localhost service
  endpoint: string;
}

export interface AzureBotService extends ConnectedService {
  // type = ServiceTypes.AzureBotService
  // id = bot id

  // tenantId for ABS registration
  tenantId: string;

  // subscriptionId for ABS registration
  subscriptionId: string;

  // resourceGroup for ABS registration
  resourceGroup: string;
}

export interface LuisService extends ConnectedService {
  // type = ServiceTypes.Luis
  // id = appid

  // luis appid
  appId: string;

  // authoring key for using authoring api
  authoringKey: string;

  // subscription key for using calling model api for predictions
  subscriptionKey: string;

  // version of the application
  version: string;
}

export interface DispatchService extends ConnectedService {
  // type = ServiceTypes.Dispatch
  // id = appid

  // luis appid
  appId: string;

  // authoring key for using authoring api
  authoringKey: string;

  // subscription key for using calling model api for predictions
  subscriptionKey: string;

  // version of the application
  version: string;

  // service Ids that the dispatch model will dispatch across
  serviceIds: string[];
}

export interface QnAService extends ConnectedService {
  // type=Servicestypes.QnA
  // id = appid for the QnA service

  // subscriptionkey for calling admin api
  subscriptionKey: string;

  // kb id
  kbId: string;

  // hostname for private service endpoint Example: https://myqna.azurewebsites.net
  hostname: string;

  // endpointKey for querying the kb
  endpointKey: string;
}

export interface FileService extends ConnectedService {
  // type = ServiceTypes.File
  // id = filePath

  // filePath
  filePath: string;
}

export interface BotConfig {
  // name of the bot
  name: string;

  // description of the bot
  description: string;

  // encrypted guid used to validate password is the same,
  // you need to be able to decrypt this key with passed in secret before we will use the secret to encrypt new values
  secretKey: string;

  // connected services for the bot
  services: ConnectedService[];

  // ** CUSTOM PROPERTY NOT IN REAL SCHEMA ** internal identifier that allows us to map to bots.json entries
  path?: string;
}
