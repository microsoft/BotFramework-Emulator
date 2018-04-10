/// <reference types="node" />

declare module 'luis-apis/lib/api/apps/apps' {

  export default class Apps {
    getApplicationsList(): Promise<any>;
    getApplicationInfo(params: any): Promise<any>;
  }
}
