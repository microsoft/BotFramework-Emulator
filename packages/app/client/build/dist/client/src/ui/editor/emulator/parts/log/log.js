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
import { LogLevel } from '@bfemulator/app-shared';
import { CommandServiceImpl } from '../../../../../platform/commands/commandServiceImpl';
function number2(n) {
    return ('0' + n).slice(-2);
}
function timestamp(t) {
    let timestamp1 = new Date(t);
    let hours = number2(timestamp1.getHours());
    let minutes = number2(timestamp1.getMinutes());
    let seconds = number2(timestamp1.getSeconds());
    return `${hours}:${minutes}:${seconds}`;
}
function logLevelToClassName(level) {
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
export default class Log extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            count: 0
        };
    }
    componentDidUpdate() {
        if (this.props.document.log.entries.length !== this.state.count) {
            this.scrollMe.scrollTop = this.scrollMe.scrollHeight;
            this.setState({
                count: this.props.document.log.entries.length
            });
        }
    }
    render() {
        let key = 0;
        return (React.createElement("div", { className: styles.log, ref: ref => this.scrollMe = ref }, this.props.document.log.entries.map(entry => React.createElement(LogEntryComponent, { key: `entry-${key++}`, entry: entry, document: this.props.document }))));
    }
}
class LogEntryComponent extends React.Component {
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
        return (React.createElement("div", { key: "entry", className: styles.entry },
            this.renderTimestamp(this.props.entry.timestamp),
            this.props.entry.items.map((item, key) => this.renderItem(item, '' + key))));
    }
    renderTimestamp(t) {
        return (React.createElement("span", { key: "timestamp", className: styles.spaced },
            "[",
            React.createElement("span", { className: styles.timestamp }, timestamp(t)),
            "]"));
    }
    renderItem(item, key) {
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
    renderTextItem(level, text, key) {
        return (React.createElement("span", { key: key, className: `${styles.spaced} ${logLevelToClassName(level)}` }, text));
    }
    renderExternalLinkItem(text, hyperlink, key) {
        return (React.createElement("span", { key: key, className: styles.spaced },
            React.createElement("a", { onClick: () => window.open(hyperlink, '_blank') }, text)));
    }
    renderAppSettingsItem(text, key) {
        return (React.createElement("span", { key: key, className: styles.spaced },
            React.createElement("a", { onClick: () => CommandServiceImpl.call('shell:show-app-settings') }, text)));
    }
    renderExceptionItem(err, key) {
        return (React.createElement("span", { key: key, className: `${styles.spaced} ${styles.level3}` }, err && err.message ? err.message : ''));
    }
    renderInspectableItem(obj, key) {
        let title = 'inspect';
        if (typeof obj.type === 'string') {
            title = obj.type;
        }
        let summaryText = this.summaryText(obj) || '';
        return (React.createElement("span", { key: key },
            React.createElement("span", { className: `${styles.spaced} ${styles.level0}` },
                React.createElement("a", { onClick: () => this.inspectAndHighlight(obj) }, title)),
            React.createElement("span", { className: `${styles.spaced} ${styles.level0}` }, summaryText)));
    }
    renderNetworkRequestItem(_facility, body, _headers, method, _url, key) {
        let obj;
        if (typeof body === 'string') {
            try {
                obj = JSON.parse(body);
            }
            catch (e) {
                obj = body;
            }
        }
        else {
            obj = body;
        }
        if (obj) {
            return (React.createElement("span", { key: key, className: `${styles.spaced} ${styles.level0}` },
                React.createElement("a", { onClick: () => this.inspect(obj) }, method)));
        }
        else {
            return (React.createElement("span", { key: key, className: `${styles.spaced} ${styles.level0}` }, method));
        }
    }
    renderNetworkResponseItem(body, _headers, statusCode, _statusMessage, _srcUrl, key) {
        let obj;
        if (typeof body === 'string') {
            try {
                obj = JSON.parse(body);
            }
            catch (e) {
                obj = body;
            }
        }
        else {
            obj = body;
        }
        if (obj) {
            return (React.createElement("span", { key: key, className: `${styles.spaced} ${styles.level0}` },
                React.createElement("a", { onClick: () => this.inspect(obj) }, statusCode)));
        }
        else {
            return (React.createElement("span", { key: key, className: `${styles.spaced} ${styles.level0}` }, statusCode));
        }
    }
    summaryText(obj) {
        const inspResult = ExtensionManager.inspectorForObject(obj, true);
        if (inspResult && inspResult.inspector) {
            return InspectorAPI.summaryText(inspResult.inspector, obj);
        }
        else {
            return undefined;
        }
    }
}
//# sourceMappingURL=log.js.map