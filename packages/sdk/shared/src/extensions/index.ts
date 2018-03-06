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
export interface IExtensionConfig {
  name?: string;
  main?: string;
  portals?: IExtensionPortal[];
  files?: IExtensionFile[];
  location?: string;
}
