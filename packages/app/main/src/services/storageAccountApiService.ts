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
import { BlobStorageService } from 'botframework-config/lib/models';

import { AccountIdentifier, AzureManagementApiService, AzureResource, Provider } from './azureManagementApiService';

interface KeyEntry {
  keyName: string;
  value: string;
  permission: string;
}

function buildServiceModel(key: KeyEntry, account: AzureResource, container: AzureResource): BlobStorageService {
  const { tenantId, subscriptionId, name: serviceName } = account;
  const { id, name } = container;
  // TODO - review the connectionString for accuracy
  return new BlobStorageService({
    id,
    tenantId,
    subscriptionId,
    name,
    connectionString:
      `DefaultEndpointsProtocol=https;AccountName=${serviceName};AccountKey=${key.value}` +
      ';EndpointSuffix=core.windows.net',
    resourceGroup: id.split('/')[4],
    serviceName,
    container: name,
  });
}

export class StorageAccountApiService {
  public static *getBlobStorageServices(armToken: string): IterableIterator<any> {
    const payload = { services: [], code: ServiceCodes.OK };
    // 1. get a list of subscriptions for the user
    yield { label: 'Retrieving subscriptions from Azure…', progress: 25 };
    const subs = yield AzureManagementApiService.getSubscriptions(armToken);
    if (!subs) {
      payload.code = ServiceCodes.AccountNotFound;
      return payload;
    }
    // 2. Retrieve a list of Azure storage accounts
    // These will allow us to retrieve the associated blob containers.
    yield { label: 'Retrieving accounts from Azure…', progress: 50 };
    const accounts: AzureResource[] = yield AzureManagementApiService.getAzureResource(
      armToken,
      subs,
      Provider.Storage,
      AccountIdentifier.StorageAccounts
    );
    if (!accounts) {
      payload.code = ServiceCodes.AccountNotFound;
      return payload;
    }

    // 3. Get all blob containers and map them to
    // their respective accounts.
    yield { label: 'Retrieving Blob Containers from Azure…', progress: 75 };
    const req = AzureManagementApiService.getRequestInit(armToken);
    const url = 'https://management.azure.com{id}/blobServices/default/containers?api-version=2018-07-01';
    const requests = accounts.map(account => fetch(url.replace('{id}', account.id), req));
    const blobContainerResponses: Response[] = yield Promise.all(requests);
    const blobContainerInfos: {
      account: AzureResource;
      containers: AzureResource[];
    }[] = [];
    let i = blobContainerResponses.length;
    while (i--) {
      const blobContainerResponse = blobContainerResponses[i];
      if (!blobContainerResponse.ok) {
        continue;
      }
      const blobContainerJson: {
        value: any[];
      } = yield blobContainerResponse.json();
      if (blobContainerJson.value.length) {
        blobContainerInfos.push({
          account: accounts[i],
          containers: blobContainerJson.value,
        });
      }
    }
    // 4. Retrieve the Access Keys and use it combined
    // with properties from the respective AzureServiceAccount
    // and the BlobContainer json to compose the connectionString
    yield { label: 'Retrieving Access Keys from Azure…', progress: 95 };
    // Do not retrieve keys for accounts without blob containers
    const keys: KeyEntry[][] = yield AzureManagementApiService.getKeysForAccounts(
      armToken,
      blobContainerInfos.map(info => info.account),
      '2018-07-01',
      'keys'
    );
    // Build the BlobStorageService objects
    i = keys.length;
    while (i--) {
      const keysEntry = keys[i];
      if (!keysEntry) {
        continue;
      }
      const firstKey = keysEntry[0];
      const { account, containers } = blobContainerInfos[i];
      const blobStorageServices = containers.map(container => buildServiceModel(firstKey, account, container));
      payload.services.push(...blobStorageServices);
    }
    return payload;
  }
}
