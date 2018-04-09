import * as React from 'react';
import { Component } from 'react';
import { css } from 'glamor';
import { Splitter, Colors } from '@bfemulator/ui-react';
import Editor from './Controls/Editor';
import ReactJson from 'react-json-view';
import { RecognizerResult } from './Models/RecognizerResults';
import { LuisAppInfo } from './Models/LuisAppInfo';
import AppStateAdapter from './AppStateAdapter';

let debug = true;
let $window: any = window;

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
  recognizerResult: RecognizerResult;
  luisAppInfo: LuisAppInfo;
}

interface AppProps {

}

class App extends Component<AppProps, AppState> {

  constructor(props: any, context: any) {
    super(props, context);
    this.state = {
      recognizerResult: {} as RecognizerResult,
      luisAppInfo: {} as LuisAppInfo
    };
  }

  componentWillMount() {
    // Attach a handler to listen on inspect events
    if (!this.runningDetached()) {
      if (debug) {
        $window.host.openDevTools(); 
      }
      
      $window.host.on('inspect', (...args: any[]) => {
        if (debug) {
          console.log(args);
        }
        let appState = new AppStateAdapter(args);
        console.log('recognizeResult', args);
        if (appState.recognizerResult != null) {
          this.setState({
            recognizerResult: appState.recognizerResult
          });
        }
      });
    }
  }

  render() {
    return (
      <div {...APP_CSS}>
        <Splitter orientation={'vertical'} primaryPaneIndex={0} minSizes={{0: 100, 1: 100}} initialSizes={{0: 300}}>
            <ReactJson name="luisResponse" src={this.state.recognizerResult} theme="monokai" style={appCss} />
            <Editor recognizerResult={this.state.recognizerResult}/>
        </Splitter>
      </div>
    );
  }

  runningDetached() {
    return !$window.host;
  }
}

export { App, AppState };
