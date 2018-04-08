import React, { Component } from 'react';
import { css } from 'glamor';
import { Splitter, Colors } from '@bfemulator/ui-react';
import Simple from './Simple';
import ReactJson from 'react-json-view';

let debug = true;

const EventActivity = 'event';
const LuisTraceEventName = 'https://www.luis.ai/schemas/trace';

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

var defaultCss = {
  backgroundColor: Colors.APP_BACKGROUND_DARK,
  height: '100%',
  overflowY: 'auto'
};

const APP_CSS = css(defaultCss);

class App extends Component {
  
  constructor(){
    super();
    this.state = {
      luisResponse: {}
    };
  }

  static getRecognizerResults(args){
    if(!args || args.length === 0)
      return null;
    
    if(args[0].type !== EventActivity || args[0].name !== LuisTraceEventName)
      return null;

    if(!args[0].value)
      return null;

    return args[0].value;
  }

  componentWillMount(){
    // Attach a handler to listen on inspect events
    if(!this.runningDetached()){
      if(debug){
        window.host.openDevTools(); 
      }
      
      window.host.on('inspect', (...args) => {
        if(debug){
          console.log(args);
        }
        let recognizerResult = App.getRecognizerResults(args);
        if(recognizerResult != null){
          this.setState({
            luisResponse: recognizerResult
          });
        }
      });
    }
  }

  render() {

    return (
      <div { ...APP_CSS }>
        <Splitter orientation={ 'vertical' } primaryPaneIndex={ 0 } minSizes={ { 0: 100, 1: 100 } } initialSizes={ { 0: 300 } }>
            <ReactJson name='luisResponse' src={this.state.luisResponse} theme="monokai" style={defaultCss} />
            <Simple/>
        </Splitter>
      </div>
    );
  }

  runningDetached(){
    return !window.host;
  }
}

export default App;
