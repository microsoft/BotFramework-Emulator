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

import { InspectorHost } from '@bfemulator/sdk-client';
import { Colors, Fonts, Splitter } from '@bfemulator/ui-react';
import { css } from 'glamor';
import * as React from 'react';
import { IBotConfig, IQnAService, ServiceType } from 'msbot/bin/schema';
import { QnAKbInfo, QnAMakerClient } from './QnAMaker/Client';
import { QnAMakerTraceInfo } from './Models/QnAMakerTraceInfo';
import { Answer } from './Models/QnAMakerModels';
import QnAMakerHeader from './Views/QnAMakerHeader';
import PhrasingsView from './Views/PhrasingsView';
import AnswersView from './Views/AnswersView';
import AppStateAdapter from './AppStateAdapter';

let $host: InspectorHost = (window as any).host;
const QnAApiBasePath = 'https://westus.api.cognitive.microsoft.com/qnamaker/v4.0';
const TrainAccessoryId = 'train';
const PublishAccessoryId = 'publish';
const AccessoryDefaultState = 'default';
const AccessoryWorkingState = 'working';

let persistentStateKey = Symbol('persistentState').toString();

let globalCss = {
  whiteSpace: 'nowrap',
  width: '100%',
  color: 'white',
};

GlobalCss.setCss(globalCss);

const AppCss = css({
  height: '100%',
  fontSize: '12px',
  padding: '5px',
  overflowY: 'auto'
});

const NoServiceCss = css({
  padding: '20px',
});

interface AppState {
  id: string;
  traceInfo: QnAMakerTraceInfo;
  qnaService: IQnAService | null;
  persistentState: { [key: string]: PersistentAppState };

  phrasings: string[];
  answers: Answer[];
  selectedAnswer: Answer | null;
}

interface PersistentAppState {
  pendingTrain: boolean;
  pendingPublish: boolean;
}

class App extends React.Component<any, AppState> {

  client: QnAMakerClient;

  static getQnAServiceFromBot(bot: IBotConfig, kbId: string): IQnAService | null {
    if (!bot || !bot.services || !kbId) {
      return null;
    }

    kbId = kbId.toLowerCase();
    let qnaServices = bot.services.filter(s => s.type === ServiceType.QnA) as IQnAService[];
    let qnaService = qnaServices.find(ls => ls.kbId.toLowerCase() === kbId);
    if (qnaService) {
      return qnaService;
    }
    if (qnaServices.length > 0) {
      return qnaServices[0];
    }

    return null;
  }

  constructor(props: any, context: any) {
    super(props, context);
    this.state = {
      id: '',
      traceInfo: {
        message: {},
        queryResults: [],
        knowledgeBaseId: '',
        scoreThreshold: .3,
        top: 1,
        strictFilters: null,
        metadataBoost: null
      },
      qnaService: null,
      persistentState: this.loadAppPersistentState(),
      phrasings: [],
      answers: [],
      selectedAnswer: null
    };
  }

  componentWillMount() {
    // Attach a handler to listen on inspect events
    if (!this.runningDetached()) {
      $host.on('inspect', async (obj: any) => {
        let appState = new AppStateAdapter(obj);
        appState.qnaService = App.getQnAServiceFromBot($host.bot, appState.traceInfo.knowledgeBaseId);
        this.setState(appState);
        if (appState.qnaService !== null) {
          this.client = new QnAMakerClient({
            kbId: appState.traceInfo.knowledgeBaseId,
            baseUri: QnAApiBasePath,
            subscriptionKey: appState.qnaService.subscriptionKey
          } as QnAKbInfo);
        }
        $host.setInspectorTitle('QnAMaker');
        $host.setAccessoryState(TrainAccessoryId, AccessoryDefaultState);
        $host.setAccessoryState(PublishAccessoryId, AccessoryDefaultState);
        $host.enableAccessory(TrainAccessoryId, this.state.persistentState[this.state.id] &&
                                                this.state.persistentState[this.state.id].pendingTrain &&
                                                this.state.selectedAnswer !== null);
        $host.enableAccessory(PublishAccessoryId, this.state.persistentState[this.state.id] &&
                                                  this.state.persistentState[this.state.id].pendingPublish);
      });

      $host.on('accessory-click', async (id: string) => {
        switch (id) {
          case TrainAccessoryId:
            await this.train();
            break;
          case PublishAccessoryId:
            await this.publish();
            break;
          default:
            break;
        }
      });

      $host.on('bot-updated', (bot: IBotConfig) => {
        this.setState({
          qnaService: App.getQnAServiceFromBot(bot, this.state.traceInfo.knowledgeBaseId),
        });
      });
    }
  }

