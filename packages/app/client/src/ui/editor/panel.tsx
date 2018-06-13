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

import { mergeStyles } from '@uifabric/merge-styles';
import * as React from 'react';

import { filterChildren, hmrSafeNameComparison, ThemeVariables } from '@bfemulator/ui-react';

const css = mergeStyles({
  displayName: 'panel',
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  height: '100%',
  position: 'relative',

  selectors: {
    '& > .header': {
      backgroundColor: `var(${ThemeVariables.neutral13})`,
      color: `var(${ThemeVariables.neutral5})`,
      lineHeight: '36px',
      minHeight: '36px',
      textTransform: 'uppercase',
      paddingLeft: '16px',
      display: 'flex',
      whiteSpace: 'nowrap',
      selectors: {
        '& > .accessories': {
          margin: '0 0 0 auto',
          height: '100%',
          width: 'auto',
          display: 'flex',
          alignItems: 'center',
          selectors: {
            '& > button': {
              backgroundColor: 'transparent',
              color: `var(${ThemeVariables.neutral5})`,
              border: 0,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }
          }
        }
      }
    },

    '& > .body': {
      backgroundColor: `var(${ThemeVariables.neutral15})`,
      color: `var(${ThemeVariables.neutral5})`,
      flex: 1,
      overflow: 'auto',
      padding: 0,
    }
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
      <div className={ css }>
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
