/// <reference types="node" />

declare module 'luis-apis/lib/api/examples' {

  export class Example {
    addLabel(params: any, exampleLabelObject: any): Promise<any>;
  };

  export interface AddLabelParams {
    appId: string;
    versionId: string;
  };

  export interface EntityLabel {
    entityName: string;
    startCharIndex: number;
    endCharIndex: number;
  };

  export interface ExampleLabelObject {
    text: string;
    intentName: string;
    entityLabels?: EntityLabel[];
  };
}