  render() {
    if (this.state.qnaService === null) {
      const text = 'Unable to find a QnA Maker service with Knowledge Base ID ' + this.state.traceInfo.knowledgeBaseId
        + '. Please add a QnA Maker service to your bot.';
      return <div className="no-service" {...NoServiceCss}>{text}</div>;
    }
    return (
      <div {...AppCss}>
        <QnAMakerHeader
          knowledgeBaseId={this.state.traceInfo.knowledgeBaseId}
          knowledgeBaseName={this.state.qnaService.name}
        />
        <Splitter orientation={'vertical'} primaryPaneIndex={0} minSizes={{ 0: 306, 1: 306 }} initialSizes={{ 0: 306 }}>
          <PhrasingsView
            phrasings={this.state.phrasings}
            addPhrasing={this.addPhrasing()}
            removePhrasing={this.removePhrasing()}
          />
          <AnswersView
            answers={this.state.answers}
            selectedAnswer={this.state.selectedAnswer}
            selectAnswer={this.selectAnswer()}
            addAnswer={this.addAnswer()}
          />
        </Splitter>
      </div>
    );
  }

  private async train() {
    $host.setAccessoryState(TrainAccessoryId, AccessoryWorkingState);
    let success = false;
    try {
      if (this.state.qnaService !== null) {
        if (this.state.selectedAnswer) {
          let newQuestion = this.state.selectedAnswer.id === 0;
          let questions = newQuestion ? this.state.phrasings : { 'add': this.state.phrasings };
          let metadata = newQuestion ? [] : {'add': [], 'delete': []};
          let qnaList = { 'qnaList': [
            {
              'id': this.state.selectedAnswer.id,
              'answer': this.state.selectedAnswer.text,
              'source': 'Editorial',
              'questions': questions,
              'metadata': metadata,
            }
          ]};
          const body = newQuestion ? { 'add': qnaList }   : { 'update': qnaList };
          const response = await this.client.updateKnowledgebase(this.state.traceInfo.knowledgeBaseId, body);
          success = response.status === 200;
          $host.logger.log('Successfully trained Knowledge Base ' + this.state.traceInfo.knowledgeBaseId);
        } else {
          $host.logger.error('Select an answer before trying to train.');
        }
      }
    } catch (err) {
      $host.logger.error(err.message);
    } finally {
      $host.setAccessoryState(TrainAccessoryId, AccessoryDefaultState);
      this.setAppPersistentState({
        pendingTrain: !success,
        pendingPublish: success
      });
    }
  }

  private async publish(): Promise<void> {
    $host.setAccessoryState(PublishAccessoryId, AccessoryWorkingState);
    let success = false;
    try {
      if (this.state.qnaService !== null) {
        $host.logger.log('Publishing...');
        let response = await this.client.publish(this.state.traceInfo.knowledgeBaseId);
        success = response.status === 204;
        if (success) {
          $host.logger.log('Successfully published Knowledge Base ' + this.state.traceInfo.knowledgeBaseId);
        } else {
          $host.logger.error('Request to QnA Maker failed. ' + response.statusText);
        }
      }
    } catch (err) {
      $host.logger.error(err.message);
    }  finally {
      $host.setAccessoryState(PublishAccessoryId, AccessoryDefaultState);
    }
    this.setAppPersistentState({
      pendingTrain: false,
      pendingPublish: !success
    });
  }

  private runningDetached() {
    return !$host;
  }

  private selectAnswer() {
    return (newAnswer: Answer) => {
      this.setState({
        selectedAnswer: newAnswer
      });
      this.setAppPersistentState({
        pendingTrain: true,
        pendingPublish: false
      });
    };
  }

  private addPhrasing() {
    return (phrase: string) => {
      let newPhrases: string[] = this.state.phrasings;
      newPhrases.push(phrase);
      this.setState({
        phrasings: newPhrases
      });
      this.setAppPersistentState({
        pendingTrain: this.state.selectedAnswer !== null,
        pendingPublish: false
      });
    };
  }

  private removePhrasing() {
    return (phrase: string) => {
      let newPhrases: string[] = this.state.phrasings;
      let phrasesIndex = newPhrases.indexOf(phrase);
      newPhrases.splice(phrasesIndex, 1);
      this.setState({
        phrasings: newPhrases
      });
      this.setAppPersistentState({
        pendingTrain: this.state.selectedAnswer !== null,
        pendingPublish: false
      });
    };
  }

  private addAnswer() {
    return (newAnswer: string) => {
      let newAnswers: Answer[] = this.state.answers;
      newAnswers.push({
        id: 0,
        text: newAnswer,
        score: 0,
        filters: {}
      });
      this.setState({
        answers: newAnswers
      });
      this.setAppPersistentState({
        pendingTrain: this.state.selectedAnswer !== null,
        pendingPublish: false
      });
    };
  }

  private setAppPersistentState(persistentState: PersistentAppState) {
    this.state.persistentState[this.state.id] = persistentState;
    this.setState({persistentState: this.state.persistentState});
    localStorage.setItem(persistentStateKey, JSON.stringify(this.state.persistentState));
    $host.enableAccessory(TrainAccessoryId, persistentState.pendingTrain);
    $host.enableAccessory(PublishAccessoryId, persistentState.pendingPublish);
  }

  private loadAppPersistentState(): {[key: string]: PersistentAppState} {
    let persisted = localStorage.getItem(persistentStateKey);
    if (persisted !== null) {
      return JSON.parse(persisted);
    }
    return { '': {
      pendingTrain: true,
      pendingPublish: false
    }
   };
  }
}

export { App, AppState, PersistentAppState};
