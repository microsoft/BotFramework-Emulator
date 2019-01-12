import "../fetchProxy";
import { CosmosDbApiService } from "./cosmosDbApiService";

const mockArmToken =
  "bm90aGluZw.eyJ1cG4iOiJnbGFzZ293QHNjb3RsYW5kLmNvbSJ9.7gjdshgfdsk98458205jfds9843fjds";
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

const mockResponseTemplate = [
  {
    // Subscriptions
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
  // Accounts
  {
    value: [
      {
        id:
          "/subscriptions/0fb11cbc/resourceGroups/gfds/providers/Microsoft.DocumentDB/databaseAccounts/gfds",
        name: "gfds",
        location: "South Central Los Angeles",
        type: "Microsoft.DocumentDB/databaseAccounts",
        kind: "GlobalDocumentDB",
        tags: { defaultExperience: "Table" },
        properties: {
          provisioningState: "Succeeded",
          documentEndpoint: "https://gdfs.documents.azure.com:443/",
          tableEndpoint: "https://gdfs.table.cosmosdb.azure.com:443/"
        }
      }
    ]
  },
  {
    value: [
      {
        id:
          "/subscriptions/0fb11cbc/resourceGroups/gfds1/providers/Microsoft.DocumentDB/databaseAccounts/gfds1",
        name: "gfds1",
        location: "South Central Los Angeles",
        type: "Microsoft.DocumentDB/databaseAccounts",
        kind: "GlobalDocumentDB",
        tags: { defaultExperience: "Table" },
        properties: {
          provisioningState: "Succeeded",
          documentEndpoint: "https://gdfs1.documents.azure.com:443/",
          tableEndpoint: "https://gdfs1.table.cosmosdb.azure.com:443/"
        }
      }
    ]
  },
  // Access keys
  {
    primaryMasterKey: "13456"
  },
  {
    primaryMasterKey: "134566543"
  },
  // CosmosDb names
  {
    Databases: [
      {
        id: "botstate-data",
        _colls: "colls/",
        _etag: "0000",
        _rid: "DD==",
        _self: "dbs/DD==/",
        _ts: 54325432,
        _users: "users/"
      }
    ]
  },
  {
    Databases: [
      {
        id: "botstate-data-1",
        _colls: "colls/",
        _etag: "0000",
        _rid: "AA==",
        _self: "dbs/AA==/",
        _ts: 53425432,
        _users: "users/"
      }
    ]
  },
  // Collections
  {
    DocumentCollections: [
      {
        id: "storeCollection"
      }
    ]
  },
  {
    DocumentCollections: [
      {
        id: "storeCollection1"
      }
    ]
  }
];

describe("The CosmosDbApiService", () => {
  beforeEach(() => {
    mockResponses = JSON.parse(JSON.stringify(mockResponseTemplate));
    mockArgsPassedToFetch.length = 0;
  });

  it("should deliver CosmosDbService objects when the happy path is followed.", async () => {
    const result = await getResult();
    expect(result.services.length).toBe(2);
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

  it("should return an empty payload with an error if keys are found", async () => {
    mockResponses[3] = mockResponses[4] = { primaryMasterKey: "" };
    const result = await getResult();
    expect(result).toEqual({ services: [], code: 2 });
  });
});

async function getResult() {
  const it = CosmosDbApiService.getCosmosDbServices(mockArmToken);
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
