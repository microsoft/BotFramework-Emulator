interface EndpointInfo {
  endpointRegion: string;
}

interface Endpoints {
  PRODUCTION?: EndpointInfo;
  STAGING?: EndpointInfo;
}

interface AppInfo {
  activeVersion: string;
  name: string;
  authorized: boolean;
  appId: string;
  endpoints: Endpoints;
}

export { EndpointInfo, Endpoints, AppInfo };