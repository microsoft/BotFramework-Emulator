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

import * as React from 'react';
import { Component } from 'react';
import { css } from 'glamor';
import { Colors } from '@bfemulator/ui-react';

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
      paddingLeft: '16px',
      color: Colors.APP_HYPERLINK_DETAIL_DARK
    },
  },

  '& #right' : {
    float: 'right',
    display: 'block',

    '& #appVersion': {
      paddingRight: '16px',
      color: Colors.APP_HYPERLINK_DETAIL_DARK
    },

    '& #appSlot': {
      paddingRight: '6px',
      color: Colors.APP_HYPERLINK_DETAIL_DARK
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
