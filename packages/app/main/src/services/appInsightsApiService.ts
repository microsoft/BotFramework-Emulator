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
import { ServiceCodes } from '@bfemulator/app-shared';
import { AppInsightsService } from 'botframework-config/lib/models';
import { AzureManagementApiService, AzureResource, baseUrl, Provider, Subscription } from './azureManagementApiService';

export class AppInsightsApiService {

  public static* getAppInsightsServices(armToken: string): IterableIterator<any> {
    const payload = { services: [], code: ServiceCodes.OK };

    // 1. get a list of subscriptions for the user
    yield { label: 'Retrieving subscriptions from Azure…', progress: 25 };
    const subs: Subscription[] = yield AzureManagementApiService.getSubscriptions(armToken);
    if (!subs) {
      payload.code = ServiceCodes.AccountNotFound;
      return payload;
    }

    // 2. Retrieve the app insights components
    yield { label: 'Retrieving Application Insights Components from Azure…', progress: 50 };
    const req = AzureManagementApiService.getRequestInit(armToken);
    const requests = subs.map(sub => {
      const url = `${ baseUrl + sub.id }/providers/${ Provider.ApplicationInsights }/components?api-version=2015-05-01`;
      return fetch(url, req);
    });
    const appInsightsResponses: Response[] = yield Promise.all(requests);
    const appInsightsComponents: { component: AzureResource, subscription: Subscription }[] = [];
    let i = appInsightsResponses.length;
    while (i--) {
      const response = appInsightsResponses[i];
      if (!response.ok) {
        continue;
      }
      const { value: components = [] }: { value: AzureResource[] } = yield response.json();
      const subscription = subs[i];
      components.forEach(component => appInsightsComponents.push({ component, subscription }));
    }

    if (!appInsightsComponents.length) {
      payload.code = ServiceCodes.AccountNotFound;
      return payload;
    }

    // 3. Retrieve the api-keys for each component
    yield { label: 'Retrieving Api Keys from Azure…', progress: 75 };
    const apiKeysRequests = appInsightsComponents.map(info => {
      const { component } = info;
      return fetch(`${ baseUrl + component.id }/apiKeys?api-version=2015-05-01`, req);
    });
    const apiKeysResponses: Response[] = yield Promise.all(apiKeysRequests);
    i = apiKeysResponses.length;
    while (i--) {
      const apiKeyResponse = apiKeysResponses[i];
      const { value: apiKeyInfos = [] } = yield apiKeyResponse.json();
      const { component, subscription } = appInsightsComponents[i];
      if (!apiKeyInfos.length) {
        continue;
      }
      // The id field contains the apiKey in a url
      // that needs to be extracted
      const apiKeys = apiKeyInfos.map((keyInfo: { id: string }) => {
        const parts = keyInfo.id.split('/');
        return parts[parts.length - 1];
      });
      payload.services.push(createAppInsightsService(component, subscription, apiKeys));
    }
    return payload;
  }
}

function createAppInsightsService(component: AzureResource, sub: Subscription, keys: string[]): AppInsightsService {
  const { id, name, properties, subscriptionId } = component;
  const {
    InstrumentationKey: instrumentationKey,
    ApplicationId: applicationId,
    TenantId: tenantId
  } = properties;
  return new AppInsightsService({
    applicationId,
    id,
    name,
    instrumentationKey,
    tenantId,
    resourceGroup: id.split('/')[4],
    subscriptionId,
    serviceName: name
  });
}
