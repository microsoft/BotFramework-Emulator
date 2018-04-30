import { ServiceBase } from 'qnamaker/lib/api/serviceBase';
const qnamaker: any = require('qnamaker');

// let result = await kb.updateKnowledgeBase({knowledgeBaseID: this.state.traceInfo.knowledgeBaseId}, body);

export interface QnAKbInfo {
  kbId: string;
  subscriptionKey: string;
  baseUri: string;
}

export class QnAMakerClient {

  private qnaMakerKbInfo: QnAKbInfo;
  private knowledgebases: any;

  constructor(qnaMakerKbInfo: QnAKbInfo) {
    this.qnaMakerKbInfo = qnaMakerKbInfo;
    this.knowledgebases = new qnamaker.knowledgebases();
  }

  async updateKnowledgebase(kbId: string, qnaPairs: any): Promise<any> {
    this.configureClient();
    const params = {
      knowledgeBaseID: kbId
    };
    let result = await this.knowledgebases.updateKnowledgeBase(params, qnaPairs);
    return result;
  }

  async publish(kbId: string): Promise<any> {
    this.configureClient();
    const params = {
      knowledgeBaseID: kbId
    };
    let result = await this.knowledgebases.publishKnowledgeBase(params);
    return result;
  }

  private configureClient() {
    // TODO: It's annoying that the settings are singleton and static
    // This makes it hard to cache multiple clients for different apps
    // We should consider updating the Client SDK to make the configs per service
    ServiceBase.config = {
      endpointBasePath: this.qnaMakerKbInfo.baseUri,
      subscriptionKey: this.qnaMakerKbInfo.subscriptionKey,
    };
  }
}
