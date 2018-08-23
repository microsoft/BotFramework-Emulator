const mockClass = class {
};
const mockArmToken = 'bm90aGluZw.eyJ1cG4iOiJnbGFzZ293QHNjb3RsYW5kLmNvbSJ9.7gjdshgfdsk98458205jfds9843fjds';
const mockReq: RequestInit = { headers: { Authorization: `Bearer ${mockArmToken}` } };
const mockResponses = [
  {
    value: [
      {
        'id': '/subscriptions/1234',
        'subscriptionId': '1234',
        'tenantId': '1234',
        'displayName': 'Pretty nice Service',
        'state': 'Enabled',
        'subscriptionPolicies': {
          'locationPlacementId': 'Public_2014-09-01',
          'quotaId': 'MSDN_2014-09-01',
          'spendingLimit': 'On'
        },
        'authorizationSource': 'Legacy'
      },
      {
        'id': '/subscriptions/1234',
        'subscriptionId': '1234',
        'tenantId': '43211',
        'displayName': 'A useful service',
        'state': 'Enabled',
        'subscriptionPolicies': {
          'locationPlacementId': 'Internal_2014-09-01',
          'quotaId': 'Internal_2014-09-01',
          'spendingLimit': 'Off'
        },
        'authorizationSource': 'RoleBased'
      }
    ]
  },
  {
    value: [
      {
        'id': '/subscriptions/1234',
        'name': 'QnaMaker',
        'type': 'Microsoft.CognitiveServices/accounts',
        'etag': '\'4321\'',
        'location': 'westus',
        'sku': {
          'name': 'F0'
        },
        'kind': 'QnAMaker',
        'properties': {
          'endpoint': 'https://westus.api.cognitive.microsoft.com/qnamaker/v4.0',
          'internalId': '0000',
          'dateCreated': '2018-08-03T17:06:20.8718086Z',
          'apiProperties': {
            'qnaRuntimeEndpoint': 'https://juwilabyqnamaker.azurewebsites.net'
          },
          'provisioningState': 'Succeeded'
        }
      }
    ]
  },
  {
    value: [
      {
        'id': '/subscriptions/12324',
        'name': 'FAQ2',
        'type': 'Microsoft.CognitiveServices/accounts',
        'etag': '\'1234\'',
        'location': 'westus',
        'sku': {
          'name': 'F0'
        },
        'kind': 'QnAMaker',
        'properties': {
          'endpoint': 'https://westus.api.cognitive.microsoft.com/qnamaker/v4.0',
          'internalId': '4321',
          'dateCreated': '2018-05-08T14:55:01.0888756Z',
          'apiProperties': {
            'qnaRuntimeEndpoint': 'https://faq2.azurewebsites.net'
          },
          'provisioningState': 'Succeeded'
        }
      }
    ]
  },
  { key1: 5555 },
  { key1: 4444 },
  {
    knowledgebases: [
      {
        'id': '1234',
        'hostName': 'https://localhost',
        'lastAccessedTimestamp': '2018-08-21T20:27:35Z',
        'lastChangedTimestamp': '2018-08-03T17:12:44Z',
        'name': 'HIThere#1',
        'userId': '1234',
        'urls': [
          'https://localhost'
        ],
        'sources': []
      }
    ]
  },
  {
    knowledgebases: [
      {
        'id': '9876543',
        'hostName': 'https://localhost',
        'lastAccessedTimestamp': '2018-08-21T20:27:35Z',
        'lastChangedTimestamp': '2018-08-03T17:12:44Z',
        'name': 'HIThere#2',
        'userId': '9876543',
        'urls': [
          'https://localhost'
        ],
        'sources': []
      }
    ]
  }
];

let mockArgsPassedToFetch;
jest.mock('node-fetch', () => ({
  default: async (url, headers) => {
    mockArgsPassedToFetch.push({ url, headers });
    return {
      ok: true,
      json: async () => mockResponses.shift(),
      text: async () => mockResponses.shift(),
    };
  },
  Headers: mockClass,
  Response: mockClass
}));
import { QnaApiService } from './qnaApiService';

