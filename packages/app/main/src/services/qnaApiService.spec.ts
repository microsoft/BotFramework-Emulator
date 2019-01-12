import "../fetchProxy";
import { QnaApiService } from "./qnaApiService";

const mockArmToken =
  "bm90aGluZw.eyJ1cG4iOiJnbGFzZ293QHNjb3RsYW5kLmNvbSJ9.7gjdshgfdsk98458205jfds9843fjds";
const mockResponsesTemplate = [
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
        kind: "QnAMaker",
        properties: {
          endpoint: "https://westus.api.cognitive.microsoft.com/qnamaker/v4.0",
          internalId: "0000",
          dateCreated: "2018-08-03T17:06:20.8718086Z",
          apiProperties: {
            qnaRuntimeEndpoint: "https://juwilabyqnamaker.azurewebsites.net"
          },
          provisioningState: "Succeeded"
        }
      }
    ]
  },
  {
    value: [
      {
        id: "/subscriptions/12324",
        name: "FAQ2",
        type: "Microsoft.CognitiveServices/accounts",
        etag: "'1234'",
        location: "westus",
        sku: {
          name: "F0"
        },
        kind: "QnAMaker",
        properties: {
          endpoint: "https://westus.api.cognitive.microsoft.com/qnamaker/v4.0",
          internalId: "4321",
          dateCreated: "2018-05-08T14:55:01.0888756Z",
          apiProperties: {
            qnaRuntimeEndpoint: "https://faq2.azurewebsites.net"
          },
          provisioningState: "Succeeded"
        }
      }
    ]
  },
  { key1: 4444 },
  { key1: 5555 },
  {
    knowledgebases: [
      {
        id: "1234",
        hostName: "https://localhost",
        lastAccessedTimestamp: "2018-08-21T20:27:35Z",
        lastChangedTimestamp: "2018-08-03T17:12:44Z",
        name: "HIThere#1",
        userId: "1234",
        urls: ["https://localhost"],
        sources: []
      }
    ]
  },
  {
    knowledgebases: [
      {
        id: "9876543",
        hostName: "https://localhost",
        lastAccessedTimestamp: "2018-08-21T20:27:35Z",
        lastChangedTimestamp: "2018-08-03T17:12:44Z",
        name: "HIThere#2",
        userId: "9876543",
        urls: ["https://localhost"],
        sources: []
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

describe("The QnaApiService happy path", () => {
  let result;
  beforeAll(
    () => (mockResponses = JSON.parse(JSON.stringify(mockResponsesTemplate)))
  );
  beforeEach(async () => {
    mockArgsPassedToFetch.length = 0;
    result = await getResult();
  });

  it("should retrieve the QnA Kbs when given an arm token", async () => {
    expect(result.services.length).toBe(2);
    expect(mockArgsPassedToFetch.length).toBe(7);
    expect(mockArgsPassedToFetch[0]).toEqual({
      headers: {
        headers: {
          "x-ms-date": jasmine.any(String),
          Accept: "application/json, text/plain, */*",
          Authorization:
            "Bearer bm90aGluZw.eyJ1cG4iOiJnbGFzZ293QHNjb3RsYW5kLmNvbSJ9.7gjdshgfdsk98458205jfds9843fjds"
        }
      },
      url: "https://management.azure.com/subscriptions?api-version=2018-07-01"
    });

    expect(mockArgsPassedToFetch[1]).toEqual({
      headers: {
        headers: {
          "x-ms-date": jasmine.any(String),
          Accept: "application/json, text/plain, */*",
          Authorization:
            "Bearer bm90aGluZw.eyJ1cG4iOiJnbGFzZ293QHNjb3RsYW5kLmNvbSJ9.7gjdshgfdsk98458205jfds9843fjds"
        }
      },
      url:
        "https://management.azure.com//subscriptions/1234/providers" +
        "/Microsoft.CognitiveServices/accounts?api-version=2017-04-18"
    });

    expect(mockArgsPassedToFetch[2]).toEqual({
      headers: {
        headers: {
          "x-ms-date": jasmine.any(String),
          Accept: "application/json, text/plain, */*",
          Authorization:
            "Bearer bm90aGluZw.eyJ1cG4iOiJnbGFzZ293QHNjb3RsYW5kLmNvbSJ9.7gjdshgfdsk98458205jfds9843fjds"
        }
      },
      url:
        "https://management.azure.com//subscriptions/1234/providers/Microsoft.CognitiveServices/accounts" +
        "?api-version=2017-04-18"
    });

    expect(mockArgsPassedToFetch[3]).toEqual({
      url:
        "https://management.azure.com//subscriptions/1234/listKeys?api-version=2017-04-18",
      headers: {
        headers: {
          "x-ms-date": jasmine.any(String),
          Authorization:
            "Bearer bm90aGluZw.eyJ1cG4iOiJnbGFzZ293QHNjb3RsYW5kLmNvbSJ9.7gjdshgfdsk98458205jfds9843fjds",
          Accept: "application/json, text/plain, */*"
        },
        method: "POST"
      }
    });

    expect(mockArgsPassedToFetch[4]).toEqual({
      url:
        "https://management.azure.com//subscriptions/12324/listKeys?api-version=2017-04-18",
      headers: {
        headers: {
          "x-ms-date": jasmine.any(String),
          Authorization:
            "Bearer bm90aGluZw.eyJ1cG4iOiJnbGFzZ293QHNjb3RsYW5kLmNvbSJ9.7gjdshgfdsk98458205jfds9843fjds",
          Accept: "application/json, text/plain, */*"
        },
        method: "POST"
      }
    });

    expect(mockArgsPassedToFetch[5]).toEqual({
      url:
        "https://westus.api.cognitive.microsoft.com/qnamaker/v4.0/knowledgebases/",
      headers: {
        headers: {
          "Ocp-Apim-Subscription-Key": 5555,
          "Content-Type": "application/json; charset=utf-8"
        }
      }
    });

    expect(mockArgsPassedToFetch[6]).toEqual({
      url:
        "https://westus.api.cognitive.microsoft.com/qnamaker/v4.0/knowledgebases/",
      headers: {
        headers: {
          "Ocp-Apim-Subscription-Key": 4444,
          "Content-Type": "application/json; charset=utf-8"
        }
      }
    });
  });
});

describe("The QnAMakerApi sad path", () => {
  beforeEach(
    () => (mockResponses = JSON.parse(JSON.stringify(mockResponsesTemplate)))
  );

  it("should return an empty payload with an error if no subscriptions are found", async () => {
    mockResponses = [{ value: [] }, { value: [] }];
    const result = await getResult();
    expect(result).toEqual({ services: [], code: 1 });
  });

  it("should return an empty payload with an error if no accounts are found", async () => {
    mockResponses[1] = mockResponses[2] = { value: [] };
    const result = await getResult();
    expect(result).toEqual({ services: [], code: 2 });
  });

  it("should return an empty payload with an error if no keys are found", async () => {
    mockResponses[3] = mockResponses[4] = { value: [] };
    const result = await getResult();
    expect(result).toEqual({ services: [], code: 2 });
  });
});

async function getResult() {
  const it = QnaApiService.getKnowledgeBases(mockArmToken);
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
