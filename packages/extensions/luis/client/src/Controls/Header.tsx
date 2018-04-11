import * as React from 'react';
import { Component } from 'react';
import { css } from 'glamor';

interface HeaderState {

}

interface HeaderProps {
  appName: string;
  appId: string;
  version: string;
  slot: string;
}

const HEADER_CSS = css({
  color: 'white',
  fontFamily: 'Segoe UI, sans-serif',
  fontSize: '12px',
  padding: '6px 3px 6px 3px',
  userSelect: 'text',
  display: 'inline-block',
  width: '100%',

  '& #left': {
    display: 'block',
    float: 'left',

    '& #appName': {
      fontWeight: 'bold'
    },
  
    '& #appId': {
      paddingLeft: '16px'
    },
  },

  '& #right' : {
    float: 'right',
    display: 'block',
    
    '& #appVersion': {  
      paddingRight: '16px'
    },
  
    '& #appSlot': {
      paddingRight: '6px'
    }
  }
});

class Header extends Component<HeaderProps, HeaderState> {

  constructor(props: any, context: any) {
    super(props, context);
  }

  render() {
    return (
      <div {...HEADER_CSS}>
        <div id="left">
          <span id="appName">{this.props.appName}</span>
          <span id="appId">App ID: {this.props.appId}</span>
        </div>
        <div id="right">
          <span id="appVersion">Version: {this.props.version}</span>
          <span id="appSlot">Slot: {this.props.slot}</span>
        </div>
      </div>
    );
  }
}

export default Header;
