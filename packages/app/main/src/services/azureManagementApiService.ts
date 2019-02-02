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
export interface Subscription {
  authorizationSource: string;
  displayName: string;
  id: string;
  state: string;
  subscriptionId: string;
  subscriptionPolicies: SubscriptionPolicy[];
  tenantId: string;
}

export interface SubscriptionPolicy {
  locationPlacement: string;
  quotaId: string;
  spendingLimit: string;
}

/**
 * Represents a generic Azure Resource. Most Azure apis return
 * a similar structure to this interface.
 */
export interface AzureResource {
  etag?: string;
  id: string;
  name: string;
  tags?: string;
  type: string;
  kind: string;
  location?: string;
  properties: { [prop: string]: any };
  sku?: SKU;
  subscriptionId?: string;
  tenantId?: string;
}

export interface SKU {
  name: string;
  tier?: string;
}

export enum Provider {
  ApplicationInsights = 'microsoft.insights',
  BotService = 'microsoft.botservice',
  CognitiveServices = 'Microsoft.CognitiveServices',
  CosmosDB = 'Microsoft.DocumentDB',
  Storage = 'Microsoft.Storage',
}

export enum AccountIdentifier {
  ApplicationInsights = 'components?api-version=2015-05-01',
  CognitiveService = 'accounts?api-version=2017-04-18',
  CosmosDb = 'databaseaccounts?api-version=2015-04-08',
  BotServices = 'botservices?api-version=2018-07-12',
  StorageAccounts = 'storageaccounts?api-version=2018-07-01',
}

const baseUrl = 'https://management.azure.com/';

export class AzureManagementApiService {
  /**
   * Builds the RequestInit with the required
   * Authorization header containing the ARM token.
   *
   * @param armToken The arm token to include in the auth header
   */
  public static getRequestInit(armToken: string): RequestInit {
    return {
      headers: {
        Authorization: `Bearer ${armToken}`,
        Accept: 'application/json, text/plain, */*',
        'x-ms-date': new Date().toUTCString(),
      },
    };
  }

  /**
   * Retrieves all subscriptions for the azure user. If no subscriptions
   * are found, the promise will resolve to null and complete successfully.
   *
   * @param armToken The user's arm token retrieved from a successful sign in.
   */
  public static async getSubscriptions(armToken: string): Promise<Subscription[]> {
    const url = `${baseUrl}subscriptions?api-version=2018-07-01`;
    const subscriptionsResponse = await fetch(url, AzureManagementApiService.getRequestInit(armToken));
    if (!subscriptionsResponse.ok) {
      return null;
    }
    const { value = [] }: { value: Subscription[] } = await subscriptionsResponse.json();
    return value.length ? value : null;
  }

  /**
   * Retrieves all accounts associated with the azure user
   * filtered by kind for the supplied provider and identifier.
   * If no accounts are found of the specified kind, the promise
   * will resolve to null and complete successfully.
   *
   * @param armToken The user's arm token retrieved from a successful sign in.
   * @param provider The Azure Provider to retrieve accounts from.
   * @param identifier The identifier used as the query param
   * @param kind The string used to filter the account kind. If omitted, no filtering will occur.
   * @param subs The array of subscriptions used to retrieve accounts.
   */
  public static async getAzureResource(
    armToken: string,
    subs: Subscription[],
    provider: Provider,
    identifier: AccountIdentifier,
    kind: string = ''
  ): Promise<AzureResource[]> {
    const url = `${baseUrl}{id}/providers/${provider}/${identifier}`;
    const req = AzureManagementApiService.getRequestInit(armToken);
    const calls = subs.map(subscription => fetch(url.replace('{id}', subscription.id), req));

    const accountsResponses: Response[] = await Promise.all(calls);
    const accounts: AzureResource[] = [];
    let i = accountsResponses.length;
    while (i--) {
      const { [i]: accountResponse } = accountsResponses;
      const { [i]: subscription } = subs;
      if (accountResponse.ok) {
        const accountResponseJson: {
          value: AzureResource[];
        } = await accountResponse.json();
        const filteredValues = kind
          ? accountResponseJson.value.filter(account => (account.kind || '').includes(kind))
          : accountResponseJson.value;
        // Amend the data with the tenant and subscription Ids since we lose
        // this fidelity when the response comes back with multiple resources
        // per subscriptionId.
        filteredValues.forEach(resource => {
          resource.tenantId = subscription.tenantId;
          resource.subscriptionId = subscription.subscriptionId;
        });
        accounts.push(...filteredValues);
      }
    }

    return accounts.length ? accounts : null;
  }

  /**
   * Retrieves the subscription keys for the specified account.
   * The key is typically used in the Ocp-Apim-Subscription-Key header
   * for api calls.
   *
   * @param armToken
   * @param accounts
   * @param apiVersion
   * @param responseProperty
   */
  public static async getKeysForAccounts(
    armToken: string,
    accounts: AzureResource[],
    apiVersion: string,
    responseProperty: string
  ): Promise<string[]> {
    const keys: any[] = [];
    const req = AzureManagementApiService.getRequestInit(armToken);
    const url = `${baseUrl}{id}/listKeys?api-version=${apiVersion}`;
    req.method = 'POST'; // Not sure why this is required by the endpoint...
    const calls = accounts.map(account => fetch(url.replace('{id}', account.id), req));
    const keyResponses: Response[] = await Promise.all(calls);
    let i = keyResponses.length;
    while (i--) {
      const keyResponse: Response = keyResponses[i];
      if (keyResponse.ok) {
        const keyResponseJson = await keyResponse.json();
        const key = keyResponseJson[responseProperty];
        if (key && '' + key) {
          // Excludes empty strings and empty arrays
          keys[i] = key; // maintain index position - do not "push"
        }
      }
    }
    return keys.length ? keys : null;
  }
}
