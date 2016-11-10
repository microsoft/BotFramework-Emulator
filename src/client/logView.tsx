import * as Electron from 'electron';
import * as React from 'react';
import { Reducer, Unsubscribe } from 'redux';
import { Subscription, Observable, Subject } from '@reactivex/rxjs';
import { getSettings, addSettingsListener } from './settings';
import { LogActions } from './reducers';


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
    return <td className='wc-logview-timestamp'>{`[${hours}:${minutes}:${seconds}]`}</td>
}

const emit = (val: any, className: string, colspan?: number) => {
    if (!colspan)
        colspan = 1;

    if (!val) return null;
    if (val.hasOwnProperty('messageType') && val['messageType'] === 'link') {
        return <td className={className} colSpan={colspan}><a className='wc-logview-link' href={val.link}>{val.text}</a></td>
    } else {
        return <td className={className} colSpan={colspan}>{safeStringify(val)}</td>
    }
}

const message = (entry: ILogEntry, className: string) => {
    return emit(entry.message, className, 5 - entry.args.length);
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
    return (
        <tr className='emu-log-entry'>
            {timestamp(entry)}
            {message(entry, 'wc-logview-' + Severity[entry.severity] + ' wc-logview-message')}
            {args(entry, 'wc-logview-' + Severity[entry.severity])}
        </tr>
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
        Electron.ipcRenderer.send('logStarted');
    }

    componentWillUnmount() {
        this.autoscrollSubscription.unsubscribe();
        this.logSubscription.unsubscribe();
        this.settingsUnsubscribe();
        Electron.ipcRenderer.send('logStopped');
    }

    componentDidUpdate(prevProps: {}, prevState: ILogViewState) {
        if (getSettings().log.autoscroll)
            this.scrollMe.scrollTop = this.scrollMe.scrollHeight;
    }

    render() {
        return (
            <div className="wc-logview" ref={ref => this.scrollMe = ref}>
                <table className="wc-logview-table">
                    {this.state.entries.map((entry, i, items) => format(entry, i, items))}
                </table>
            </div>
        );
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
