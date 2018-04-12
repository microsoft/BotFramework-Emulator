import * as React from 'react';
import { Component } from 'react';
import { css } from 'glamor';
import { Splitter, Colors } from '@bfemulator/ui-react';
import Editor from './Controls/Editor';
import ReactJson from 'react-json-view';
import { RecognizerResult } from './Models/RecognizerResults';
import { LuisAppInfo } from './Models/LuisAppInfo';
import AppStateAdapter from './AppStateAdapter';
import LuisClient from './Luis/Client';
import { AppInfo } from './Luis/AppInfo';
import { IntentInfo } from './Luis/IntentInfo';
import { LuisTraceInfo } from './Models/LuisTraceInfo';
import Header from './Controls/Header';
import MockState from './Data/MockData';

let debug = false;
let $window: any = window;

const LuisApiBasePath = 'https://westus.api.cognitive.microsoft.com/luis/api/v2.0';

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
  width: '622px'
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
  traceInfo: LuisTraceInfo;
  appInfo: AppInfo;
  intentInfo: IntentInfo[];
  pendingTrain: boolean;
  pendingPublish: boolean;
}

interface AppProps {

}

class App extends Component<AppProps, AppState> {

  luisclient: LuisClient;

  constructor(props: any, context: any) {
    super(props, context);
    this.state = {
      traceInfo: {
        luisModel: {
          ModelID: ''
        },
        recognizerResult: {},
        luisOptions: {}
      } as LuisTraceInfo,
      appInfo: {} as AppInfo,
      intentInfo: [] as IntentInfo[],
      pendingPublish: false,
      pendingTrain: false
    };
    this.reassignIntent = this.reassignIntent.bind(this);
  }

  componentWillMount() {
    // Attach a handler to listen on inspect events
    if (!this.runningDetached()) {
      if (debug) {
        $window.host.openDevTools();
      }

      $window.host.on('inspect', async (...args: any[]) => {
        let appState = new AppStateAdapter(args);
        this.setState(appState);
        await this.populateLuisInfo();
      });
    } else {
      this.setState(new MockState());
    }
  }

  render() {
    return (
      <div {...APP_CSS}>
        <Header 
          appId={this.state.traceInfo.luisModel.ModelID}
          appName={this.state.appInfo.name}
          slot={this.state.traceInfo.luisOptions.Staging ? 'Staging' : 'Production'} 
          version={this.state.appInfo.activeVersion}
        />
        <Splitter orientation={'vertical'} primaryPaneIndex={0} minSizes={{ 0: 306, 1: 306 }} initialSizes={{ 0: 306 }}>
          <ReactJson 
            name="luisResponse" 
            src={this.state.traceInfo.recognizerResult} 
            theme="monokai" 
            style={jsonViewerCss} 
          />
          <Editor 
            recognizerResult={this.state.traceInfo.recognizerResult} 
            intentInfo={this.state.intentInfo} 
            intentReassigner={this.reassignIntent} 
          />
        </Splitter>
      </div>
    );
  }

  runningDetached() {
    return !$window.host;
  }

  async populateLuisInfo() {
    if (this.state.traceInfo != null) {
      this.luisclient = new LuisClient({
        appId: this.state.traceInfo.luisModel.ModelID,
        baseUri: LuisApiBasePath,
        key: '368e7395c4884f549fda26bc140aa667' // TODO: Get this from the Emulator
      } as LuisAppInfo);

      let appInfo = await this.luisclient.getApplicationInfo();
      this.setState({
        appInfo: appInfo
      });
      let intents = await this.luisclient.getApplicationIntents(appInfo);
      this.setState({
        intentInfo: intents
      });
    }
  }

  async reassignIntent(newIntent: string): Promise<void> {
    await this.luisclient.reassignIntent(
      this.state.appInfo, 
      this.state.traceInfo.luisResult, 
      newIntent);

    this.setState({
      pendingTrain: true,
      pendingPublish: true
    });
  }

  // TODO: Hook this up to the 'Train' Button and only enable the botton
  // if this.state.pendingTrain is true
  async train(): Promise<void> {
    await this.luisclient.train(this.state.appInfo);
    this.setState({
      pendingTrain: false
    });
  }

  // TODO: Hook this up to the 'Publish' Button and only enable the botton
  // if this.state.pendingPublish is true
  async publish(): Promise<void> {
    await this.luisclient.publish(this.state.appInfo, this.state.traceInfo.luisOptions.Staging || false);
    this.setState({
      pendingPublish: false
    });
  }

}

export { App, AppState };
