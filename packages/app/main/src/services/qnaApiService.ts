import { IQnAService } from 'msbot/bin/schema';
import { QnaMakerService } from 'msbot/bin/models';
import fetch, { Headers, Response } from 'node-fetch';

export interface Subscription {
  authorizationSource: string;
  displayName: string;
  id: string;
  state: string;
  subscriptionId: string;
  subscriptionPolicies: SusctiptionPolicy[];
}

export interface SusctiptionPolicy {
  locationPlacement: string;
  quotaId: string;
  spendingLimit: string;
}

export interface CognitiveServiceAccount {
  etag: string;
  id: string;
  name: string;
  type: string;
  kind: string;
  location: string;
  properties: CGProperties;
  sku: SKU;
}

export interface CGProperties {
  dateCreated: string;
  endpoint: string;
  internalId: string;
  provisioningState: string;
}

export interface SKU {
  name: string;
}

export interface Knowledgebase {
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
  public static async getKnowledgeBases(armToken: string): Promise<{ services: IQnAService[] }> {
    const payload = { services: [] };
    // 1. We need to get a list of all subscriptions from this user.
    const req: RequestInit = {
      headers: {
        Authorization: `Bearer ${armToken}`,
        Accept: 'application/json, text/plain, */*'
      }
    };

    let subs: Subscription[] = [];
    try {
      const url = 'https://management.azure.com/subscriptions?api-version=2018-07-01';
      const subscriptionsResponse = await fetch(url, req);
      const subscriptionResponseJson: { value: Subscription[] } = await subscriptionsResponse.json();
      subs = subscriptionResponseJson.value;
    } catch (e) {
      return payload;
    }

    // 2. Pull in all cognitive service accounts from the subscriptions
    const accounts: CognitiveServiceAccount[] = [];
    try {
      const url = 'https://management.azure.com/{id}/providers/Microsoft.CognitiveServices/' +
        'accounts?api-version=2017-04-18';
      const calls = subs.map(subscription => fetch(url.replace('{id}', subscription.id), req));

      const accountsResponses: Response[] = await Promise.all(calls);
      let i = accountsResponses.length;
      while (i--) {
        const accountResponse: Response = accountsResponses[i];
        const accountResponseJson: { value: CognitiveServiceAccount[] } = await accountResponse.json();
        accounts.push(...accountResponseJson.value.filter(account => account.kind === 'QnAMaker'));
      }
    } catch (e) {
      return payload;
    }

    // 3. Retrieve the keys for each account
    const keys: string[] = [];
    try {
      const url = 'https://management.azure.com/{id}/listKeys?api-version=2017-04-18';
      req.method = 'POST'; // Not sure why this is required by the endpoint...
      const calls = accounts.map(account => fetch(url.replace('{id}', account.id), req));
      const keyResponses: Response[] = await Promise.all(calls);
      let i = keyResponses.length;
      while (i--) {
        const keyResponse: Response = keyResponses[i];
        const keyResponseJson: { [keyName: string]: string } = await keyResponse.json();
        keys.push(keyResponseJson.key1);
      }
    } catch (e) {
      return payload;
    }

    // 4. Finally get the knowledge bases and mutate them into IQnAService[]
    try {
      const url = 'https://westus.api.cognitive.microsoft.com/qnamaker/v4.0/knowledgebases/';
      const calls = keys.map(key => {
        const qnaReq: RequestInit = {
          headers: {
            'Ocp-Apim-Subscription-Key': key,
            'Content-Type': 'application/json; charset=utf-8'
          }
        };
        return fetch(url, qnaReq);
      });
      const kbResponses = await Promise.all(calls);
      let i = kbResponses.length;
      while (i--) {
        const kbResponse: Response = kbResponses[i];
        const kbResponseJson: { knowledgebases: Knowledgebase[] } = await kbResponse.json();
        const key = keys[i];
        const qnas = kbResponseJson.knowledgebases.map(kb => knowledgebaseToQnaService(kb, key));
        payload.services.push(...qnas);
      }
    } catch (e) {
      return payload;
    }

    return payload;
  }
}

function knowledgebaseToQnaService(kb: Knowledgebase, endpointKey: string): QnaMakerService {
  const qna = new QnaMakerService({ hostname: '' } as any); // defect workaround
  qna.id = qna.kbId = kb.id;
  qna.endpointKey = endpointKey;
  qna.name = kb.name;
  qna.hostname = kb.hostName || '';
  return qna;
}
