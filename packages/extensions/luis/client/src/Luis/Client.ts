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

import { ServiceBase } from 'luis-apis/lib/api/serviceBase';
import { Apps, Publish, ApplicationPublishRequest } from 'luis-apis/lib/api/apps';
import { Train, ModelTrainStatus } from 'luis-apis/lib/api/train';
import Intents from 'luis-apis/lib/api/models/intents';
import { LuisAppInfo } from '../Models/LuisAppInfo';
import { Example, ExampleLabelObject, AddLabelParams } from 'luis-apis/lib/api/examples';
import { AppInfo } from './AppInfo';
import { IntentInfo } from './IntentInfo';
import { LuisResponse } from './LuisResponse';
import * as LSCache from 'lscache';

const DefaultVersion = '0.1';
const TrainStatusRetryCount = 30;
const WaitIntervalInMs = 500;
const CacheTtlInMins = 30;
const Unauthorized = 'Unauthorized';
const CortanaAppId = 'c413b2ef-382c-45bd-8ff0-f76d60e2a821';

enum TrainStatus {
  Success = 0,
  Fail = 1,
  UpToDate = 2,
  InProgress = 3,
}

class LuisClientError extends Error {

  private static getMessage(message: string, statusCode: number | undefined): string {
    let errorMessage = message;
    if (statusCode) {
      errorMessage += ' - HTTP Status Code: ' + statusCode;
    }
    return errorMessage;
  }

  constructor(message: string, statusCode: number | undefined = undefined) {
    super(LuisClientError.getMessage(message, statusCode));
  }
}

class LuisClient {

  private appsService: Apps;
  private intentsService: Intents;
  private exampleService: Example;
  private trainService: Train;
  private publishService: Publish;
  private luisAppInfo: LuisAppInfo;

  private static getNormalizedEntityType(entityType: string = ''): string {
    const builtinPrefix = 'builtin.';
    const builtInPrefixLength = builtinPrefix.length;
    if (entityType.startsWith(builtinPrefix)) {
      let typeEndIndex = entityType.indexOf('.', builtInPrefixLength);
      if (typeEndIndex < 0) {
        typeEndIndex = entityType.length;
      }
      return entityType.substring(builtInPrefixLength, typeEndIndex);
    }
    return entityType;
  }

  private static getCacheKey(apiName: string, appId: string, versionId: string | undefined = undefined): string {
    let key: string = apiName + '_' + appId;
    if (versionId) {
      key += '_';
      key += versionId;
    }
    return key;
  }

  constructor(luisAppInfo: LuisAppInfo) {
    this.luisAppInfo = luisAppInfo;
    this.appsService = new Apps();
    this.intentsService = new Intents();
    this.exampleService = new Example();
    this.publishService = new Publish();
    this.trainService = new Train();
  }

  getLoggedInUserApps(): Promise<any> {
    this.configureClient();
    return this.appsService.getApplicationsList();
  }

  async getApplicationInfo(): Promise<AppInfo> {
    let opCacheKey: string = LuisClient.getCacheKey('GetAppInfo', this.luisAppInfo.appId);
    let cached: AppInfo;
    if ((cached = LSCache.get(opCacheKey)) != null) {
      return cached || {} as AppInfo;
    }
    this.configureClient();
    let r = await this.appsService.getApplicationInfo({ appId: this.luisAppInfo.appId });
    let appInfo: AppInfo = {} as AppInfo;
    if (r.status === 401 ||
      // Cortana Built in app (static, user cannot author it)
      (r.status === 400 && this.luisAppInfo.appId.toLowerCase() === CortanaAppId)) {
      appInfo = {
        authorized: false,
        activeVersion: Unauthorized,
        name: Unauthorized,
        appId: this.luisAppInfo.appId,
        endpoints: {},
        isDispatchApp: false
      };
    } else if (r.status !== 200) {
      throw new LuisClientError('Failed to get the Azure App Info', r.status);
    } else {
      appInfo = await r.json();
      appInfo.authorized = true;
      appInfo.appId = this.luisAppInfo.appId;
      appInfo.isDispatchApp = appInfo.activeVersion.toLocaleLowerCase().startsWith('dispatch');
      LSCache.set(opCacheKey, appInfo, CacheTtlInMins);
    }
    return appInfo;
  }

