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

import * as ChatActions from '../../../../../data/action/chatActions';
import * as styles from './log.scss';
import store from '../../../../../data/store';
import { ExtensionManager, InspectorAPI } from '../../../../../extensions';
import { LogEntry, LogItem, LogLevel, SharedConstants } from '@bfemulator/app-shared';
import { CommandServiceImpl } from '../../../../../platform/commands/commandServiceImpl';

function number2(n: number) {
  return ('0' + n).slice(-2);
}

function timestamp(t: number) {
  let timestamp1 = new Date(t);
  let hours = number2(timestamp1.getHours());
  let minutes = number2(timestamp1.getMinutes());
  let seconds = number2(timestamp1.getSeconds());
  return `${hours}:${minutes}:${seconds}`;
}

function logLevelToClassName(level: LogLevel): string {
  switch (level) {
    case LogLevel.Debug:
      return styles.level1;
    case LogLevel.Info:
      return styles.level0;
    case LogLevel.Warn:
      return styles.level2;
    case LogLevel.Error:
      return styles.level3;
    default:
      return '';
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

  constructor(props: LogProps, context: LogState) {
    super(props, context);
    this.state = {
      count: 0
    };
  }

  componentDidUpdate(): void {
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
      <div className={ styles.log } ref={ ref => this.scrollMe = ref }>
        {
          this.props.document.log.entries.map(entry =>
            <LogEntryComponent key={ `entry-${key++}` } entry={ entry } document={ this.props.document }/>
          )
        }
      </div>
    );
  }
}

export interface LogEntryProps {
  document: any;
  entry: LogEntry;
}

class LogEntryComponent extends React.Component<LogEntryProps> {

  inspect(obj: {}) {
    this.props.document.selectedActivity$.next({});
    store.dispatch(ChatActions.setInspectorObjects(this.props.document.documentId, obj));
  }

  inspectAndHighlight(obj: any) {
    this.inspect(obj);
    if (obj.id) {
      this.props.document.selectedActivity$.next(obj);
    }
  }

  render() {
    return (
      <div key="entry" className={styles.entry}>
        { this.renderTimestamp(this.props.entry.timestamp) }
        { this.props.entry.items.map((item, key) => this.renderItem(item, '' + key)) }
      </div>
    );
  }

  renderTimestamp(t: number) {
    return (
      <span key="timestamp" className={ styles.spaced }>
        [<span className={ styles.timestamp }>{ timestamp(t) }</span>]
      </span>
    );
  }

  renderItem(item: LogItem, key: string) {
    switch (item.type) {
      case 'text': {
        const { level, text } = item.payload;
        return this.renderTextItem(level, text, key);
      }
      case 'external-link': {
        const { text, hyperlink } = item.payload;
        return this.renderExternalLinkItem(text, hyperlink, key);
      }
      case 'open-app-settings': {
        const { text } = item.payload;
        return this.renderAppSettingsItem(text, key);
      }
      case 'exception': {
        const { err } = item.payload;
        return this.renderExceptionItem(err, key);
      }
      case 'inspectable-object': {
        const { obj } = item.payload;
        return this.renderInspectableItem(obj, key);
      }
      case 'network-request': {
        const { facility, body, headers, method, url } = item.payload;
        return this.renderNetworkRequestItem(facility, body, headers, method, url, key);
      }
      case 'network-response': {
        const { body, headers, statusCode, statusMessage, srcUrl } = item.payload;
        return this.renderNetworkResponseItem(body, headers, statusCode, statusMessage, srcUrl, key);
      }
      default:
        return false;
    }
  }

  renderTextItem(level: LogLevel, text: string, key: string) {
    return (
      <span key={ key } className={ `${styles.spaced} ${logLevelToClassName(level)}` }>
        { text }
      </span>
    );
  }

  renderExternalLinkItem(text: string, hyperlink: string, key: string) {
    return (
      <span key={ key } className={styles.spaced}>
        <a onClick={ () => window.open(hyperlink, '_blank') }>{ text }</a>
      </span>
    );
  }

  renderAppSettingsItem(text: string, key: string) {
    return (
      <span key={ key } className={styles.spaced}>
        <a onClick={ () => CommandServiceImpl.call(SharedConstants.Commands.UI.ShowAppSettings) }>{ text }</a>
      </span>
    );
  }

  renderExceptionItem(err: Error, key: string) {
    return (
      <span key={ key } className={`${styles.spaced} ${styles.level3}`}>
        { err && err.message ? err.message : '' }
      </span>
    );
  }

  renderInspectableItem(obj: any, key: string) {
    let title = 'inspect';
    if (typeof obj.type === 'string') {
      title = obj.type;
    }
    let summaryText = this.summaryText(obj) || '';
    return (
      <span key={ key }>
        <span className={`${styles.spaced} ${styles.level0}`}>
          <a onClick={ () => this.inspectAndHighlight(obj) }>{ title }</a>
        </span>
        <span className={`${styles.spaced} ${styles.level0}`}>
          { summaryText }
        </span>
      </span>
    );
  }

  renderNetworkRequestItem(_facility: any, body: any, _headers: any, method: any, _url: string, key: string) {
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
        <span key={ key } className={`${styles.spaced} ${styles.level0}`}>
          <a onClick={ () => this.inspect(obj) }>{ method }</a>
        </span>
      );
    } else {
      return (
        <span key={ key } className={`${styles.spaced} ${styles.level0}`}>
          { method }
        </span>
      );
    }
  }

  renderNetworkResponseItem(body: any, _headers: any, statusCode: number,
                            _statusMessage: string, _srcUrl: string, key: string) {
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
        <span key={ key } className={`${styles.spaced} ${styles.level0}`}>
          <a onClick={ () => this.inspect(obj) }>{ statusCode }</a>
        </span>
      );
    } else {
      return (
        <span key={ key } className={`${styles.spaced} ${styles.level0}`}>
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
