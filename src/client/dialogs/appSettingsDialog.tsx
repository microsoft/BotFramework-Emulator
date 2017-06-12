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
    showing: boolean;

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
            stateSizeLimit: this.stateSizeLimitInputRef.value
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

    componentWillUnmount() {
        window.removeEventListener('click', this.pageClicked);
        this.settingsUnsubscribe();
    }

    private renderNavItem(name: string, contents: string): JSX.Element {
        let classStr = "emu-navitem";
        classStr += this.state.curTab === name ? " emu-navitem-selected" : "";
        return <li>
            <a id={name + "-nav"}
                className={classStr}
                onClick={() => this.setState({curTab: name})}
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

    render() {
        const settings = getSettings();
        if (!settings.addressBar.showAppSettings) return null;
        const serverSettings = getSettings().serverSettings;
        return (
            <div>
                <div className="dialog-background">
                </div>
                <div className="emu-dialog appsettings-dialog">
                    <h2 className="dialog-header">App Settings</h2>
                    <div className="dialog-closex" onClick={() => this.onClose()} dangerouslySetInnerHTML={{ __html: Constants.clearCloseIcon("", 24) }} />
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
                        <button className="appsettings-savebtn" onClick={() => this.onAccept()}>Save</button>
                        &nbsp;&nbsp;&nbsp;
                        <button className="appsettings-cancelbtn" onClick={() => this.onClose()}>Cancel</button>
                    </div>
                </div>
            </div>
        );
    }
}
