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

import { css } from 'glamor';
import * as React from 'react';

import { Colors, filterChildren, hmrSafeNameComparison } from '@bfemulator/ui-react';

const CSS = css({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  height: '100%',
  position: 'relative',

  '& > .header': {
    backgroundColor: Colors.SECTION_HEADER_BACKGROUND_DARK,
    color: Colors.SECTION_HEADER_FOREGROUND_DARK,
    lineHeight: '36px',
    minHeight: '36px',
    textTransform: 'uppercase',
    paddingLeft: '16px',
    display: 'flex',
    whiteSpace: 'nowrap',

    '& > .accessories': {
      margin: '0 0 0 auto',
      height: '100%',
      width: 'auto',
      display: 'flex',
      alignItems: 'center',

      '& > button': {
        backgroundColor: 'transparent',
        color: Colors.SECTION_HEADER_FOREGROUND_DARK,
        border: 0,
        cursor: 'pointer',
        whiteSpace: 'nowrap'
      }
    }
  },

  '& > .body': {
    backgroundColor: Colors.PANEL_BACKGROUND_DARK,
    color: Colors.PANEL_FOREGROUND_DARK,
    flex: 1,
    overflow: 'auto',
    padding: 0,
  }
});

interface PanelProps {
  children?: any;
  title?: string;
}

export default class Panel extends React.Component<PanelProps, {}> {
  constructor(props: PanelProps, context: {}) {
    super(props, context);
  }

  render() {
    return (
      <div { ...CSS }>
        <div className="header">
          { this.props.title }
          <div className="accessories">
            { filterChildren(this.props.children, child => hmrSafeNameComparison(child.type, PanelControls)) }
          </div>
        </div>
        <div className="body">
          { filterChildren(this.props.children, child => hmrSafeNameComparison(child.type, PanelContent)) }
        </div>
      </div>
    );
  }
}

export const PanelControls = props => props.children;
export const PanelContent = props => props.children;
