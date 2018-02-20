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

import { connect } from 'react-redux';
import { css } from 'glamor';
import * as PropTypes from 'prop-types';
import * as React from 'react';

import * as Colors from '../../../../ui/styles/colors';
import * as Fonts from '../../../../ui/styles/fonts';

const CSS = css({
  height: '100%',
  overflow: 'auto',
  userSelect: 'initial',
  padding: '0 16px 0 16px',

  '& > .entry': {
    fontFamily: Fonts.FONT_FAMILY_MONOSPACE,

    '& > .source': {
      color: Colors.LOG_PANEL_SOURCE_DARK,
    },

    // info
    '& > .level-0': {
      color: Colors.LOG_PANEL_INFO_DARK,
    },
    // trace
    '& > .level-1': {
      color: Colors.LOG_PANEL_INFO_DARK,
    },
    // warn
    '& > .level-2': {
      color: Colors.LOG_PANEL_INFO_DARK,
    },
    // error
    '& > .level-3': {
      color: Colors.LOG_PANEL_INFO_DARK,
    },
  },
});

export default class Log extends React.Component {
  render() {
    let key = 0;
    return (
      <div className={CSS}>
        {
          this.props.document.log.entries.map(entry =>
            <LogEntry key={`entry-${key++}`} entry={entry} />
          )
        }
      </div>
    );
  }
}

Log.propTypes = {
  document: PropTypes.object.isRequired
};

class LogEntry extends React.Component {
  render() {
    let key = 0;
    return (
      <div className="entry">
        <span className="source">
          {`[${this.props.entry.source}]`}
        </span>
        <span>&nbsp;</span>
        <span className={`level-${this.props.entry.level}`}>
        {this.props.entry.messages.map(message =>
          this.renderMessage(message, key++)
        )}
        </span>
      </div>
    );
  }

  renderMessage(message, key) {
    if (Array.isArray(message)) {
      return <span key={key}>array?</span>;
    } else if (typeof message === 'object') {
      if (message.type) {
        return <span key={key}>{message.type}</span>
      }
      return <span key={key}>Unknown log entry type</span>
    } else if (typeof message === 'string' || typeof message === 'number') {
      return <span key={key}>{message}</span>;
    }
  }
}

LogEntry.propTypes = {
  entry: PropTypes.object.isRequired
}