describe('The QnaApiService', () => {
  beforeEach(() => {
    mockArgsPassedToFetch = [];
  });
  it('should retrieve the QnA Kbs when given an arm token', async () => {
    const kbs = await QnaApiService.getKnowledgeBases(mockArmToken);
    expect(kbs.services.length).toBe(2);
    expect(mockArgsPassedToFetch.length).toBe(7);
    expect(mockArgsPassedToFetch[0]).toEqual({
      'url': 'https://management.azure.com/subscriptions?api-version=2018-07-01',
      'headers': {
        'headers': {
          'Authorization': 'Bearer bm90aGluZw.eyJ1cG4iOiJnbGFzZ293QHNjb3RsYW5kLmNvbSJ9.7gjdshgfdsk98458205jfds9843fjds',
          'Accept': 'application/json, text/plain, */*'
        },
        'method': 'POST'
      }
    });
    
    expect(mockArgsPassedToFetch[1]).toEqual({
      'url': 'https://management.azure.com//subscriptions/1234/' +
        'providers/Microsoft.CognitiveServices/accounts?api-version=2017-04-18',
      'headers': {
        'headers': {
          'Authorization': 'Bearer bm90aGluZw.eyJ1cG4iOiJnbGFzZ293QHNjb3RsYW5kLmNvbSJ9.7gjdshgfdsk98458205jfds9843fjds',
          'Accept': 'application/json, text/plain, */*'
        },
        'method': 'POST'
      }
    });
    
    expect(mockArgsPassedToFetch[2]).toEqual({
      'url': 'https://management.azure.com//subscriptions/1234/providers/' +
        'Microsoft.CognitiveServices/accounts?api-version=2017-04-18',
      'headers': {
        'headers': {
          'Authorization': 'Bearer bm90aGluZw.eyJ1cG4iOiJnbGFzZ293QHNjb3RsYW5kLmNvbSJ9.7gjdshgfdsk98458205jfds9843fjds',
          'Accept': 'application/json, text/plain, */*'
        },
        'method': 'POST'
      }
    });
    
    expect(mockArgsPassedToFetch[3]).toEqual({
      'url': 'https://management.azure.com//subscriptions/1234/listKeys?api-version=2017-04-18',
      'headers': {
        'headers': {
          'Authorization': 'Bearer bm90aGluZw.eyJ1cG4iOiJnbGFzZ293QHNjb3RsYW5kLmNvbSJ9.7gjdshgfdsk98458205jfds9843fjds',
          'Accept': 'application/json, text/plain, */*'
        },
        'method': 'POST'
      }
    });
    
    expect(mockArgsPassedToFetch[4]).toEqual({
      'url': 'https://management.azure.com//subscriptions/12324/listKeys?api-version=2017-04-18',
      'headers': {
        'headers': {
          'Authorization': 'Bearer bm90aGluZw.eyJ1cG4iOiJnbGFzZ293QHNjb3RsYW5kLmNvbSJ9.7gjdshgfdsk98458205jfds9843fjds',
          'Accept': 'application/json, text/plain, */*'
        },
        'method': 'POST'
      }
    });
    
    expect(mockArgsPassedToFetch[5]).toEqual({
      'url': 'https://westus.api.cognitive.microsoft.com/qnamaker/v4.0/knowledgebases/',
      'headers': {
        'headers': {
          'Ocp-Apim-Subscription-Key': 5555,
          'Content-Type': 'application/json; charset=utf-8'
        }
      }
    });
    
    expect(mockArgsPassedToFetch[6]).toEqual({
      'url': 'https://westus.api.cognitive.microsoft.com/qnamaker/v4.0/knowledgebases/',
      'headers': {
        'headers': {
          'Ocp-Apim-Subscription-Key': 4444,
          'Content-Type': 'application/json; charset=utf-8'
        }
      }
    });
  });
});
