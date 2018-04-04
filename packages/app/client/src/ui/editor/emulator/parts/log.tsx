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
import * as PropTypes from 'prop-types';
import * as React from 'react';

import * as ChatActions from '../../../../data/action/chatActions';
import store from '../../../../data/store';
import * as Colors from '../../../styles/colors';
import * as Fonts from '../../../styles/fonts';

const CSS = css({
  height: '100%',
  overflow: 'auto',
  userSelect: 'text',
  padding: '0 16px 0 16px',
  boxSizing: 'border-box',

  '& > .entry': {
    fontFamily: Fonts.FONT_FAMILY_MONOSPACE,

    '& > .source': {
      color: Colors.LOG_PANEL_SOURCE_DARK,
    },

    '& .timestamp': {
      color: Colors.LOG_PANEL_TIMESTAMP_DARK,
    },

    '& .src-dst': {
      color: Colors.LOG_PANEL_SRC_DST_DARK,
    },

    '& a': {
      color: Colors.LOG_PANEL_LINK_DARK,
      textDecoration: 'underline',
      cursor: 'pointer',
    },

    // info
    '& .level-0': {
      color: Colors.LOG_PANEL_INFO_DARK,
    },
    // trace
    '& .level-1': {
      color: Colors.LOG_PANEL_INFO_DARK,
    },
    // warn
    '& .level-2': {
      color: Colors.LOG_PANEL_WARN_DARK,
    },
    // error
    '& .level-3': {
      color: Colors.LOG_PANEL_ERROR_DARK,
    },

    '& .spaced': {
      marginLeft: '8px',
    },

    '& .spaced:first-child': {
      marginLeft: 0
    },
  },
});

function number2(n) {
  return ('0' + n).slice(-2);
}

function timestamp(entry) {
  let timestamp = new Date(entry.timestamp);
  let hours = number2(timestamp.getHours());
  let minutes = number2(timestamp.getMinutes());
  let seconds = number2(timestamp.getSeconds());
  return `${hours}:${minutes}:${seconds}`;
}

export interface LogProps {
  document: any;
}

export interface LogState {
  count: number;
}

export default class Log extends React.Component<LogProps, LogState> {
  scrollMe: Element;

  constructor(props, context) {
    super(props, context);
    this.state = {
      count: 0
    };
  }

  componentDidUpdate(prevProps: LogProps, prevState: any, prevContext: any): void {
    if (this.props.document.log.entries.length !== this.state.count) {
      this.scrollMe.scrollTop = this.scrollMe.scrollHeight;
      this.setState({
        count: this.props.document.log.entries.length
      });
    }
  }

  render() {
    let key = 0;
    return (
      <div { ...CSS } ref={ ref => this.scrollMe = ref }>
        {
          this.props.document.log.entries.map(entry =>
            <LogEntry key={ `entry-${key++}` } entry={ entry } document={ this.props.document } />
          )
        }
      </div>
    );
  }
}

export interface LogEntryProps {
  document: any;
  entry: any;
}

class LogEntry extends React.Component<LogEntryProps> {

  inspect(obj) {
    this.props.document.selectedActivity$.next({});
    store.dispatch(ChatActions.setInspectorObjects(this.props.document.documentId, obj));
  }

  inspectAndHighlight(obj) {
    this.inspect(obj);
    if (obj.id) {
      this.props.document.selectedActivity$.next(obj);
    }
  }

  render() {
    let key = 0;
    return (
      <div className="entry">
        <span className="spaced">
          [<span className="timestamp">{ timestamp(this.props.entry) }</span>]
        </span>
        <span className={ `spaced level-${this.props.entry.level}` }>
          { this.props.entry.messages.map(message =>
            this.renderMessage(message, key++)
          ) }
        </span>
      </div>
    );
  }

  renderResponseMessage(message) {
    return (
      <>
        { message.payload.body
          ?
          <span className="spaced"><a onClick={ () => this.inspect(message) }>{ message.payload.statusCode }</a></span>
          :
          <span className="spaced">{ message.payload.statusCode }</span>
        }
      </>
    );
  }

  messageDirection(payload) {
    if (payload.source) {
      switch (payload.source) {
        case "bot": return "<-";
        case "user": return "->";
        case "service": return "<-";
      }
    } else if (payload.destination) {
      switch (payload.destination) {
        case "bot": return "->";
        case "user": return "<-";
        case "service": return "->";
      }
    }
    return <>&nbsp;&nbsp;</>
  }

  renderMessage(message, key) {
    if (!message) return false;
    if (Array.isArray(message)) {
      return <span className="spaced level-3" key={ key }>ARR?</span>;
    } else if (typeof message === 'object') {
      switch (message.type) {

        case "activity": {
          return (
            <span className="spaced" key={ key }>
              <span className="spaced">{ this.messageDirection(message.payload) }</span>
              <span className="spaced"><a onClick={ () => this.inspectAndHighlight(message.payload.activity) }>Activity</a></span>
              <span className="spaced">{ message.payload.text }</span>
            </span>
          );
        }

        case "request": {
          return (
            <span className="spaced" key={ key }>
              <span className="spaced">{ this.messageDirection(message.payload) }</span>
              <span className="spaced"><a onClick={ () => this.inspect(message) }>{ message.payload.method }</a></span>
            </span>
          );
        }

        case "response": {
          return (
            <span className="spaced" key={ key }>
              <span className="spaced">{ this.messageDirection(message.payload) }</span>
              { this.renderResponseMessage(message) }
              {
                message.payload.statusMessage && message.payload.statusMessage.length
                  ?
                  <span className="spaced">{ message.payload.statusMessage }</span>
                  :
                  false
              }
            </span>
          );
        }

        case "err": {
          return (
            <span className="spaced" key={ key }>
              <span className="spaced"><a onClick={ () => this.inspect(message) }>Error</a></span>
            </span>
          );
        }

        case "inspector": {
          return (
            <span className="spaced" key={ key }><a href='inspector://activity?obj=' title={ message.title }>{ message.text }</a></span>
          );
        }

        case "url:external": {
          return (
            <span className="spaced" key={ key }><a href={ message.url } title={ message.title }>{ message.text }</a></span>
          );
        }

        case "settings:bot": {
          return (
            <span className="spaced" key={ key }>bot settings</span>
          );
        }

        case "settings:app": {
          return (
            <span className="spaced" key={ key }>app settings</span>
          );
        }

        default:
          return <span className="spaced level-3" key={ key }>UNK?</span>
      }
    } else if (typeof message === 'string' || typeof message === 'number') {
      return <span className="spaced" key={ key }>{ message }</span>;
    }
    return false;
  }
}
