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
import { Splitter } from '@bfemulator/ui-react';
import { IBotConfiguration, IQnAService, ServiceTypes } from 'botframework-config/lib/schema';
import * as React from 'react';

import * as styles from './App.scss';
import AppStateAdapter from './AppStateAdapter';
import { Answer } from './Models/QnAMakerModels';
import { QnAMakerTraceInfo } from './Models/QnAMakerTraceInfo';
import { QnAKbInfo, QnAMakerClient } from './QnAMaker/Client';
import AnswersView from './Views/AnswersView/AnswersView';
import PhrasingsView from './Views/PhrasingsView/PhrasingsView';
import QnAMakerHeader from './Views/QnAMakerHeader/QnAMakerHeader';

const $host: InspectorHost = (window as any).host;
const QnAApiBasePath = 'https://westus.api.cognitive.microsoft.com/qnamaker/v4.0';
const TrainAccessoryId = 'train';
const PublishAccessoryId = 'publish';
const AccessoryDefaultState = 'default';
const AccessoryWorkingState = 'working';

const persistentStateKey = Symbol('persistentState').toString();

export interface AppState {
  id: string;
  traceInfo: QnAMakerTraceInfo;
  qnaService: IQnAService | null;
  persistentState: { [key: string]: PersistentAppState };

  phrasings: string[];
  answers: Answer[];
  selectedAnswer: Answer | null;
}

export interface PersistentAppState {
  pendingTrain: boolean;
  pendingPublish: boolean;
}

export class App extends React.Component<any, AppState> {
  public client: QnAMakerClient;

