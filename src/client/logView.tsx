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

import * as Electron from 'electron';
import * as React from 'react';
import { Reducer, Unsubscribe } from 'redux';
import { Subscription, Observable, Subject } from '@reactivex/rxjs';
import { getSettings, addSettingsListener } from './settings';
import { LogActions } from './reducers';
import * as Constants from './constants';

const { remote } = require('electron');
const { Menu, MenuItem } = remote;


export enum Severity {
    log,
    info,
    trace,
    debug,
    warn,
    error
}

interface ILogEntry {
    severity: Severity,
    timestamp: Date,
    message: any,
    args: any
}

const safeStringify = (o: any, space: string | number = undefined): string => {
    let cache = [];
    if (typeof o !== 'object')
        return `${o}`;
    return JSON.stringify(o, function (key, value) {
        if (typeof value === 'object' && value !== null) {
            if (cache.indexOf(value) !== -1) {
                return;
            }
            cache.push(value);
        }
        return value;
    }, space);
}

const number2 = (n: number): string => {
    return ('0' + n).slice(-2);
}

const timestamp = (entry: ILogEntry) => {
    const hours = number2(entry.timestamp.getHours());
    const minutes = number2(entry.timestamp.getMinutes());
    const seconds = number2(entry.timestamp.getSeconds());
    return <div className='wc-logview-timestamp'>{`[${hours}:${minutes}:${seconds}]`}&nbsp;</div>
}

const emit = (val: any, className: string) => {
    if (!val) return null;
    if (val.hasOwnProperty('messageType') && val['messageType'] === 'link') {
        //return <div className={className}><a className={className} title={val.title} href={val.link}>{val.text}</a>&nbsp;</div>
        return <div className={className}><a title={val.title} href={val.link}>{val.text}</a>&nbsp;</div>
    } else {
        return <div className={className}>{safeStringify(val)}&nbsp;</div>
    }
}

const message = (entry: ILogEntry, className: string) => {
    return emit(entry.message, className);
}

const args = (entry: ILogEntry, className: string) => {
    if (entry.args && entry.args.length) {
        return entry.args
            .filter(arg => !!arg)
            .map((arg, i) => emit(arg, className));
    }
    return null;
}

const format = (entry: ILogEntry, index: number, items: any[]) => {
    const className = 'wc-logview-' + Severity[entry.severity];
    return (
        <div className='emu-log-entry'>
            {timestamp(entry)}
            {message(entry, className)}
            {args(entry, className)}
        </div>
    );
}


export interface ILogViewState {
    entries: ILogEntry[]
}

export class LogView extends React.Component<{}, ILogViewState> {
    static log$ = new Subject<ILogEntry>();
    scrollMe: Element;
    autoscrollSubscription: Subscription;
    logSubscription: Subscription;
    settingsUnsubscribe: Unsubscribe;

    constructor() {
        super();
        this.state = { entries: [] };
    }

    componentWillMount() {
        this.settingsUnsubscribe = addSettingsListener(() =>
            this.forceUpdate()
        );
    }

    componentDidMount() {
        this.autoscrollSubscription = Observable
            .fromEvent<any>(this.scrollMe, 'scroll')
            .map(e => e.target.scrollTop + e.target.offsetHeight >= e.target.scrollHeight)
            .distinctUntilChanged()
            .subscribe(autoscroll => LogActions.setAutoscroll(autoscroll));
        this.logSubscription = LogView.log$.subscribe(
            entry => {
                // Yep we have to set this.state here because otherwise we lose entries due to batching.
                if (entry) {
                    this.state = { entries: [...this.state.entries, entry] };
                } else {
                    this.state = { entries: [] };
                }
                this.setState(this.state);
            }
        );
    }

    componentWillUnmount() {
        this.autoscrollSubscription.unsubscribe();
        this.logSubscription.unsubscribe();
        this.settingsUnsubscribe();
    }

    componentDidUpdate(prevProps: {}, prevState: ILogViewState) {
        if (getSettings().log.autoscroll)
            this.scrollMe.scrollTop = this.scrollMe.scrollHeight;
    }

    render() {
        return (
            <div>
                <div className="emu-panel-header">
                    <span className="logview-header-text">Log</span>
                    <a className='undecorated-text' href='javascript:void(0)' title='Clear log'>
                        <div className='logview-clear-output-button' dangerouslySetInnerHTML={{__html: Constants.hamburgerIcon('toolbar-button-dark', 24) }} onClick={() => this.showMenu()} />
                    </a>
                </div>
                <div className="wc-logview" ref={ref => this.scrollMe = ref}>
                    {this.state.entries.map((entry, i, items) => format(entry, i, items))}
                </div>
            </div>
        );
    }

    showMenu() {
        const template: Electron.MenuItemOptions[] = [
            {
                label: 'Clear log',
                click: () => LogActions.clear()
            }
        ];
        const menu = Menu.buildFromTemplate(template);
        menu.popup();
    }

    public static add(severity: Severity, message: any, ...args: any[]) {
        let entry: ILogEntry = {
            severity,
            timestamp: new Date(),
            message,
            args
        };
        this.log$.next(entry);
        console[Severity[severity]](message, ...args);
    }

    public static clear() {
        this.log$.next(null);
    }
}
