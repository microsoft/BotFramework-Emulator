// ------------------------------------------------------------------
// Proxy support
const nodeFetch = require("node-fetch");

declare function fetch(
  input: RequestInfo,
  init?: RequestInit
): Promise<Response>;
(global as any).fetch = function(...args: any[]) {
  const [urlOrRequest, requestInit = {}] = args;
  // No Proxy
  const url: string =
    typeof urlOrRequest === "string" ? urlOrRequest : urlOrRequest.url;
  if (
    !process.env.HTTPS_PROXY ||
    (process.env.NO_PROXY && url.includes(process.env.NO_PROXY))
  ) {
    return nodeFetch(...args);
  }
  // URL is first param attach the proxy
  // to the RequestInit
  const HttpsProxyAgent = require("https-proxy-agent");
  const agent = new HttpsProxyAgent(process.env.HTTPS_PROXY);
  if (typeof urlOrRequest === "string") {
    requestInit.agent = agent;
  } else {
    urlOrRequest.agent = agent;
  }
  return nodeFetch(urlOrRequest, requestInit);
};