  public static getQnAServiceFromBot(bot: IBotConfiguration, kbId: string): IQnAService | null {
    if (!bot || !bot.services || !kbId) {
      return null;
    }

    kbId = kbId.toLowerCase();
    const qnaServices = bot.services.filter(s => s.type === ServiceTypes.QnA) as IQnAService[];
    const qnaService = qnaServices.find(ls => ls.kbId.toLowerCase() === kbId);
    if (qnaService) {
      return qnaService;
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
        scoreThreshold: 0.3,
        top: 1,
        strictFilters: null,
        metadataBoost: null,
      },
      qnaService: null,
      persistentState: this.loadAppPersistentState() || {},
      phrasings: [],
      answers: [],
      selectedAnswer: null,
    };
  }

  public componentWillMount() {
    // Attach a handler to listen on inspect events
    if (!this.runningDetached()) {
      $host.on('inspect', async (obj: any) => {
        const appState = new AppStateAdapter(obj);
        appState.qnaService = App.getQnAServiceFromBot($host.bot, appState.traceInfo.knowledgeBaseId);
        appState.persistentState = this.state.persistentState;
        this.setState(appState);
        if (appState.qnaService !== null) {
          this.client = new QnAMakerClient({
            kbId: appState.traceInfo.knowledgeBaseId,
            baseUri: QnAApiBasePath,
            subscriptionKey: appState.qnaService.subscriptionKey,
          } as QnAKbInfo);
        }
        $host.setInspectorTitle('QnAMaker');
        $host.setAccessoryState(TrainAccessoryId, AccessoryDefaultState);
        $host.setAccessoryState(PublishAccessoryId, AccessoryDefaultState);
        $host.enableAccessory(
          TrainAccessoryId,
          this.state.persistentState[this.state.id] &&
            this.state.persistentState[this.state.id].pendingTrain &&
            this.state.selectedAnswer !== null
        );
        $host.enableAccessory(
          PublishAccessoryId,
          this.state.persistentState[this.state.id] && this.state.persistentState[this.state.id].pendingPublish
        );
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

      $host.on('bot-updated', (bot: IBotConfiguration) => {
        this.setState({
          qnaService: App.getQnAServiceFromBot(bot, this.state.traceInfo.knowledgeBaseId),
        });
      });

      $host.on('theme', async (themeInfo: { themeName: string; themeComponents: string[] }) => {
        const oldThemeComponents = document.querySelectorAll<HTMLLinkElement>('[data-theme-component="true"]');
        const head = document.querySelector<HTMLHeadElement>('head') as HTMLHeadElement;
        const fragment = document.createDocumentFragment();
        const promises: Promise<any>[] = [];
        // Create the new links for each theme component
        themeInfo.themeComponents.forEach(themeComponent => {
          const link = document.createElement<'link'>('link');
          promises.push(
            new Promise(resolve => {
              link.addEventListener('load', resolve);
            })
          );
          link.href = themeComponent;
          link.rel = 'stylesheet';
          link.setAttribute('data-theme-component', 'true');
          fragment.appendChild(link);
        });
        head.insertBefore(fragment, head.firstElementChild);
        // Wait for all the links to load their css
        await Promise.all(promises);
        // Remove the old links
        Array.prototype.forEach.call(oldThemeComponents, (themeComponent: HTMLLinkElement) => {
          if (themeComponent.parentElement) {
            themeComponent.parentElement.removeChild(themeComponent);
          }
        });
      });
    }
  }

  public render() {
    if (this.state.qnaService === null) {
      const text =
        'Unable to find a QnA Maker service with Knowledge Base ID ' +
        this.state.traceInfo.knowledgeBaseId +
        '. Please add a QnA Maker service to your bot.';
      return (
        <div className={styles.noService}>
          <p>{text}</p>
        </div>
      );
    }
    return (
      <div className={styles.app}>
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
          const newQuestion = this.state.selectedAnswer.id === 0;
          const questions = newQuestion ? this.state.phrasings : { add: this.state.phrasings };
          const metadata = newQuestion ? [] : { add: [], delete: [] };
          const qnaList = {
            qnaList: [
              {
                id: this.state.selectedAnswer.id,
                answer: this.state.selectedAnswer.text,
                source: 'Editorial',
                questions,
                metadata,
              },
            ],
          };
          const body = newQuestion ? { add: qnaList } : { update: qnaList };
          const response = await this.client.updateKnowledgebase(this.state.traceInfo.knowledgeBaseId, body);
          success = response.status === 200;
          $host.logger.log('Successfully trained Knowledge Base ' + this.state.traceInfo.knowledgeBaseId);
          $host.trackEvent('qna_trainSuccess');
        } else {
          $host.logger.error('Select an answer before trying to train.');
        }
      }
    } catch (err) {
      $host.logger.error(err.message);
      $host.trackEvent('qna_trainFailure', { error: err.message });
    } finally {
      $host.setAccessoryState(TrainAccessoryId, AccessoryDefaultState);
      this.setAppPersistentState({
        pendingPublish: success,
        pendingTrain: !success,
      });
    }
  }

  private async publish(): Promise<void> {
    $host.setAccessoryState(PublishAccessoryId, AccessoryWorkingState);
    let success = false;
    try {
      if (this.state.qnaService !== null) {
        $host.logger.log('Publishing...');
        const response = await this.client.publish(this.state.traceInfo.knowledgeBaseId);
        success = response.status === 204;
        if (success) {
          $host.logger.log('Successfully published Knowledge Base ' + this.state.traceInfo.knowledgeBaseId);
          $host.trackEvent('qna_publishSuccess');
        } else {
          $host.logger.error('Request to QnA Maker failed. ' + response.statusText);
          $host.trackEvent('qna_publishFailure', { error: response.statusText });
        }
      }
    } catch (err) {
      $host.logger.error(err.message);
      $host.trackEvent('qna_publishFailure', { error: err.message });
    } finally {
      $host.setAccessoryState(PublishAccessoryId, AccessoryDefaultState);
    }
    this.setAppPersistentState({
      pendingPublish: !success,
      pendingTrain: false,
    });
  }

  private runningDetached() {
    return !$host;
  }

  private selectAnswer() {
    return (newAnswer: Answer) => {
      this.setState({
        selectedAnswer: newAnswer,
      });
      this.setAppPersistentState({
        pendingPublish: false,
        pendingTrain: true,
      });
    };
  }

  private addPhrasing() {
    return (phrase: string) => {
      const newPhrases: string[] = this.state.phrasings;
      newPhrases.push(phrase);
      this.setState({
        phrasings: newPhrases,
      });
      this.setAppPersistentState({
        pendingPublish: false,
        pendingTrain: this.state.selectedAnswer !== null,
      });
    };
  }

  private removePhrasing() {
    return (phrase: string) => {
      const newPhrases: string[] = this.state.phrasings;
      const phrasesIndex = newPhrases.indexOf(phrase);
      newPhrases.splice(phrasesIndex, 1);
      this.setState({
        phrasings: newPhrases,
      });
      this.setAppPersistentState({
        pendingPublish: false,
        pendingTrain: this.state.selectedAnswer !== null,
      });
    };
  }

  private addAnswer() {
    return (newAnswer: string) => {
      const answerObj = {
        filters: {},
        id: 0,
        score: 0,
        text: newAnswer,
      };
      const newAnswers: Answer[] = this.state.answers;
      newAnswers.push(answerObj);
      this.setState({
        answers: newAnswers,
        selectedAnswer: answerObj,
      });
      this.setAppPersistentState({
        pendingPublish: false,
        pendingTrain: this.state.selectedAnswer !== null,
      });
    };
  }

  private setAppPersistentState(persistentState: PersistentAppState) {
    // eslint-disable-next-line react/no-direct-mutation-state
    this.state.persistentState[this.state.id] = persistentState;
    this.setState({ persistentState: this.state.persistentState });
    localStorage.setItem(persistentStateKey, JSON.stringify(this.state.persistentState));
    $host.enableAccessory(TrainAccessoryId, persistentState.pendingTrain);
    $host.enableAccessory(PublishAccessoryId, persistentState.pendingPublish);
  }

  private loadAppPersistentState(): { [key: string]: PersistentAppState } {
    const persisted = localStorage.getItem(persistentStateKey);
    if (persisted !== null) {
      return JSON.parse(persisted);
    }
    return {
      '': {
        pendingPublish: false,
        pendingTrain: true,
      },
    };
  }
}
