import "../fetchProxy";
let mockFetchArgs: MockFetch;

jest.mock("node-fetch", () => {
  const fetch = (url, opts) => {
    mockFetchArgs = { url, opts };
    return {
      ok: true,
      json: async () => ({}),
      text: async () => "{}"
    };
  };
  (fetch as any).Headers = class {};
  (fetch as any).Response = class {};
  return fetch;
});

interface mockOpts {
  headers: Headers;
  method: "GET" | "DELETE" | "POST";
  body?: any;
}

interface MockFetch {
  url?: string;
  opts?: mockOpts;
}

import {
  ConversationService,
  headers as headersInstance
} from "./conversationService";

describe('The ConversationService should call "fetch" with the expected parameters when executing', () => {
  test('the "addUser" function', () => {
    ConversationService.addUser("http://localhost", "abcdef");
    const { url, opts } = mockFetchArgs;
    expect(url).toBe("http://localhost/emulator/abcdef/users");

    const { body, headers, method } = opts;
    expect(headers === headers).toBeTruthy();
    expect(method).toBe("POST");
    const members = JSON.parse(body);
    expect(members[0].name).toBeFalsy();
    expect(members[0].id).toBeFalsy();
    expect(headersInstance).toEqual(headers);
  });

  test('the "removeUser" function', () => {
    ConversationService.removeUser("http://localhost", "abcdef", "1234");
    const { url, opts } = mockFetchArgs;
    expect(url).toBe("http://localhost/emulator/abcdef/users");

    const { body, headers, method } = opts;
    expect(headers === headers).toBeTruthy();
    expect(method).toBe("DELETE");
    const users = JSON.parse(body);
    expect(users[0].id).toBe("1234");
    expect(headersInstance).toEqual(headers);
  });

  test('the "removeRandomUser" function', () => {
    ConversationService.removeRandomUser("http://localhost", "abcdef");
    const { url, opts } = mockFetchArgs;
    expect(url).toBe("http://localhost/emulator/abcdef/users");

    const { body, headers, method } = opts;
    expect(headers === headers).toBeTruthy();
    expect(method).toBe("DELETE");
    expect(body).toBeFalsy();
    expect(headersInstance).toEqual(headers);
  });

  test('the "botContactAdded" function', () => {
    ConversationService.botContactAdded("http://localhost", "abcdef");
    const { url, opts } = mockFetchArgs;
    expect(url).toBe("http://localhost/emulator/abcdef/contacts");

    const { body, headers, method } = opts;
    expect(headers === headers).toBeTruthy();
    expect(method).toBe("POST");
    expect(body).toBeFalsy();
    expect(headersInstance).toEqual(headers);
  });

  test('the "botContactRemoved" function', () => {
    ConversationService.botContactRemoved("http://localhost", "abcdef");
    const { url, opts } = mockFetchArgs;
    expect(url).toBe("http://localhost/emulator/abcdef/contacts");

    const { body, headers, method } = opts;
    expect(headers === headers).toBeTruthy();
    expect(method).toBe("DELETE");
    expect(body).toBeFalsy();
    expect(headersInstance).toEqual(headers);
  });

  test('the "typing" function', () => {
    ConversationService.typing("http://localhost", "abcdef");
    const { url, opts } = mockFetchArgs;
    expect(url).toBe("http://localhost/emulator/abcdef/typing");

    const { body, headers, method } = opts;
    expect(headers === headers).toBeTruthy();
    expect(method).toBe("POST");
    expect(body).toBeFalsy();
    expect(headersInstance).toEqual(headers);
  });

  test('the "ping" function', () => {
    ConversationService.ping("http://localhost", "abcdef");
    const { url, opts } = mockFetchArgs;
    expect(url).toBe("http://localhost/emulator/abcdef/ping");

    const { body, headers, method } = opts;
    expect(headers === headers).toBeTruthy();
    expect(method).toBe("POST");
    expect(body).toBeFalsy();
    expect(headersInstance).toEqual(headers);
  });

  test('the "deleteUserData" function', () => {
    ConversationService.deleteUserData("http://localhost", "abcdef");
    const { url, opts } = mockFetchArgs;
    expect(url).toBe("http://localhost/emulator/abcdef/userdata");

    const { body, headers, method } = opts;
    expect(headers === headers).toBeTruthy();
    expect(method).toBe("DELETE");
    expect(body).toBeFalsy();
    expect(headersInstance).toEqual(headers);
  });
});
