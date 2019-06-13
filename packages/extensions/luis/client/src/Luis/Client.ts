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

import { ApiKeyCredentials } from '@azure/ms-rest-js';
import { LuisAuthoring, LuisAuthoringModels } from 'luis-apis';
import * as LSCache from 'lscache';

import { LuisAppInfo } from '../Models/LuisAppInfo';

import { AppInfo } from './AppInfo';
import { IntentInfo } from './IntentInfo';
import { LuisResponse } from './LuisResponse';

const DefaultVersion = '0.1';
const TrainStatusRetryCount = 30;
const WaitIntervalInMs = 500;
const CacheTtlInMins = 30;
const CortanaAppId = 'c413b2ef-382c-45bd-8ff0-f76d60e2a821';
const clientOptions = { customHeaders: { 'accept-language': 'en-US' } };
// TODO: Handle multiple regions / clouds
const luisRegion: LuisAuthoringModels.AzureRegions = 'westus';
const luisCloud: LuisAuthoringModels.AzureClouds = 'com';

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

  constructor(message: string, statusCode?: number) {
    super(LuisClientError.getMessage(message, statusCode));
  }
}

export class LuisClient {
  private _client: LuisAuthoring;
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

  private static getCacheKey(apiName: string, appId: string, versionId?: string): string {
    let key: string = apiName + '_' + appId;
    if (versionId) {
      key += '_';
      key += versionId;
    }
    return key;
  }

  constructor(luisAppInfo: LuisAppInfo) {
    this.luisAppInfo = luisAppInfo;
    this.configureClient();
  }

  public getLoggedInUserApps(): Promise<LuisAuthoringModels.AppsListResponse> {
    this.configureClient();
    return this._client.apps.list(luisRegion, luisCloud, clientOptions);
  }

  public async getApplicationInfo(): Promise<AppInfo> {
    const opCacheKey: string = LuisClient.getCacheKey('GetAppInfo', this.luisAppInfo.appId);
    let cached: AppInfo;
    if ((cached = LSCache.get(opCacheKey)) != null) {
      return cached || ({} as AppInfo);
    }
    this.configureClient();
    const r = await this._client.apps.get(luisRegion, luisCloud, this.luisAppInfo.appId, clientOptions);
    const { _response: response } = r;
    let appInfo: AppInfo = {} as AppInfo;
    if (
      response.status === 401 ||
      // Cortana Built in app (static, user cannot author it)
      (response.status === 400 && this.luisAppInfo.appId.toLowerCase() === CortanaAppId)
    ) {
      appInfo = {
        authorized: false,
        activeVersion: 'Unknown',
        name: null,
        appId: this.luisAppInfo.appId,
        endpoints: {},
        isDispatchApp: false,
      };
    } else if (response.status !== 200) {
      throw new LuisClientError('Failed to get the Azure App Info', response.status);
    } else {
      appInfo = {
        ...response.parsedBody,
        authorized: true,
        appId: this.luisAppInfo.appId,
        isDispatchApp: response.parsedBody.activeVersion.toLocaleLowerCase().startsWith('dispatch'),
      };
      LSCache.set(opCacheKey, appInfo, CacheTtlInMins);
    }
    return appInfo;
  }

  public async getApplicationIntents(appInfo: AppInfo): Promise<LuisAuthoringModels.IntentClassifier[]> {
    const opCacheKey: string = LuisClient.getCacheKey('GetAppInfo', appInfo.appId, appInfo.activeVersion);
    let cached: IntentInfo[];
    if ((cached = LSCache.get(opCacheKey)) != null) {
      return cached || ([] as any);
    }
    this.configureClient();
    const r = await this._client.model.listIntents(
      luisRegion,
      luisCloud,
      appInfo.appId,
      appInfo.activeVersion,
      clientOptions
    );
    const intents = r._response.parsedBody;
    LSCache.set(opCacheKey, intents, CacheTtlInMins);
    return intents;
  }

  public async reassignIntent(appInfo: AppInfo, luisResponse: LuisResponse, newIntent: string): Promise<void> {
    this.configureClient();
    const exampleLabelObject: LuisAuthoringModels.ExampleLabelObject = {
      text: luisResponse.query,
      intentName: newIntent,
      entityLabels: luisResponse.entities.map(e => {
        return {
          entityName: LuisClient.getNormalizedEntityType(e.type || ''),
          startCharIndex: e.startIndex,
          endCharIndex: e.endIndex,
        };
      }),
    };

    const appId = appInfo.appId;
    const versionId = appInfo.activeVersion || DefaultVersion;

    const r = await this._client.examples.add(
      luisRegion,
      luisCloud,
      appId,
      versionId,
      exampleLabelObject,
      clientOptions
    );
    if (r._response.status !== 201) {
      throw new LuisClientError('Failed to add label', r._response.status);
    }
  }

  public async publish(appInfo: AppInfo, staging: boolean): Promise<any> {
    this.configureClient();
    const endpointKey: string = staging ? 'STAGING' : 'PRODUCTION';
    const region: LuisAuthoringModels.AzureRegions = appInfo.endpoints[endpointKey].endpointRegion;
    if (!region) {
      throw new LuisClientError('Unknown publishing region');
    }
    const applicationPublishRequest: LuisAuthoringModels.ApplicationPublishObject = {
      isStaging: staging,
      versionId: appInfo.activeVersion,
    };

    const r = await this._client.apps.publish(
      region,
      luisCloud,
      appInfo.appId,
      applicationPublishRequest,
      clientOptions
    );
    if (r._response.status !== 201) {
      throw new LuisClientError('Publish Failed', r._response.status);
    }
  }

  public async train(appInfo: AppInfo): Promise<any> {
    this.configureClient();
    const trainResponse = await this._client.train.trainVersion(
      luisRegion,
      luisCloud,
      appInfo.appId,
      appInfo.activeVersion,
      clientOptions
    );
    if (trainResponse._response.status !== 202) {
      throw new LuisClientError('Failed to queue training request', trainResponse._response.status);
    }

    let retryCounter = 0;
    return new Promise((resolve, reject) => {
      const intervalId = setInterval(async () => {
        const trainStatusResponse = await this._client.train.getStatus(
          luisRegion,
          luisCloud,
          appInfo.appId,
          appInfo.activeVersion,
          clientOptions
        );

        if (retryCounter++ >= TrainStatusRetryCount) {
          clearInterval(intervalId);
          reject('Failed to train the application');
        }

        if (trainStatusResponse._response.status !== 200) {
          return;
        }

        if (
          trainStatusResponse.every(
            s => s.details.statusId === TrainStatus.UpToDate || s.details.statusId === TrainStatus.Success
          )
        ) {
          clearInterval(intervalId);
          resolve();
        }
      }, WaitIntervalInMs);
    });
  }

  private configureClient() {
    const creds = new ApiKeyCredentials({ inHeader: { 'Ocp-Apim-Subscription-Key': this.luisAppInfo.key } });
    this._client = new LuisAuthoring(creds);
  }
}
