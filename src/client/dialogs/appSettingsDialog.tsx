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
import * as ReactDOM from 'react-dom';
import { remote } from 'electron';
import { getSettings, Settings, addSettingsListener } from '../settings';
import { AddressBarActions, ServerSettingsActions } from '../reducers';
import * as path from 'path';
import * as Constants from '../constants';


interface AppSettingsDialogState extends React.Props<AppSettingsDialog> {
    curTab?: string,
    ngrokPath?: string,
}

export class AppSettingsDialog extends React.Component<{}, AppSettingsDialogState> {
    settingsUnsubscribe: any;
    ngrokPathInputRef: any;
    stateSizeLimitInputRef: any;
    bypassNgrokLocalhostInputRef: any;
    use10TokensInputRef: any;
    showing: boolean;
    firstFocusRef: any;
    lastFocusRef: any;
    prevShow: boolean;

    constructor(props) {
        super(props);
        let serverSettings = getSettings().serverSettings;
        let ngrokPath = (serverSettings.framework && serverSettings.framework.ngrokPath) ?
            serverSettings.framework.ngrokPath : null;

        this.state = {
            curTab: "service",
            ngrokPath: ngrokPath,
        };
    }

    pageClicked = (ev: Event) => {
        if (ev.defaultPrevented)
            return;
        let target = ev.srcElement;
        while (target) {
            if (target.className.toString().includes("appsettings")) {
                return;
            }
            target = target.parentElement;
        }

        // Click was outside the dialog. Close.
        this.onClose();
    }

    onAccept = () => {
        ServerSettingsActions.remote_setFrameworkServerSettings({
            ngrokPath: this.ngrokPathInputRef.value,
            bypassNgrokLocalhost: this.bypassNgrokLocalhostInputRef.checked,
            stateSizeLimit: this.stateSizeLimitInputRef.value,
            use10Tokens: this.use10TokensInputRef.checked
        });
        AddressBarActions.hideAppSettings();
    }

    onClose = () => {
        AddressBarActions.hideAppSettings();
    }

    browseForNgrokPath = () => {
        const dir = path.dirname(this.ngrokPathInputRef.value);
        remote.dialog.showOpenDialog(
            remote.getCurrentWindow(), {
            title: 'Browse for ngrok',
            defaultPath: dir,
            properties: ['openFile']
        }, (filenames: string[]) => {
            if (filenames && filenames.length) {
                // TODO: validate selection
                this.ngrokPathInputRef.value = filenames[0];
                this.setState({ ngrokPath: filenames[0] });
            }
        })
    }

    componentWillMount() {
        window.addEventListener('click', this.pageClicked);
        this.settingsUnsubscribe = addSettingsListener((settings: Settings) => {
            if (settings.addressBar.showAppSettings != this.showing) {
                this.showing = settings.addressBar.showAppSettings;
                this.forceUpdate();
            }
        });
    }

    componentDidMount() {
        this.prevShow = this.shouldShow();
        this.prevShow && this.focusFirstNaturalElement();
    }

    componentWillUnmount() {
        window.removeEventListener('click', this.pageClicked);
        this.settingsUnsubscribe();
    }

    private onKeyUpEnterNav(event, name) {
        if (event.key === 'Enter') {
            this.setState({curTab: name});
        }
    }

    private renderNavItem(name: string, contents: string): JSX.Element {
        let classStr = "emu-navitem";
        classStr += this.state.curTab === name ? " emu-navitem-selected" : "";
        return <li>
            <a  tabIndex={0}
                id={name + "-nav"}
                className={classStr}
                onClick={() => this.setState({curTab: name})}
                onKeyUp={(event) => this.onKeyUpEnterNav(event, name)}
                >
                {contents}
            </a>
        </li>
    }

    private renderNavTab(name: string, contents: JSX.Element) {
        let classStr = "emu-tab ";
        classStr += this.state.curTab === name ? "emu-visible" : "emu-hidden";
        return (<div className={classStr}>
            {contents}
        </div>)
    }

    private handleFocusTrap(ref) {
        const element = ReactDOM.findDOMNode(ref) as HTMLElement;

        element && element.focus();
    }

    private shouldShow() {
        return !!getSettings().addressBar.showAppSettings;
    }

    componentDidUpdate(prevProps) {
        const show = this.shouldShow();

        if (!this.prevShow && show) {
            this.focusFirstNaturalElement();
        }

        this.prevShow = show;
    }

