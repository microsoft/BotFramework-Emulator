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

import * as ChatActions from '../../../../data/action/chatActions';
import store from '../../../../data/store';
import { Colors, Fonts } from '@bfemulator/ui-react';
import { ExtensionManager, InspectorAPI } from '../../../../extensions';
import { ILogEntry, ILogItem, LogLevel } from '@bfemulator/app-shared';
import { CommandService } from '../../../../platform/commands/commandService';

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
    // debug
    '& .level-1': {
      color: Colors.LOG_PANEL_DEBUG_DARK,
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

function timestamp(t: number) {
  let timestamp = new Date(t);
  let hours = number2(timestamp.getHours());
  let minutes = number2(timestamp.getMinutes());
  let seconds = number2(timestamp.getSeconds());
  return `${hours}:${minutes}:${seconds}`;
}

function logLevelToClassName(level: LogLevel): string {
  switch (level) {
    case LogLevel.Debug: return "level-1";
    case LogLevel.Info: return "level-0";
    case LogLevel.Warn: return "level-2";
    case LogLevel.Error: return "level-3";
  }
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
  entry: ILogEntry;
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
      <div key="entry" className="entry">
        { this.renderTimestamp(this.props.entry.timestamp) }
        { this.props.entry.items.map(item =>
          this.renderItem(item, key++)
        ) }
      </div>
    );
  }

  renderTimestamp(t: number) {
    return (
      <span key="timestamp" className="spaced">
        [<span className="timestamp">{ timestamp(t) }</span>]
      </span>
    );
  }

  renderItem(item: ILogItem, key) {
    switch (item.type) {
      case "text": {
        const { level, text } = item.payload;
        return this.renderTextItem(level, text, key);
      }
      case "external-link": {
        const { text, hyperlink } = item.payload;
        return this.renderExternalLinkItem(text, hyperlink, key);
      }
      case "open-app-settings": {
        const { text } = item.payload;
        return this.renderAppSettingsItem(text, key);
      }
      case "exception": {
        const { err } = item.payload;
        return this.renderExceptionItem(err, key);
      }
      case "inspectable-object": {
        const { obj } = item.payload;
        return this.renderInspectableItem(obj, key);
      }
      case "network-request": {
        const { facility, body, headers, method, url } = item.payload;
        return this.renderNetworkRequestItem(facility, body, headers, method, url, key);
      }
      case "network-response": {
        const { body, headers, statusCode, statusMessage, srcUrl } = item.payload;
        return this.renderNetworkResponseItem(body, headers, statusCode, statusMessage, srcUrl, key);
      }
      default:
        return false;
    }
  }

  renderTextItem(level: LogLevel, text: string, key) {
    return (
      <span key={ key } className={ `spaced ${logLevelToClassName(level)}` }>
        { text }
      </span>
    );
  }

  renderExternalLinkItem(text: string, hyperlink: string, key) {
    return (
      <span key={ key } className="spaced">
        <a onClick={ () => window.open(hyperlink, "_blank") }>{ text }</a>
      </span>
    )
  }

  renderAppSettingsItem(text: string, key) {
    return (
      <span key={ key } className="spaced">
        <a onClick={ () => CommandService.call('shell:show-app-settings') }>{ text }</a>
      </span>
    )
  }

  renderExceptionItem(err: Error, key) {
    return (
      <span key={ key } className="spaced level-3">
        { err && err.message ? err.message : '' }
      </span>
    );
  }

  renderInspectableItem(obj: any, key) {
    let title = "inspect";
    if (typeof obj.type === 'string')
      title = obj.type;
    let summaryText = this.summaryText(obj) || "";
    return (
      <>
        <span key={ key } className="spaced level-0">
          <a onClick={ () => this.inspectAndHighlight(obj) }>{ title }</a>
        </span>
        <span key={ `${key}-0` } className="spaced level-0">
          { summaryText }
        </span>
      </>
    );
  }

  renderNetworkRequestItem(facility, body, headers, method, url, key) {
    let obj;
    if (typeof body === 'string') {
      try {
        obj = JSON.parse(body);
      } catch (e) {
        obj = body;
      }
    } else {
      obj = body;
    }
    if (obj) {
      return (
        <span key={ key } className="spaced level-0">
          <a onClick={ () => this.inspect(obj) }>{ method }</a>
        </span>
      );
    } else {
      return (
        <span key={ key } className="spaced level-0">
          { method }
        </span>
      );
    }
  }

  renderNetworkResponseItem(body, headers, statusCode, statusMessage, srcUrl, key) {
    let obj;
    if (typeof body === 'string') {
      try {
        obj = JSON.parse(body);
      } catch (e) {
        obj = body;
      }
    } else {
      obj = body;
    }
    if (obj) {
      return (
        <span key={ key } className="spaced level-0">
          <a onClick={ () => this.inspect(obj) }>{ statusCode }</a>
        </span>
      );
    } else {
      return (
        <span key={ key } className="spaced level-0">
          { statusCode }
        </span>
      );
    }
  }

  summaryText(obj: any): string {
    const inspResult = ExtensionManager.inspectorForObject(obj, true);
    if (inspResult && inspResult.inspector) {
      return InspectorAPI.summaryText(inspResult.inspector, obj);
    } else {
      return undefined;
    }
  }
}
