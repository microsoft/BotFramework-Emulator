import * as React from 'react';
import { Component } from 'react';
import { css } from 'glamor';
import { Splitter, Colors } from '@bfemulator/ui-react';
import { IInspectorHost } from '@bfemulator/sdk-client';
import { QnAMakerTraceInfo, QueryResult } from './Models/QnAMakerTraceInfo';
import { Answer } from './Models/QnAMakerModels';
import QnAMakerHeader from './Views/QnAMakerHeader';
import PhrasingsView from './Views/PhrasingsView';
import AnswersView from './Views/AnswersView';
import AppStateAdapter from './AppStateAdapter';

let $host: IInspectorHost = (window as any).host;
const QnAApiBasePath = 'https://westus.api.cognitive.microsoft.com/qnamaker/v2.0/';
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
  subscriptionKey: string;
  persistentState: { [key: string]: PersistentAppState };

  phrasings: string[];
  answers: Answer[];
  selectedAnswer: string;
}

export interface PersistentAppState {
  pendingTrain: boolean;
  pendingPublish: boolean;
}

class App extends Component<{}, AppState> {
  constructor(props: any, context: any) {
    super(props, context);
    this.state = {
      id: '',
      traceInfo: {
        queryResults: [],
        knowledgeBaseId: '',
        scoreThreshold: .3,
        top: 1,
        strictFilters: null,
        metadataBoost: null
      },
      subscriptionKey: '',
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
        console.log(obj);
        let appState = new AppStateAdapter(obj);
        this.setState(appState);
        console.log(this.state);
        $host.setAccessoryState(TrainAccessoryId, AccessoryDefaultState);
        $host.setAccessoryState(PublishAccessoryId, AccessoryDefaultState);
        $host.enableAccessory(TrainAccessoryId, this.state.persistentState[this.state.id] && 
                                                this.state.persistentState[this.state.id].pendingTrain);
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
    }
  }

  render() {
    return (
      <div {...APP_CSS}>
        <QnAMakerHeader 
          knowledgeBaseId={this.state.traceInfo.knowledgeBaseId}
          knowledgeBaseName={'QnAMaker App'}
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
    try {
      const url = QnAApiBasePath + 'knowledgebases/' + this.state.traceInfo.knowledgeBaseId;
      const headers = new Headers({
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': this.state.subscriptionKey
      });
      const qnaPairs = this.state.phrasings.map(
        (phrase) => {return {'question': phrase, 'answer': this.state.selectedAnswer}; }
      );
      const body = {
        'add': {
          'qnaPairs': qnaPairs
        }
      };

      const response = await fetch(url, {headers, method: 'PATCH', body: JSON.stringify(body)});
      console.log(response);
    } finally {
      $host.setAccessoryState(TrainAccessoryId, AccessoryDefaultState);
    }
    this.setAppPersistentState({
      pendingTrain: false,
      pendingPublish: true
    });
  }

  private async publish(): Promise<void> {
    $host.setAccessoryState(PublishAccessoryId, AccessoryWorkingState);
    try {
      const url = QnAApiBasePath + 'knowledgebases/' + this.state.traceInfo.knowledgeBaseId;
      const headers = new Headers({
        'Ocp-Apim-Subscription-Key': this.state.subscriptionKey
      });
      
      const response = await fetch(url, {headers, method: 'PUT'});
      console.log(response);
    } finally {
      $host.setAccessoryState(PublishAccessoryId, AccessoryDefaultState);
    }
    this.setAppPersistentState({
      pendingTrain: false,
      pendingPublish: false
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
    };
  }

  private addPhrasing() {
    return (phrase: string) => {
      let newPhrases: string[] = this.state.phrasings;
      newPhrases.push(phrase);
      this.setState({
        phrasings: newPhrases
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
      pendingTrain: false,
      pendingPublish: false
    }
   };
  }
}

export { App, AppState };
