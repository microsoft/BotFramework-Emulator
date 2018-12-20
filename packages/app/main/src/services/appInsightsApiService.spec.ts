import '../fetchProxy';
import { AppInsightsApiService } from './appInsightsApiService';

const mockArmToken = 'bm90aGluZw.eyJ1cG4iOiJnbGFzZ293QHNjb3RsYW5kLmNvbSJ9.7gjdshgfdsk98458205jfds9843fjds';
let mockArgsPassedToFetch = [];
let mockResponses;
jest.mock('node-fetch', () => {
  const fetch = (url, headers) => {
    mockArgsPassedToFetch.push({ url, headers });
    return {
      ok: true,
      json: async () => mockResponses.shift(),
      text: async () => mockResponses.shift()
    };
  };
  (fetch as any).Headers = class {
  };
  (fetch as any).Response = class {
  };
  return fetch;
});

const mockResponseTemplate = [
  {
    // Subscriptions
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
  // Components
  {
    value: [
      {
        'id': '/subscriptions/08a9411c/resourceGroups/myResourceGroup/' +
          'providers/microsoft.insights/components/TestAppInsights',
        'name': 'TestAppInsights',
        'type': 'microsoft.insights/components',
        'location': 'westus2',
        'kind': 'Node.JS',
        'etag': '0000',
        'properties': {
          'ApplicationId': 'TestAppInsights',
          'AppId': '70f773ca',
          'Application_Type': 'Node.JS',
          'Flow_Type': 'Redfield',
          'Request_Source': 'IbizaAIExtension',
          'InstrumentationKey': '2e1f4ec2',
          'Name': 'TestAppInsights',
          'CreationDate': '2018-11-20T17:29:18.0789365+00:00',
          'PackageId': null,
          'TenantId': '08a9411c',
        }
      }
    ]
  },
  {
    value: [
      {
        'id': '/subscriptions/08a9411c/resourceGroups/myResourceGroup2/' +
          'providers/microsoft.insights/components/TestAppInsights',
        'name': 'TestAppInsights',
        'type': 'microsoft.insights/components',
        'location': 'westus2',
        'kind': 'Node.JS',
        'etag': '0000',
        'properties': {
          'ApplicationId': 'TestAppInsights',
          'AppId': '70f773ca2',
          'Application_Type': 'Node.JS',
          'Flow_Type': 'Redfield',
          'Request_Source': 'IbizaAIExtension',
          'InstrumentationKey': '2e1f4ec22',
          'Name': 'TestAppInsights2',
          'CreationDate': '2018-11-20T17:29:18.0789365+00:00',
          'PackageId': null,
          'TenantId': '08a9411c2',
        }
      }
    ]
  },
  // api-keys
  {
    value: [
      { id: '/subscriptions/1234/resourcegroups/container/providers/microsoft.insights/components/com/apikeys/53434' }
    ]
  },
  {
    value: [
      { id: '/subscriptions/123456/resourcegroups/container/providers/microsoft.insights/components/com/apikeys/4532' }
    ]
  }
];

describe('The AppInsightsApiService', () => {
  beforeEach(() => {
    mockResponses = JSON.parse(JSON.stringify(mockResponseTemplate));
    mockArgsPassedToFetch.length = 0;
  });

  it('should deliver AppInsightsService objects when the happy path is followed', async () => {
    const result = await getResult();
    expect(result.services.length).toBe(2);
    expect(result.code).toBe(0);
  });

  it('should return an empty payload with an error if no subscriptions are found', async () => {
    mockResponses = [{ value: [] }];
    const result = await getResult();
    expect(result).toEqual({ services: [], code: 1 });
  });

  it('should return an empty payload with an error if no components are found', async () => {
    mockResponses[1] = mockResponses[2] = { value: [] };
    const result = await getResult();
    expect(result).toEqual({ services: [], code: 1 });
  });
});

async function getResult() {
  const it = AppInsightsApiService.getAppInsightsServices(mockArmToken);
  let result = undefined;
  while (true) {
    const next = it.next(result);
    if (next.done) {
      result = next.value;
      break;
    }
    try {
      result = await next.value;
    } catch (e) {
      break;
    }
  }
  return result;
}
