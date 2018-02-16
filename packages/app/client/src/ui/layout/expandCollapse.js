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
import PropTypes from 'prop-types';
import React from 'react';

import { filterChildren } from '../utils';
import * as Colors from '../styles/colors';

const CSS = css({
  boxShadow: 'inset -4px 0px 8px -4px rgba(0,0,0,0.6)',

  '& > header': {
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
    boxShadow: '0px 2px 2px 0px rgba(0,0,0,0.2)',
    cursor: 'pointer',
    display: 'flex',
    fontSize: '11px',
    fontWeight: 700,
    height: '22px',
    lineHeight: '22px',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',

    '& > .content': {
      flex: 1,
      paddingLeft: '8px',

      '& > .toggle': {
        fontSize: '9px',
        paddingRight: '8px',
      }
    },

    '& > .accessories': {
      margin: '0 0 0 auto',

      '& > button': {
        backgroundColor: 'transparent',
        color: Colors.SECTION_HEADER_FOREGROUND_DARK,
        border: 0,
        cursor: 'pointer',
      }
    }
  },
  '& > .body': {
  }
});

export default class ExpandCollapse extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.handleTitleClick = this.handleTitleClick.bind(this);

    this.state = {
      expanded: props.initialExpanded
    };
  }

  handleTitleClick() {
    this.setState(state => ({ expanded: !state.expanded }));
  }

  render() {
    // TODO: Consider <input type="checkbox"> instead of <div />
    return (
      <div aria-expanded={this.state.expanded} className={CSS}>
        <header>
          <div className="content" onClick={this.handleTitleClick}>
            <span className="toggle"> {this.state.expanded ? '◢' : '▷'}</span>
            {this.props.title}
          </div>
          <div className="accessories">
            {filterChildren(this.props.children, child => child.type === Controls)}
          </div>
        </header>
        <div className="body">
          {
            this.state.expanded &&
            <section>
              {filterChildren(this.props.children, child => child.type === Content)}
            </section>
          }
        </div>
      </div>
    );
  }
}

ExpandCollapse.defaultProps = {
  initialExpanded: false
};

ExpandCollapse.propTypes = {
  initialExpanded: PropTypes.bool
};

export const Controls = props => props.children;
export const Content = props => props.children;
