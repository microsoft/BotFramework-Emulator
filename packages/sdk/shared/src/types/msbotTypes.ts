/**
 * Source:
 * https://github.com/Microsoft/botbuilder-tools/blob/master/MSBot/src/schema.ts
 * https://github.com/Microsoft/botbuilder-tools/blob/master/MSBot/src/BotConfig.ts (for ServiceType enum only)
 */

export enum ServiceType {
  Endpoint = "endpoint",
  AzureBotService = "abs",
  Luis = "luis",
  QnA = "qna",
  Dispatch = 'dispatch',
  File = "file"
}

export interface IConnectedService {
  // ServiceType of the service (LUIS, QnA, etc.)
  type: string;

  // Friendly name for the service
  name: string;

  // unique Id for the service (appid, etc)
  id?: string;
}

export interface IEndpointService extends IConnectedService {
  // type = ServiceTypes.Endpoint
  // id = bot id
  // MSA Appid
  appId: string;

  // MSA app password for the bot 
  appPassword: string;

  // endpoint of localhost service
  endpoint: string;
}

export interface IAzureBotService extends IConnectedService {
  // type = ServiceTypes.AzureBotService
  // id = bot id
  // MSA Appid
  appId: string;
}

export interface ILuisService extends IConnectedService {
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

export interface IDispatchService extends IConnectedService {
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

export interface IQnAService extends IConnectedService {
  // type=Servicestypes.QnA
  // id = appid for the QnA service
  // kb id
  kbid: string;

  // subscriptionkey for calling api
  subscriptionKey: string;
}

export interface IFileService extends IConnectedService {
  // type = ServiceTypes.File
  // id = filePath
  // filePath
  filePath: string;
}

export interface IBotConfig {
  // name of the bot
  name: string;

  // description of the bot
  description: string;

  // connected services for the bot
  services: IConnectedService[];
}