  async getApplicationIntents(appInfo: AppInfo): Promise<IntentInfo[]> {
    let opCacheKey: string = LuisClient.getCacheKey('GetAppInfo', appInfo.appId, appInfo.activeVersion);
    let cached: IntentInfo[];
    if ((cached = LSCache.get(opCacheKey)) != null) {
      return cached || [] as any;
    }
    this.configureClient();
    let r = await this.intentsService.getVersionIntentList({ appId: appInfo.appId, versionId: appInfo.activeVersion });
    let intents = await r.json();
    let intentInfo = intents.map((i: any) => i as IntentInfo);
    LSCache.set(opCacheKey, intentInfo, CacheTtlInMins);
    return intentInfo;
  }

  async reassignIntent(appInfo: AppInfo, luisResponse: LuisResponse, newIntent: string): Promise<void> {
    this.configureClient();
    let exampleLabelObject: ExampleLabelObject = {
      text: luisResponse.query,
      intentName: newIntent,
      entityLabels: luisResponse.entities.map(e => {
        return {
          entityName: LuisClient.getNormalizedEntityType((e.type || '')),
          startCharIndex: e.startIndex,
          endCharIndex: e.endIndex
        };
      })
    };

    let addLabelParapms: AddLabelParams = {
      appId: appInfo.appId,
      versionId: appInfo.activeVersion || DefaultVersion
    };

    let r = await this.exampleService.addLabel(addLabelParapms, exampleLabelObject);
    if (r.status !== 201) {
      throw new LuisClientError('Failed to add label', r.status);
    }
  }

  async publish(appInfo: AppInfo, staging: boolean): Promise<any> {
    this.configureClient();
    let endpointKey: string = staging ? 'STAGING' : 'PRODUCTION';
    let region: string = appInfo.endpoints[ endpointKey ].endpointRegion;
    if (!region) {
      throw new LuisClientError('Unknown publishing region');
    }
    let applicationPublishRequest: ApplicationPublishRequest = {
      isStaging: staging,
      region: region,
      versionId: appInfo.activeVersion
    };
    let r = await this.publishService.publishApplication({ appId: appInfo.appId }, applicationPublishRequest);
    if (r.status !== 201) {
      throw new LuisClientError('Publish Failed', r.status);
    }
  }

  async train(appInfo: AppInfo): Promise<any> {
    this.configureClient();
    let r = await this.trainService.trainApplicationVersion({ appId: appInfo.appId, versionId: appInfo.activeVersion });
    if (r.status !== 202) {
      throw new LuisClientError('Failed to queue training request', r.status);
    }

    let retryCounter = 0;
    return new Promise((resolve, reject) => {
      let intervalId = setInterval(async () => {
        r = await this.trainService.getVersionTrainingStatus({
          appId: appInfo.appId,
          versionId: appInfo.activeVersion
        });

        if (retryCounter++ >= TrainStatusRetryCount) {
          clearInterval(intervalId);
          reject('Failed to train the application');
        }

        if (r.status !== 200) {
          return;
        }

        let appTrainingStatus: ModelTrainStatus[] = await r.json();
        if (appTrainingStatus.every(s =>
          s.details.statusId === TrainStatus.UpToDate ||
          s.details.statusId === TrainStatus.Success)) {
          clearInterval(intervalId);
          resolve();
        }
      }, WaitIntervalInMs);
    });
  }

  private configureClient() {
    // TODO: It's annoying that the settings are singleton and static
    // This makes it hard to cache multiple clients for different apps
    // We should consider updating the Client SDK to make the configs per service
    ServiceBase.config = {
      endpointBasePath: this.luisAppInfo.baseUri,
      authoringKey: this.luisAppInfo.key,
    };
  }
}

export default LuisClient;
