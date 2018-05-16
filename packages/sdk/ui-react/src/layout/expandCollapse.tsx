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
import { Colors } from '../styles';

import { filterChildren, hmrSafeNameComparison } from '../utils';
import { InsetShadow } from '../widget';

const CSS = css({
  display: 'flex',
  flexFlow: 'column nowrap',
  height: '100%',
  overflow: 'hidden',

  '& > header': {
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
    cursor: 'pointer',
    display: 'flex',
    fontSize: '11px',
    fontWeight: 700,
    height: '22px',
    lineHeight: '22px',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    flexShrink: 0,

    '& > .content': {
      display: 'flex',
      alignItems: 'center',
      flex: 1,
      paddingLeft: '8px',

      '& > .toggle': {
        height: '12px',
        width: '12px',
        marginRight: '8px',
        backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Cpath fill='%23e8e8e8' d='M6 4v8l4-4-4-4zm1 2.414L8.586 8 7 9.586V6.414z'/%3E%3C/svg%3E")`,
        backgroundSize: '18px',
        backgroundPosition: '50% 50%',
        backgroundRepeat: 'no-repeat'
      },

      '& > .toggle.toggle-expanded': {
        background: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Cpath fill='%23e8e8e8' d='M11 10.07H5.344L11 4.414v5.656z'/%3E%3C/svg%3E")`
      }
    },

    '& > .accessories': {
      margin: '0 0 0 auto',
      height: '100%',
      width: 'auto',

      '& > button': {
        backgroundColor: 'transparent',
        color: Colors.SECTION_HEADER_FOREGROUND_DARK,
        border: 0,
        cursor: 'pointer',
      }
    }
  },

  '& > .body': {
    height: '100%',
    overflow: 'auto',
    position: 'relative',

    '& > section': {
      height: '100%',
      display: 'flex',
      flexFlow: 'column nowrap'
    }
  }
});

export interface IExpandCollapseProps {
  expanded?: boolean;
  title?: string;
}

export interface IExpandCollapseState {
  expanded: boolean;
}

export class ExpandCollapse extends React.Component<IExpandCollapseProps, IExpandCollapseState> {
  constructor(props, context) {
    super(props, context);
    this.state = { expanded: !!props.expanded };
  }

  private handleTitleClick = () => {
    this.setState(state => ({ expanded: !state.expanded }));
  };

  public componentWillReceiveProps(newProps) {
    if (typeof newProps.expanded != 'undefined') {
      const { expanded } = newProps;
      this.setState({ expanded });
    }
  }

  render() {
    const toggleClassName = this.state.expanded ? ' toggle-expanded': '';
    
    // TODO: Consider <input type="checkbox"> instead of <div />
    return (
      <div aria-expanded={ this.state.expanded } className={ CSS + ' expand-collapse-container' }>
        <header>
          <div className="content" onClick={ this.handleTitleClick }>
            <span className={ 'toggle' + toggleClassName }></span>
            { this.props.title }
          </div>
          <div className="accessories">
            { filterChildren(this.props.children, child => hmrSafeNameComparison(child.type, ExpandCollapseControls)) }
          </div>
        </header>
        <div className="body">
          {
            this.state.expanded &&
            <section>
              { filterChildren(this.props.children, child => hmrSafeNameComparison(child.type, ExpandCollapseContent)) }
              <InsetShadow top={ true } />
            </section>
          }
        </div>
      </div>
    );
  }
}

export const ExpandCollapseControls = props => props.children;
export const ExpandCollapseContent = props => props.children;
