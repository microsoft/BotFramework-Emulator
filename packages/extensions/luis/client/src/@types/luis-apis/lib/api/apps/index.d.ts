/// <reference types="node" />

declare module 'luis-apis/lib/api/apps' {

  interface ApplicationPublishRequest {
    versionId: string,
    isStaging: bool,
    region: string
  }

  class Apps {
    getApplicationsList(): Promise<any>;
    getApplicationInfo(params: any): Promise<any>;
  }

  class Publish {
    publishApplication(params, applicationPublishObject): Promise<any>;
  }

  export { Apps, Publish, ApplicationPublishRequest };
}
