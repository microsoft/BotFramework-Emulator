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

/* eslint-disable typescript/no-var-requires */
const operations = require('qnamaker/lib/api/operations');
const knowledgebase = require('qnamaker/lib/api/knowledgebase');
/* eslint-enable typescript/no-var-requires */

class QnAMakerClientError extends Error {
  private static getMessage(message: string, statusCode: number | undefined): string {
    let errorMessage = message;
    if (statusCode) {
      errorMessage += ' - HTTP Status Code: ' + statusCode;
    }
    return errorMessage;
  }

  constructor(message: string, statusCode?: number) {
    super(QnAMakerClientError.getMessage(message, statusCode));
  }
}

const MaxRetries = 40;
const WaitIntervalInMs = 1000;

export interface QnAKbInfo {
  kbId: string;
  subscriptionKey: string;
  baseUri: string;
}

export class QnAMakerClient {
  private qnaMakerKbInfo: QnAKbInfo;
  private knowledgebase: any;
  private operations: any;

  constructor(qnaMakerKbInfo: QnAKbInfo) {
    this.qnaMakerKbInfo = qnaMakerKbInfo;
    this.knowledgebase = new knowledgebase();
    this.operations = new operations();
  }

  public async updateKnowledgebase(kbId: string, requestBody: any): Promise<any> {
    this.configureClient();
    const params = {
      kbId,
    };
    let result = await this.knowledgebase.updateKnowledgebase(params, requestBody);
    if (result.status !== 202) {
      throw new QnAMakerClientError('Failed to queue training.', result.statusCode);
    }

    const resultJson = await result.json();
    let retryCounter = 0;
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line prefer-const
      let intervalId: number;
      const callLoop = async () => {
        result = await this.operations.getOperationDetails({
          operationId: resultJson.operationId,
        });

        if (retryCounter++ >= MaxRetries) {
          clearInterval(intervalId);
          reject('Failed to train the knowledgebase');
        }

        if (result.status !== 200) {
          return;
        }

        const trainingStatus = await result.json();
        if (trainingStatus.operationState === 'Succeeded') {
          clearInterval(intervalId);
          resolve(result);
        }
      };
      intervalId = window.setInterval(callLoop, WaitIntervalInMs);
    });
  }

  public async publish(kbId: string): Promise<any> {
    this.configureClient();
    const params = {
      kbId,
    };
    const result = await this.knowledgebase.publishKnowledgebase(params);
    return result;
  }

  public async getOperationDetails(opId: string): Promise<any> {
    this.configureClient();
    const params = {
      operationId: opId,
    };
    const result = await this.operations.getOperationDetails(params);
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
