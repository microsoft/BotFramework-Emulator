/// <reference types="node" />

declare module 'luis-apis/lib/api/models/intents' {

  export default class Intents {
    getVersionIntentList(params: any): Promise<any>;
  }
}
