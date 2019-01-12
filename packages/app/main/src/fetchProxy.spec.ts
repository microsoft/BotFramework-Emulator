let mockFetchArgs: { input: RequestInfo; init?: any };
jest.mock("node-fetch", () => {
  return async (input, init) => {
    mockFetchArgs = { input, init };
    return {
      ok: true,
      json: async () => ({}),
      text: async () => "{}"
    };
  };
});

import "./fetchProxy";

describe("fetch proxy support", () => {
  it("should add the https-proxy-agent when the HTTPS_PROXY env var exists", async () => {
    process.env.HTTPS_PROXY = "https://proxy";
    await fetch("https://some.api.com");
    expect(mockFetchArgs.init.agent).not.toBeNull();
  });

  it("should not add the https-proxy-agent when the HTTPS_PROXY env var exists but the NO_PROXY omits the url", () => {
    process.env.HTTPS_PROXY = "https://proxy";
    process.env.NO_PROXY = "localhost";
    fetch("https://localhost").catch();
    expect(mockFetchArgs.init).toBeUndefined();
  });

  it("should not add the http-proxy-agent when the HTTPS_PROXY is omitted", () => {
    delete process.env.HTTPS_PROXY;
    delete process.env.NO_PROXY;
    fetch("https://localhost").catch();
    expect(mockFetchArgs.init).toBeUndefined();
  });
});
