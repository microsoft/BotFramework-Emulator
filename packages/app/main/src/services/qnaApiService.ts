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
import { QnaMakerService } from 'botframework-config/lib/models';

import {
  AccountIdentifier,
  AzureManagementApiService,
  AzureResource,
  Provider,
  Subscription,
} from './azureManagementApiService';

export interface KnowledgeBase {
  hostName: string;
  id: string;
  lastAccessedTimestamp: string;
  lastChangedTimestamp: string;
  lastPublishedTimestamp: string;
  name: string;
  sources: string[];
  urls: string[];
  userId: string;
}

export class QnaApiService {
  public static *getKnowledgeBases(armToken: string): IterableIterator<any> {
    const payload = { services: [], code: ServiceCodes.OK };
    // 1. We need to get a list of all subscriptions from this user.
    yield { label: 'Retrieving subscriptions from Azure…', progress: 12.5 };
    const subs: Subscription[] = yield AzureManagementApiService.getSubscriptions(
      armToken
    );
    if (!subs) {
      payload.code = ServiceCodes.AccountNotFound;
      return payload;
    }

    // 2. Pull in all cognitive service accounts from the subscriptions
    yield { label: 'Retrieving accounts from Azure…', progress: 35 };
    const accounts: AzureResource[] = yield AzureManagementApiService.getAzureResource(
      armToken,
      subs,
      Provider.CognitiveServices,
      AccountIdentifier.CognitiveService,
      'QnAMaker'
    );

    if (!accounts) {
      payload.code = ServiceCodes.Error;
      return payload;
    }

    // 3. Retrieve the keys for each account
    yield { label: 'Retrieving keys from Azure…', progress: 65 };
    const keys: string[] = yield AzureManagementApiService.getKeysForAccounts(
      armToken,
      accounts,
      '2017-04-18',
      'key1'
    );
    if (!keys) {
      payload.code = ServiceCodes.Error;
      return payload;
    }

    // 4. Finally get the knowledge bases and mutate them into IQnAService[]
    yield { label: 'Checking for knowledge bases…', progress: 80 };
    const url =
      'https://westus.api.cognitive.microsoft.com/qnamaker/v4.0/knowledgebases/';
    const calls = keys.map(key => {
      const qnaReq: RequestInit = {
        headers: {
          'Ocp-Apim-Subscription-Key': key,
          'Content-Type': 'application/json; charset=utf-8',
        },
      };
      return fetch(url, qnaReq);
    });
    const kbResponses = yield Promise.all(calls);
    let i = kbResponses.length;
    while (i--) {
      const kbResponse: Response = kbResponses[i];
      if (!kbResponse.ok) {
        continue;
      }
      const kbResponseJson: {
        knowledgebases: KnowledgeBase[];
      } = yield kbResponse.json();
      const key = keys[i];
      const qnas = kbResponseJson.knowledgebases.map(kb =>
        knowledgeBaseToQnaService(kb, key)
      );
      payload.services.push(...qnas);
    }

    return payload;
  }
}

function knowledgeBaseToQnaService(
  kb: KnowledgeBase,
  endpointKey: string
): QnaMakerService {
  const qna = new QnaMakerService({ hostname: '' } as any); // defect workaround
  qna.id = qna.kbId = kb.id;
  qna.endpointKey = endpointKey;
  qna.name = kb.name;
  qna.hostname = kb.hostName || '';
  return qna;
}
