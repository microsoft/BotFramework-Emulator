//=============================================================================
export interface IExtensionPortal {
  title: string;
  url: string;
}

//=============================================================================
export interface IExtensionFile {
  type: string;
  value: string;
}

//=============================================================================
export interface IInspectorCriteria {
  path: string;
  value: string;
}

//=============================================================================
export interface IExtensionInspector {
  name: string;
  path: string;
  criteria: IInspectorCriteria | IInspectorCriteria[];
}

//=============================================================================
export interface IExtensionConfigClient {
  basePath?: string;
  portals?: IExtensionPortal[];
  files?: IExtensionFile[];
  inspectors?: IExtensionInspector[];
  debug?: {
    enabled?: boolean;
    webpack?: {
      port?: number;
      host?: string;
    }
  }
}

//=============================================================================
export interface IExtensionConfigNode {
  main?: string;
  debug?: {
    enabled?: boolean,
    websocket?: {
      port?: number;
      host?: string;
    }
  }
}

//=============================================================================
export interface IExtensionConfig {
  name?: string;
  location?: string;
  node?: IExtensionConfigNode;
  client?: IExtensionConfigClient;
}