    private focusFirstNaturalElement() {
        const ngrokPathInputDOM = ReactDOM.findDOMNode(this.ngrokPathInputRef) as HTMLElement;

        ngrokPathInputDOM && ngrokPathInputDOM.focus();
    }

    render() {
        if (!this.shouldShow()) { return null; }

        const serverSettings = getSettings().serverSettings;

        return (
            <div>
                <div className="dialog-background">
                </div>
                <div className="emu-dialog appsettings-dialog">
                    <div tabIndex={0} onFocus={() => this.handleFocusTrap(this.lastFocusRef)} />
                    <h2 className="dialog-header">App Settings</h2>
                    <button id="AppSettings-top" className="dialog-closex" onClick={() => this.onClose()} dangerouslySetInnerHTML={{ __html: Constants.clearCloseIcon("", 24) }} ref={ref => this.firstFocusRef = ref} />
                    <div className="appsettings-lowerpane">
                        <ul className="emu-navbar">
                            {this.renderNavItem("service", "Service")}
                            {this.renderNavItem("state", "Bot State")}
                        </ul>
                        <hr className='enu-navhdr' />
                        {this.renderNavTab("service", (<div>
                            <div className='emu-dialog-text'>
                                <a title='https://ngrok.com' href='https://ngrok.com'>ngrok</a> is network tunneling software.
                                The Bot Framework Emulator works with ngrok to communicate with bots hosted remotely.
                                Read the <a title='https://github.com/Microsoft/BotFramework-Emulator/wiki/Tunneling-(ngrok)' href='https://aka.ms/szvi68'>wiki page</a> to learn more about using ngrok and to download it.
                            </div>
                            <div className="input-group">
                                <label className="form-label">
                                    Path to ngrok:
                                </label>
                                <input
                                    type="text"
                                    name="ngrokPath"
                                    ref={ref => this.ngrokPathInputRef = ref}
                                    className="form-input appsettings-path-input appsettings-ngrokpath-input"
                                    defaultValue={`${serverSettings.framework.ngrokPath || ''}`}
                                    onChange={(elem) => this.setState({ ngrokPath: elem.currentTarget.value })} />
                                <button className='appsettings-browsebtn' onClick={() => this.browseForNgrokPath()}>Browse...</button>
                            </div>
                            <div className="input-group appsettings-checkbox-group">
                                <label className="form-label clickable">
                                    <input
                                        type="checkbox"
                                        name="bypassNgrokLocalhost"
                                        ref={ref => this.bypassNgrokLocalhostInputRef = ref}
                                        className="form-input"
                                        defaultChecked={ serverSettings.framework.bypassNgrokLocalhost }
                                        disabled={!(this.state.ngrokPath !== null ? this.state.ngrokPath : serverSettings.framework.ngrokPath)} />
                                    Bypass ngrok for local addresses
                                </label>
                            </div>
                            <div className="input-group appsettings-checkbox-group">
                                <label className="form-label clickable">
                                    <input
                                        type="checkbox"
                                        name="use10Tokens"
                                        ref={ref => this.use10TokensInputRef = ref}
                                        className="form-input"
                                        defaultChecked={ serverSettings.framework.use10Tokens } />
                                    Use version 1.0 authentication tokens
                                </label>
                            </div>
                        </div>) )}
                        {this.renderNavTab("state", (<div>
                            <div className='emu-dialog-text'>
                                Bots use the <a href="https://aka.ms/sw9dcl">Bot State service</a> to store and retrieve application data. The Bot Framework's bot state service has a size limit of 64KB. Custom state services may differ.
                            </div>
                            <div className="input-group">
                                <label className="form-label">
                                    Size limit (zero for no limit):
                                </label>
                                <input
                                    type="number"
                                    name="stateStorage"
                                    ref={ref => this.stateSizeLimitInputRef = ref}
                                    className="form-input appsettings-number-input appsettings-space-input"
                                    min={0}
                                    max={4000000}
                                    defaultValue={String(serverSettings.framework.stateSizeLimit) || '64'} /> KB
                            </div>
                        </div>) )}
                    </div>
                    <div className="dialog-buttons">
                        <button type="button" className="appsettings-savebtn" onClick={() => this.onAccept()}>Save</button>
                        &nbsp;&nbsp;&nbsp;
                        <button type="button" className="appsettings-cancelbtn" onClick={() => this.onClose()} ref={ref => this.lastFocusRef = ref}>
                            Cancel
                        </button>
                        <div tabIndex={0} onFocus={() => this.handleFocusTrap(this.firstFocusRef)} />
                    </div>
                    {/* <!-- end focus trap --> */}
                </div>
            </div>
        );
    }
}
