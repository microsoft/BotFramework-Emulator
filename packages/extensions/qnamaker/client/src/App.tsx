import * as React from 'react';
import { Component } from 'react';
import { css } from 'glamor';
import { Splitter, Colors } from '@bfemulator/ui-react';
import { IInspectorHost } from '@bfemulator/sdk-client';
import { IActivity, ServiceType, IBotConfig, IDispatchService, IQnAService } from '@bfemulator/sdk-shared';
import { QnAMakerClient, QnAKbInfo } from './QnAMaker/Client';
import { QnAMakerTraceInfo, QueryResult } from './Models/QnAMakerTraceInfo';
import { Answer } from './Models/QnAMakerModels';
import QnAMakerHeader from './Views/QnAMakerHeader';
import PhrasingsView from './Views/PhrasingsView';
import AnswersView from './Views/AnswersView';
import AppStateAdapter from './AppStateAdapter';

let $host: IInspectorHost = (window as any).host;
const QnAApiBasePath = 'https://westus.api.cognitive.microsoft.com/qnamaker/v2.0';
const TrainAccessoryId = 'train';
const PublishAccessoryId = 'publish';
const AccessoryDefaultState = 'default';
const AccessoryWorkingState = 'working';

let persistentStateKey = Symbol('persistentState').toString();

// TODO: Get these from @bfemulator/react-ui once they're available
css.global('html, body, #root', {
  backgroundColor: Colors.APP_BACKGROUND_DARK,
  cursor: 'default',
  fontSize: '13px',
  height: '100%',
  margin: 0,
  minHeight: '100%',
  overflow: 'hidden',
  userSelect: 'none',
  whiteSpace: 'nowrap',
  width: '100%',
  color: 'white',
});

css.global('div', {
  boxSizing: 'border-box',
});

css.global('::-webkit-scrollbar', {
  width: '10px',
  height: '10px',
});

css.global('::-webkit-scrollbar-track', {
  background: Colors.SCROLLBAR_TRACK_BACKGROUND_DARK,
});

css.global('::-webkit-scrollbar-thumb', {
  background: Colors.SCROLLBAR_THUMB_BACKGROUND_DARK,
});

let appCss = {
  backgroundColor: Colors.APP_BACKGROUND_DARK,
  height: '100%',
  fontFamily: 'Segoe UI, sans-serif',
  fontSize: '12px',
  padding: '5px'
};

let jsonViewerCss = {
  overflowY: 'auto'
};

jsonViewerCss = Object.assign({}, appCss, jsonViewerCss);

const APP_CSS = css(appCss);

interface AppState {
  id: string;
  traceInfo: QnAMakerTraceInfo;
  qnaService: IQnAService | null;
  persistentState: { [key: string]: PersistentAppState };

  phrasings: string[];
  answers: Answer[];
  selectedAnswer: string;
}

interface PersistentAppState {
  pendingTrain: boolean;
  pendingPublish: boolean;
}

class App extends Component<any, AppState> {

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

    console.log('No QnA Service found in the bot config for knowledgebase Id: ' + kbId);
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
      selectedAnswer: ''
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
                                                this.state.selectedAnswer !== '');
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
      return <div>You gotta add a QnA Service to your bot file!</div>;
    }
    return (
      <div {...APP_CSS}>
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
        const url = QnAApiBasePath + '/knowledgebases/' + this.state.traceInfo.knowledgeBaseId;
        const headers = new Headers({
          'Content-Type': 'application/json',
          'Ocp-Apim-Subscription-Key': this.state.qnaService.subscriptionKey
        });
        const qnaPairs = this.state.phrasings.map(
          (phrase) => {return {'question': phrase, 'answer': this.state.selectedAnswer}; }
        );
        const body = {
          'add': {
            'qnaPairs': qnaPairs
          }
        };

        const response = await this.client.updateKnowledgebase(this.state.traceInfo.knowledgeBaseId, body);
        // const resp = await fetch(url, {headers, method: 'PATCH', body: JSON.stringify(body)});
        success = response.status === 204;
      }
    } finally {
      $host.setAccessoryState(TrainAccessoryId, AccessoryDefaultState);
    }
    this.setAppPersistentState({
      pendingTrain: !success,
      pendingPublish: success
    });
  }

  private async publish(): Promise<void> {
    $host.setAccessoryState(PublishAccessoryId, AccessoryWorkingState);
    let success = false;
    try {
      if (this.state.qnaService !== null) {
        const url = QnAApiBasePath + '/knowledgebases/' + this.state.traceInfo.knowledgeBaseId;
        const headers = new Headers({
          'Ocp-Apim-Subscription-Key': this.state.qnaService.subscriptionKey
        });
        
        const response = await this.client.publish(this.state.traceInfo.knowledgeBaseId);
        // const response = await fetch(url, {headers, method: 'PUT'});
        success = response.status === 204;
      }
    } finally {
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
    return (newAnswer: string) => {
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
        pendingTrain: this.state.selectedAnswer !== '',
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
        pendingTrain: this.state.selectedAnswer !== '',
        pendingPublish: false
      });
    };
  }

  private addAnswer() {
    return (newAnswer: string) => {
      let newAnswers: Answer[] = this.state.answers;
      newAnswers.push({
        text: newAnswer,
        score: 0,
        filters: {}
      });
      this.setState({
        answers: newAnswers
      });
      this.setAppPersistentState({
        pendingTrain: this.state.selectedAnswer !== '',
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
