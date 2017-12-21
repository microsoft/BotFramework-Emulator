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
import * as Constants from '../constants';
import { remote } from 'electron';
import { getSettings, Settings, addSettingsListener } from '../settings';
import { AddressBarActions, ServerSettingsActions } from '../reducers';
import * as path from 'path';
import CommonDialog from './commonDialog';
var pjson = require('../../../package.json');


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
    lastFocusRef: any;

    constructor(props) {
        super(props);

        this.handleClose = this.handleClose.bind(this);
        this.handleFocusLast = this.handleFocusLast.bind(this);
        this.handleFocusNatural = this.handleFocusNatural.bind(this);

        let serverSettings = getSettings().serverSettings;
        let ngrokPath = (serverSettings.framework && serverSettings.framework.ngrokPath) ?
            serverSettings.framework.ngrokPath : null;

        this.state = {
            curTab: "service",
            ngrokPath: ngrokPath,
        };
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

    handleClose = () => {
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
        this.settingsUnsubscribe = addSettingsListener((settings: Settings) => {
            if (settings.addressBar.showAppSettings != this.showing) {
                this.showing = settings.addressBar.showAppSettings;
                this.forceUpdate();
            }
        });
    }

    componentWillUnmount() {
        this.settingsUnsubscribe();
    }

    handleKeyUp(event, name) {
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
                onKeyUp={(event) => this.handleKeyUp(event, name)}
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

    handleFocusLast() {
        const element = ReactDOM.findDOMNode(this.lastFocusRef) as HTMLElement;

        element && element.focus();
    }

    handleFocusNatural() {
        const ngrokPathInputDOM = ReactDOM.findDOMNode(this.ngrokPathInputRef) as HTMLElement;

        ngrokPathInputDOM && ngrokPathInputDOM.focus();
    }

    render() {
        const serverSettings = getSettings().serverSettings;

        if (!serverSettings.framework || !getSettings().addressBar.showAppSettings) {
            return null;
        }

        return (
            <CommonDialog
                className="appsettings-dialog"
                width={ 525 }
                height={ 487 }
                onClose={ this.handleClose }
                onFocusLast={ this.handleFocusLast }
                onFocusNatural={ this.handleFocusNatural }
            >
                <h2 className="dialog-header">Settings</h2>
                <div className="appsettings-lowerpane">
                    <ul className="emu-navbar">
                        {this.renderNavItem("service", "Service")}
                        {this.renderNavItem("state", "Bot State")}
                        {this.renderNavItem("about", "About")}
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
                                className="form-input appsettings-path-nput appsettings-ngrokpath-input"
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
                    {this.renderNavTab("about", (<div>
                        <div className='about-logo' dangerouslySetInnerHTML={{ __html: Constants.botFrameworkIcon('about-logo-fill', 142) }} />
                        <div className="about-name">Bot Framework Emulator</div>
                        <div className="about-link"><a href='https://aka.ms/bf-emulator'>https://aka.ms/bf-emulator</a></div>
                        <div className="about-version">{`v${pjson.version}`}</div>
                        <div className="about-copyright">&copy; 2016 - 2018 Microsoft</div>
                    </div>) )}
                </div>
                <div className="dialog-buttons">
                    <button type="button" className="appsettings-savebtn" onClick={() => this.onAccept()}>Save</button>
                    &nbsp;&nbsp;&nbsp;
                    <button type="button" className="appsettings-cancelbtn" onClick={() => this.handleClose()} ref={ref => this.lastFocusRef = ref}>
                        Cancel
                    </button>
                </div>
            </CommonDialog>
        );
    }
}
