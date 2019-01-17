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

import * as styles from './log.scss';
import * as React from 'react';
import { ExtensionManager, InspectorAPI } from '../../../../../extensions';
import LogEntryModel from '@bfemulator/emulator-core/lib/types/log/entry';
import { ILogItem } from '@bfemulator/emulator-core/lib/types/log/item';
import LogLevel from '@bfemulator/emulator-core/lib/types/log/level';

/** One of these will always be "nexted" to the selectedActivity$
 *  subscription when called from within the log
 */
export interface ActivitySelectionFromLog {
  /** Differentiates between just hovering an activity or clicking to inspect */
  clicked: boolean;
}

export interface LogEntryProps {
  document: any;
  entry: LogEntryModel;
  selectedActivity?: any;
  currentlyInspectedActivity?: any;
  setInspectorObjects?: (...args: any[]) => void;
  reconnectNgrok?: () => void;
  showAppSettings?: () => void;
}

export class LogEntry extends React.Component<LogEntryProps> {
  /** Allows <LogEntry />'s to highlight themselves based on their log item children */
  private inspectableObjects: { [id: string]: boolean };

  /** Sends obj to the inspector panel
   * @param obj Can be a conversation activity or network request
   */
  inspect(obj: {}) {
    this.props.document.selectedActivity$.next({ showInInspector: true });
    this.props.setInspectorObjects(this.props.document.documentId, obj);
  }

  /** Sends obj to the inspector panel and highlights the activity in Webchat
   *  (triggered by click in log)
   * @param obj Conversation activity to be highlighted in the WebChat control
   */
  inspectAndHighlightInWebchat(obj: any) {
    this.inspect(obj);
    if (obj.id) {
      this.props.document.selectedActivity$.next({ ...obj, showInInspector: true });
    }
  }

  /** Highlights an activity in webchat (triggered by hover in log) */
  highlightInWebchat(obj: any) {
    if (obj.id) {
      this.props.document.selectedActivity$.next({ ...obj, showInInspector: false });
    }
  }

  /** Removes an activity's highlighting in webchat */
  removeHighlightInWebchat(obj: any) {
    if (obj.id) {
      // re-highlight last-inspected activity if possible
      const { currentlyInspectedActivity } = this.props;
      if (currentlyInspectedActivity && currentlyInspectedActivity.id) {
        this.props.document.selectedActivity$.next({
          ...currentlyInspectedActivity,
          showInInspector: true
        });
      } else {
        this.props.document.selectedActivity$.next({ showInInspector: false });
      }
    }
  }

  render() {
    // reset the inspectable objects lookup
    this.inspectableObjects = {};

    // render the timestamp and any items to be displayed within the entry;
    // any rendered inspectable items will add themselves to this.inspectableObjects
    const innerJsx = (
      <>
        { this.renderTimestamp(this.props.entry.timestamp) }
        { this.props.entry.items.map((item, key) => this.renderItem(item, '' + key)) }
      </>
    );

    // if the currently inspected activity matches any of this item's inner inspectable
    // objects, append an 'inspected' class name to the log entry to highlight it
    const { currentlyInspectedActivity } = this.props;
    let inspectedActivityClass = '';
    if (currentlyInspectedActivity && currentlyInspectedActivity.id) {
      if (this.inspectableObjects[currentlyInspectedActivity.id]) {
        inspectedActivityClass = styles.inspected;
      }
    }

    return (
      <div key="entry" className={ [styles.entry, inspectedActivityClass].join(' ') } >
        { innerJsx }
      </div>
    );
  }

  renderTimestamp(t: number) {
    return (
      <span key="timestamp" className={ 'timestamp ' + styles.spaced }>
        [<span className={ styles.timestamp }>{ timestamp(t) }</span>]
      </span>
    );
  }

  renderItem(item: ILogItem, key: string) {
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
      case 'ngrok-expiration': {
        const { text } = item.payload;
        return this.renderNgrokExpirationItem(text, key);
      }
      default:
        return false;
    }
  }

  renderTextItem(level: LogLevel, text: string, key: string) {
    return (
      <span key={ key } className={ `text-item ${ styles.spaced } ${ logLevelToClassName(level) }` }>
        { text }
      </span>
    );
  }

  renderExternalLinkItem(text: string, hyperlink: string, key: string) {
    return (
      <span key={ key } className={ styles.spaced }>
        <button className={ styles.link } onClick={ () => window.open(hyperlink, '_blank') }>
          { text }
        </button>
      </span>
    );
  }

  renderAppSettingsItem(text: string, key: string) {
    return (
      <span key={ key } className={ styles.spaced }>
        <button className={ styles.link } onClick={ () => this.props.showAppSettings() }>
          { text }
        </button>
      </span>
    );
  }

  renderExceptionItem(err: Error, key: string) {
    return (
      <span key={ key } className={ `${ styles.spaced } ${ styles.level3 }` }>
        { err && err.message ? err.message : '' }
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
    let summaryText = this.summaryText(obj) || '';
    return (
      <span key={ key }
        onMouseOver={ () => this.highlightInWebchat(obj) }
        onMouseLeave={ () => this.removeHighlightInWebchat(obj) }>
        <span className={ `${ styles.spaced } ${ styles.level0 }` }>
          <button className={ styles.link } onClick={ () => this.inspectAndHighlightInWebchat(obj) } >
            { title }
          </button>
        </span>
        <span className={ `${ styles.spaced } ${ styles.level0 }` }>
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
        <span key={ key } className={ `${ styles.spaced } ${ styles.level0 }` }>
          <button className={ styles.link } onClick={ () => this.inspect(obj) }>
            { method }
          </button>
        </span>
      );
    } else {
      return (
        <span key={ key } className={ `${ styles.spaced } ${ styles.level0 }` }>
          { method }
        </span>
      );
    }
  }

  renderNetworkResponseItem(
    body: any, _headers: any, statusCode: number,
    _statusMessage: string, _srcUrl: string, key: string
  ) {
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
        <span key={ key } className={ `${ styles.spaced } ${ styles.level0 }` }>
          <button className={ styles.link } onClick={ () => this.inspect(obj) } >
            { statusCode }
          </button>
        </span>
      );
    } else {
      return (
        <span key={ key } className={ `${ styles.spaced } ${ styles.level0 }` }>
          { statusCode }
        </span>
      );
    }
  }

  renderNgrokExpirationItem(text: string, key: string): JSX.Element {
    return (
      <span key={ key } className={ `${ styles.spaced } ${ styles.level3 }` }>
        { text + ' ' }
        <button className={ styles.link } onClick={ () => this.props.reconnectNgrok() }>
          Please reconnect.
        </button>
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
  let timestamp1 = new Date(t);
  let hours = number2(timestamp1.getHours());
  let minutes = number2(timestamp1.getMinutes());
  let seconds = number2(timestamp1.getSeconds());
  return `${ hours }:${ minutes }:${ seconds }`;
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
