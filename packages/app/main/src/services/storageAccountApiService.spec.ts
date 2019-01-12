import "../fetchProxy";
import { StorageAccountApiService } from "./storageAccountApiService";

const mockArmToken =
  "bm90aGluZw.eyJ1cG4iOiJnbGFzZ293QHNjb3RsYW5kLmNvbSJ9.7gjdshgfdsk98458205jfds9843fjds";
const mockResponseTemplate = [
  {
    value: [
      {
        id: "/subscriptions/1234",
        subscriptionId: "1234",
        tenantId: "1234",
        displayName: "Pretty nice Service",
        state: "Enabled",
        subscriptionPolicies: {
          locationPlacementId: "Public_2014-09-01",
          quotaId: "MSDN_2014-09-01",
          spendingLimit: "On"
        },
        authorizationSource: "Legacy"
      },
      {
        id: "/subscriptions/1234",
        subscriptionId: "1234",
        tenantId: "43211",
        displayName: "A useful service",
        state: "Enabled",
        subscriptionPolicies: {
          locationPlacementId: "Internal_2014-09-01",
          quotaId: "Internal_2014-09-01",
          spendingLimit: "Off"
        },
        authorizationSource: "RoleBased"
      }
    ]
  },
  {
    value: [
      {
        id: "/subscriptions/1234",
        name: "QnaMaker",
        type: "Microsoft.CognitiveServices/accounts",
        etag: "'4321'",
        location: "westus",
        sku: {
          name: "F0"
        },
        kind: "Storage",
        properties: {
          provisioningState: "Succeeded"
        }
      }
    ]
  },
  {
    value: [
      {
        id: "/subscriptions/12345",
        name: "AStorage",
        type: "Microsoft.CognitiveServices/accounts",
        etag: "'432551'",
        location: "westus",
        sku: {
          name: "F1"
        },
        kind: "Storage",
        properties: {
          provisioningState: "Succeeded"
        }
      }
    ]
  },
  {
    value: [
      {
        id:
          "/subscriptions/174/resourceGroups/blob/providers/Microsoft.Storage/storageAccounts/storageAccountName/" +
          "blobServices/default/containers/containerName",
        name: "containerName",
        type: "Microsoft.Storage/storageAccounts/blobServices/containers",
        etag: "6543645",
        properties: {
          publicAccess: "None",
          leaseStatus: "Unlocked",
          leaseState: "Available",
          lastModifiedTime: "2018-12-03T19:15:43.0000000Z",
          hasImmutabilityPolicy: false,
          hasLegalHold: false
        }
      }
    ]
  },
  {
    value: []
  },
  {
    keys: [
      {
        keyName: "key1",
        permissions: "FULL",
        value: "5743298573hgjfkdsghjsd7584329fghjlkds"
      },
      {
        keyName: "key2",
        permissions: "FULL",
        value: "5743298573hgjfkdsghjsd7584329fghjlkds"
      }
    ]
  }
];

let mockArgsPassedToFetch = [];
let mockResponses;
jest.mock("node-fetch", () => {
  const fetch = (url, headers) => {
    mockArgsPassedToFetch.push({ url, headers });
    return {
      ok: true,
      json: async () => mockResponses.shift(),
      text: async () => mockResponses.shift()
    };
  };
  (fetch as any).Headers = class {};
  (fetch as any).Response = class {};
  return fetch;
});

describe("The StorageAccountApiService", () => {
  beforeEach(() => {
    mockResponses = JSON.parse(JSON.stringify(mockResponseTemplate));
    mockArgsPassedToFetch.length = 0;
  });

  it("should deliver BlobStorageServices when the happy path is followed", async () => {
    const result = await getResult();
    expect(result).toEqual({
      services: [
        {
          type: "blob",
          id:
            "/subscriptions/174/resourceGroups/blob/providers/Microsoft.Storage/storageAccounts/" +
            "storageAccountName/blobServices/default/containers/containerName",
          tenantId: "1234",
          subscriptionId: "1234",
          name: "containerName",
          connectionString:
            "DefaultEndpointsProtocol=https;AccountName=AStorage;" +
            "AccountKey=5743298573hgjfkdsghjsd7584329fghjlkds;EndpointSuffix=core.windows.net",
          resourceGroup: "resourceGroups",
          serviceName: "AStorage"
        }
      ],
      code: 0
    });
  });

  it("should return an empty payload with an error if no subscriptions are found", async () => {
    mockResponses = [{ value: [] }];
    const result = await getResult();
    expect(result).toEqual({ services: [], code: 1 });
  });

  it("should return an empty payload with an error if no accounts are found", async () => {
    mockResponses[1] = mockResponses[2] = { value: [] };
    const result = await getResult();
    expect(result).toEqual({ services: [], code: 1 });
  });
});

async function getResult() {
  const it = StorageAccountApiService.getBlobStorageServices(mockArmToken);
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
