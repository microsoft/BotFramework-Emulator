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

import {
  ExceptionLogItem,
  ExternalLinkLogItem,
  InspectableObjectLogItem,
  LogEntry as ILogEntry,
  LogItem,
  LogItemType,
  LogLevel,
  LuisEditorDeepLinkLogItem,
  NetworkRequestLogItem,
  NetworkResponseLogItem,
  NgrokExpirationLogItem,
  OpenAppSettingsLogItem,
  TextLogItem,
} from '@bfemulator/sdk-shared';
import * as React from 'react';

import { ExtensionManager, InspectorAPI } from '../../../../../extensions';

import * as styles from './log.scss';

export interface LogEntryProps {
  document: any;
  entry: ILogEntry;
  entryIndex: number;
  currentlyInspectedActivity?: any;
  launchLuisEditor?: () => void;
  setInspectorObjects?: (documentId: string, objs: any) => void;
  setHighlightedObjects?: (documentId: string, objs: any) => void;
  reconnectNgrok?: () => void;
  showAppSettings?: () => void;
  trackEvent?: (name: string, properties?: { [key: string]: any }) => void;
}

export class LogEntry extends React.Component<LogEntryProps> {
  /** Allows <LogEntry />'s to highlight themselves based on their log item children */
  private inspectableObjects: { [id: string]: boolean };

  /** Sends obj to the inspector panel
   * @param obj Can be a conversation activity or network request
   */
  inspect(obj: Record<string, unknown> = {}) {
    this.props.setInspectorObjects(this.props.document.documentId, { ...obj, showInInspector: true });
  }

  highlight(obj: Record<string, unknown> = {}) {
    this.props.setHighlightedObjects(this.props.document.documentId, obj);
  }

  /** Sends obj to the inspector panel and highlights the activity in Webchat
   *  (triggered by click in log)
   * @param obj Conversation activity to be highlighted in the WebChat control
   */
  inspectAndHighlightInWebchat(obj: any) {
    this.inspect(obj);
    this.props.trackEvent('log_inspectActivity', { type: obj.type || '' });
  }

  render() {
    // reset the inspectable objects lookup
    this.inspectableObjects = {};

    // render the timestamp and any items to be displayed within the entry;
    // any rendered inspectable items will add themselves to this.inspectableObjects
    const innerJsx = (
      <>
        <span className={styles.srOnly}>Log entry {this.props.entryIndex} </span>
        {this.renderTimestamp(this.props.entry.timestamp)}
        {this.props.entry.items.map((item, key) => this.renderItem(item, '' + key))}
      </>
    );

    // if the currently inspected activity matches any of this item's inner inspectable
    // objects, append an 'inspected' class name to the log entry to highlight it
    const currentlyInspectedActivity = this.props.currentlyInspectedActivity || {};
    let inspectedActivityClass = '';
    const targetId = currentlyInspectedActivity.id;
    if (this.inspectableObjects[targetId]) {
      inspectedActivityClass = styles.inspected;
    }

    return (
      <div key="entry" className={[styles.entry, inspectedActivityClass].join(' ')}>
        {innerJsx}
      </div>
    );
  }

  renderTimestamp(t: number) {
    return (
      <span key="timestamp" className={'timestamp ' + styles.spaced}>
        [<span className={styles.timestamp}>{timestamp(t)}</span>]
      </span>
    );
  }

  renderItem(item: LogItem, key: string) {
    switch (item.type) {
      case LogItemType.Text: {
        const { level, text } = item.payload as TextLogItem;
        return this.renderTextItem(level, text, key);
      }

      case LogItemType.ExternalLink: {
        const { text, hyperlink } = item.payload as ExternalLinkLogItem;
        return this.renderExternalLinkItem(text, hyperlink, key);
      }

      case LogItemType.OpenAppSettings: {
        const { text } = item.payload as OpenAppSettingsLogItem;
        return this.renderAppSettingsItem(text, key);
      }

      case LogItemType.Exception: {
        const { err } = item.payload as ExceptionLogItem;
        return this.renderExceptionItem(err, key);
      }

      case LogItemType.InspectableObject: {
        const { obj } = item.payload as InspectableObjectLogItem;
        return this.renderInspectableItem(obj, key);
      }

      case LogItemType.NetworkRequest: {
        const { facility, body, headers, method, url } = item.payload as NetworkRequestLogItem;
        return this.renderNetworkRequestItem(facility, body, headers, method, url, key);
      }

      case LogItemType.LuisEditorDeepLink: {
        const { text } = item.payload as LuisEditorDeepLinkLogItem;
        return this.renderLuisEditorDeepLinkItem(text, key);
      }

      case LogItemType.NetworkResponse: {
        const { body, headers, statusCode, statusMessage, srcUrl } = item.payload as NetworkResponseLogItem;
        return this.renderNetworkResponseItem(body, headers, statusCode, statusMessage, srcUrl, key);
      }

      case LogItemType.NgrokExpiration: {
        const { text } = item.payload as NgrokExpirationLogItem;
        return this.renderNgrokExpirationItem(text, key);
      }

      default:
        return false;
    }
  }

