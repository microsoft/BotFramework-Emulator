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

let debug = true;
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

var appCss = {
  backgroundColor: Colors.APP_BACKGROUND_DARK,
  height: '100%',
  overflowY: 'auto'
};

const APP_CSS = css(appCss);

interface AppState {
  traceInfo: LuisTraceInfo;
  appInfo: AppInfo;
  intentInfo: IntentInfo[];
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
        }
      } as LuisTraceInfo,
      appInfo: {} as AppInfo,
      intentInfo: [] as IntentInfo[]
    };
    this.reassignIntent = this.reassignIntent.bind(this);
  }

  componentWillMount() {
    // Attach a handler to listen on inspect events
    if (!this.runningDetached()) {
      if (debug) {
        $window.host.openDevTools();
      }

      $window.host.on('inspect', (...args: any[]) => {
        let appState = new AppStateAdapter(args);
        this.setState(appState);
        this.populateLuisInfo();
      });
    }
  }

  render() {
    return (
      <div {...APP_CSS}>
        <Header 
          appId={this.state.traceInfo.luisModel.ModelID}
          appName={this.state.appInfo.name}
          slot="production" 
          version={this.state.appInfo.activeVersion}
        />
        <Splitter orientation={'vertical'} primaryPaneIndex={0} minSizes={{ 0: 100, 1: 100 }} initialSizes={{ 0: 300 }}>
          <ReactJson name="luisResponse" src={this.state.traceInfo.recognizerResult} theme="monokai" style={appCss} />
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

  populateLuisInfo() {
    if (this.state.traceInfo != null) {
      this.luisclient = new LuisClient({
        appId: this.state.traceInfo.luisModel.ModelID,
        baseUri: LuisApiBasePath,
        key: '368e7395c4884f549fda26bc140aa667' // TODO: Get this from the Emulator
      } as LuisAppInfo);

      this.luisclient.getApplicationInfo().then(appInfo => {
        this.setState({
          appInfo: appInfo
        });
        return this.luisclient.getApplicationIntents(this.state.traceInfo.luisModel.ModelID, appInfo);
      }).then(intents => {
        this.setState({
          intentInfo: intents
        });
      });
    }
  }

  reassignIntent(newIntent: string): Promise<void> {
    return this.luisclient.reassignIntent(
      this.state.traceInfo.luisModel.ModelID, 
      this.state.appInfo, 
      this.state.traceInfo.luisResult, 
      newIntent);
  }
}

export { App, AppState };
