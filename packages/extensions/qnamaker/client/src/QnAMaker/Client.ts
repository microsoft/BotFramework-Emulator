//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

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