  renderTextItem(level: LogLevel, text: string, key: string) {
    return (
      <span key={key} className={`text-item ${styles.spaced} ${logLevelToClassName(level)}`}>
        {text}
      </span>
    );
  }

  renderExternalLinkItem(text: string, hyperlink: string, key: string) {
    return (
      <span key={key} className={styles.spaced}>
        <button
          aria-label={`${text}. Log entry ${this.props.entryIndex}`}
          className={styles.link}
          onClick={() => window.open(hyperlink, '_blank')}
        >
          {text}
        </button>
      </span>
    );
  }

  renderAppSettingsItem(text: string, key: string) {
    return (
      <span key={key} className={styles.spaced}>
        <button
          aria-label={`${text}. Log entry ${this.props.entryIndex}`}
          className={styles.link}
          onClick={() => this.props.showAppSettings()}
        >
          {text}
        </button>
      </span>
    );
  }

  renderExceptionItem(err: Error, key: string) {
    return (
      <span role="alert" key={key} className={`${styles.spaced} ${styles.level3}`}>
        {err && err.message ? err.message : ''}
      </span>
    );
  }

  renderInspectableItem(obj: any, key: string) {
    // add self to inspectable object lookup
    if (obj.id) {
      this.inspectableObjects[obj.id] = true;
    }

    let title = 'inspect';
    if (typeof obj.type === 'string') {
      title = obj.type;
    }
    const summaryText = this.summaryText(obj) || '';
    return (
      <span key={key} onMouseOver={() => this.highlight(obj)} onMouseLeave={() => this.highlight({})}>
        <span className={`inspectable-item ${styles.spaced} ${styles.level0}`}>
          <button
            aria-label={`${title}. Log entry ${this.props.entryIndex}`}
            className={styles.link}
            onClick={() => this.inspectAndHighlightInWebchat(obj)}
          >
            {title}
          </button>
        </span>
        <span className={`${styles.spaced} ${styles.level0}`}>{summaryText}</span>
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
        <span key={key} className={`network-req-item ${styles.spaced} ${styles.level0}`}>
          <button
            aria-label={`${method} request. Log entry ${this.props.entryIndex}`}
            className={styles.link}
            onClick={() => this.inspect(obj)}
          >
            {method}
          </button>
        </span>
      );
    } else {
      return (
        <span key={key} className={`network-req-item ${styles.spaced} ${styles.level0}`}>
          {method}
        </span>
      );
    }
  }

  renderNetworkResponseItem(
    body: any,
    _headers: any,
    statusCode: number,
    _statusMessage: string,
    _srcUrl: string,
    key: string
  ) {
    let obj;
    if (typeof body === 'string') {
      try {
        obj = JSON.parse(body);
        // html responses come over as doubly stringified e.g.: ""<some html>"" and
        // calling JSON.parse will turn them into a standard string;
        // we want to assign the html to a property so that the string isn't expanded
        // out into a giant object with one key per character
        if (typeof obj === 'string') {
          obj = { value: obj };
        }
      } catch (e) {
        obj = body;
      }
    } else {
      obj = body;
    }
    if (obj) {
      return (
        <span key={key} className={`network-res-item ${styles.spaced} ${styles.level0}`}>
          <button
            aria-label={`${statusCode} response. Log entry ${this.props.entryIndex}`}
            className={styles.link}
            onClick={() => this.inspect(obj)}
          >
            {statusCode}
          </button>
        </span>
      );
    } else {
      return (
        <span key={key} className={`network-res-item ${styles.spaced} ${styles.level0}`}>
          {statusCode}
        </span>
      );
    }
  }

  renderNgrokExpirationItem(text: string, key: string): JSX.Element {
    return (
      <span key={key} className={`${styles.spaced} ${styles.level3}`}>
        {text + ' '}
        <button
          aria-label={`Please recoonect, Ngrok connection expired. Log entry ${this.props.entryIndex}`}
          className={styles.link}
          onClick={() => this.props.reconnectNgrok()}
        >
          Please reconnect.
        </button>
      </span>
    );
  }

  renderLuisEditorDeepLinkItem(text: string, key: string): JSX.Element {
    return (
      <span key={key} className={`text-item ${styles.spaced} ${styles.level3}`}>
        {`${text} Please `}
        <a
          aria-label={`Connect your bot to LUIS. Log entry ${this.props.entryIndex}`}
          className={styles.link}
          onClick={() => this.props.launchLuisEditor()}
        >
          connect your bot to LUIS
        </a>
        {` using the services pane.`}
      </span>
    );
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

export function number2(n: number) {
  return ('0' + n).slice(-2);
}

export function timestamp(t: number) {
  const timestamp1 = new Date(t);
  const hours = number2(timestamp1.getHours());
  const minutes = number2(timestamp1.getMinutes());
  const seconds = number2(timestamp1.getSeconds());
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
