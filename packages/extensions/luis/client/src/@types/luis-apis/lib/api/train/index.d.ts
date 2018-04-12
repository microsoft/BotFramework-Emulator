/// <reference types="node" />

declare module 'luis-apis/lib/api/train' {

  interface ModelTrainStatusDetails {
    statusId: TrainStatus,
    status: string,
    exampleCount: number
  }

  interface ModelTrainStatus {
    modelId: string,
    details: ModelTrainStatusDetails
  }

  class Train {
    getVersionTrainingStatus(params: any): Promise<any>;
    trainApplicationVersion(params: any): Promise<any>;
  }

  export { Train, ModelTrainStatus, ModelTrainStatusDetails, TrainStatus };
}
