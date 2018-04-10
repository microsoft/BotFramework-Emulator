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
  color: 'white'
});

class Header extends Component<HeaderProps, HeaderState> {

  constructor(props: any, context: any) {
    super(props, context);
  }

  render() {
    return (
      <div {...HEADER_CSS}>
        <span>{this.props.appName}</span>
        <span>App ID: {this.props.appId}</span>
        <span>Version: {this.props.version}</span>
        <span>Slot: {this.props.slot}</span>
      </div>
    );
  }
}

export default Header;
