import * as React from 'react';
import { Component, MouseEventHandler } from 'react';
import { css } from 'glamor';

enum ButtonSelected {
  RecognizerResult,
  RawResponse
}

const CONTROLBAR_CSS = css({
  padding: '6px 3px 6px 3px',
  '& a': {
    color: 'white',
    textDecoration: 'none'
  },

  '& #rawResponseButton': {
    paddingLeft: '8px'
  }
  
});

interface ControlBarState {

}

interface ControlBarProps {
  setButtonSelected: (buttonSelected: ButtonSelected) => void;
  buttonSelected: ButtonSelected;
}

class ControlBar extends Component<ControlBarProps, ControlBarState> {

  clickHandler: MouseEventHandler<HTMLAnchorElement> = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    this.props.setButtonSelected(ButtonSelected[e.currentTarget.id]);
  }

  constructor(props: any, context: any) {
    super(props, context);
  }

  render() {
    return (
      <div {...CONTROLBAR_CSS}>
        <span id="recognizerResultButton">
          <a 
            id={ButtonSelected[ButtonSelected.RecognizerResult]} 
            href="#" 
            onClick={this.clickHandler}
            style={this.props.buttonSelected === ButtonSelected.RecognizerResult ? {textDecoration: 'underline'} : {}}
          >
              Recognizer Result
          </a>
        </span>
        <span id="rawResponseButton">
          <a 
            id={ButtonSelected[ButtonSelected.RawResponse]} 
            href="#" 
            onClick={this.clickHandler}
            style={this.props.buttonSelected === ButtonSelected.RawResponse ? {textDecoration: 'underline'} : {}}
          >
              Raw Response
          </a>
        </span>
      </div>
    );
  }
}

export { ControlBar, ButtonSelected };
