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
import { Settings as ServerSettings } from '../../types/serverSettingsTypes';
import { AddressBarActions, ConversationActions, ServerSettingsActions } from '../reducers';
import { IBot, newBot } from '../../types/botTypes';
import * as log from '../log';
import * as path from 'path';
import * as Constants from '../constants';


interface IAppSettings {
    port?: number,
    ngrokPath?: string
}

enum Tabs {
    ServiceUrl,
    NgrokConfig
}

export class AppSettingsDialog extends React.Component<{}, {}> {
    settingsUnsubscribe: any;
    showing: boolean;

    emulatorPortInputRef: any;
    serviceUrlInputRef: any;
    ngrokPathInputRef: any;
    currentTab: Tabs;

    serviceUrlReadOnly: boolean;

    pageClicked = (ev: Event) => {
        if (ev.defaultPrevented)
            return;
        let target = ev.srcElement;
        while (target) {
            if (target.className.toString().includes("appsettings")) {
                // Click was inside the address bar.
                return;
            }
            target = target.parentElement;
        }

        // Click was outside the dialog. Close.
        this.onClose();
    }

    portChanged = () => {
        // Only let decimal digits through
        let val: string = this.emulatorPortInputRef.value;
        val = val.replace(/[^0-9]+/g, '');
        this.emulatorPortInputRef.value = val;
    }

    onAccept = () => {
        ServerSettingsActions.remote_setFrameworkServerSettings({
            port: Number(this.emulatorPortInputRef.value),
            serviceUrl: this.ngrokPathInputRef.value.length ? undefined : this.serviceUrlInputRef.value,
            ngrokPath: this.ngrokPathInputRef.value
        });
        AddressBarActions.hideAppSettings();
    }

    onClose = () => {
        AddressBarActions.hideAppSettings();
    }

    showServiceUrl = () => {
        this.currentTab = Tabs.ServiceUrl;
        this.forceUpdate();
    }

    showNgrokConfig = () => {
        this.currentTab = Tabs.NgrokConfig;
        this.forceUpdate();
    }

    browseForNgrokPath = () => {
        const dir = path.dirname(this.ngrokPathInputRef.value);
        remote.dialog.showOpenDialog({
            title: 'Browse for ngrok',
            defaultPath: dir,
            properties: ['openFile']
        }, (filenames: string[]) => {
            if (filenames && filenames.length) {
                // TODO: validate selection
                this.ngrokPathInputRef.value = filenames[0];
            }
        })
    }

    ngrokPathChanged = () => {
        const serverSettings = getSettings().serverSettings;
        this.serviceUrlReadOnly = (this.ngrokPathInputRef && this.ngrokPathInputRef.value.length) || (!this.ngrokPathInputRef && serverSettings.framework.ngrokPath.length && serverSettings.framework.ngrokRunning);
    }

    componentWillMount() {
        this.currentTab = Tabs.NgrokConfig;
        window.addEventListener('click', this.pageClicked);
        this.settingsUnsubscribe = addSettingsListener((settings: Settings) => {
            if (settings.addressBar.showAppSettings != this.showing) {
                if (settings.serverSettings.framework.ngrokPath.length) {
                    this.currentTab = Tabs.NgrokConfig;
                } else {
                    this.currentTab = Tabs.ServiceUrl;
                }
                this.showing = settings.addressBar.showAppSettings;
                this.forceUpdate();
            }
        });
    }

    componentWillUnmount() {
        window.removeEventListener('click', this.pageClicked);
        this.settingsUnsubscribe();
    }

    render() {
        const settings = getSettings();
        if (!settings.addressBar.showAppSettings) return null;
        const serverSettings = getSettings().serverSettings;
        this.serviceUrlReadOnly = (this.ngrokPathInputRef && this.ngrokPathInputRef.value.length) || (!this.ngrokPathInputRef && serverSettings.framework.ngrokPath.length && serverSettings.framework.ngrokRunning);
        return (
            <div>
                <div className="dialog-background">
                </div>
                <div className="emu-dialog appsettings-dialog">
                    <h2 className="dialog-header">App Settings</h2>
                    <div className="dialog-closex" onClick={() => this.onClose()} dangerouslySetInnerHTML={{ __html: Constants.clearCloseIcon("", 24) }} />
                    <div className="input-group appsettings-port-group">
                        <label className="form-label">
                            Emulator Port:
                        </label>
                        <input
                            type="text"
                            ref={ref => this.emulatorPortInputRef = ref}
                            onChange={() => this.portChanged()}
                            className="form-input appsettings-port"
                            defaultValue={`${serverSettings.framework.port || 9002}`} />
                    </div>
                    <div className="appsettings-lowerpane">
                        <ul className="emu-navbar">
                            <li>
                                <a href="javascript:void(0)"
                                    className={"emu-navitem" + (this.currentTab === Tabs.ServiceUrl ? " emu-navitem-selected" : "")}
                                    onClick={() => this.showServiceUrl()}>
                                    Callback URL
                                </a>
                            </li>
                            <li>
                                <a href="javascript:void(0)"
                                    className={"emu-navitem" + (this.currentTab === Tabs.NgrokConfig ? " emu-navitem-selected" : "")}
                                    onClick={() => this.showNgrokConfig()}>
                                    Using ngrok?
                                </a>
                            </li>
                        </ul>
                        <hr className='enu-navhdr' />
                        <div className={"emu-tab" + (this.currentTab === Tabs.ServiceUrl ? " emu-visible" : " emu-hidden")}>
                            <div className='emu-dialog-text'>The Callback URL is where the bot sends reply messages.</div>
                            <div className={'emu-dialog-text' + (this.serviceUrlReadOnly ? '' : ' emu-hidden')}>Note: ngrok is currently in control of this field. Clear your ngrok path to regain control of it.</div>
                            <div className="input-group">
                                <label className="form-label">
                                    Callback URL:
                                </label>
                                <input
                                    type="text"
                                    ref={ref => this.serviceUrlInputRef = ref}
                                    className={"form-input appsettings-url-input appsettings-serviceurl-input" + (this.serviceUrlReadOnly ? " emu-readonly" : "")}
                                    readOnly={this.serviceUrlReadOnly}
                                    //key={`${Math.random()}`}
                                    defaultValue={`${serverSettings.framework.serviceUrl || ''}`} />
                            </div>
                        </div>
                        <div className={"emu-tab" + (this.currentTab === Tabs.NgrokConfig ? " emu-visible" : " emu-hidden")}>
                            <div className='emu-dialog-text'>ngrok is network tunneling software. The Bot Framework Emulator works with ngrok to communicate with bots hosted remotely. To learn about ngrok and download it, visit <a href="https://ngrok.com/">ngrok.com</a>.</div>
                            <div className="input-group">
                                <label className="form-label">
                                    Path to ngrok:
                                </label>
                                <input
                                    type="text"
                                    ref={ref => this.ngrokPathInputRef = ref}
                                    onChange={() => this.ngrokPathChanged()}
                                    className="form-input appsettings-path-input appsettings-ngrokpath-input"
                                    defaultValue={`${serverSettings.framework.ngrokPath || ''}`} />
                                <button className='appsettings-browsebtn' onClick={() => this.browseForNgrokPath()}>Browse...</button>
                            </div>
                        </div>
                    </div>
                    <div className="appsettings-buttons">
                        <button className="appsettings-savebtn" onClick={() => this.onAccept()}>Save</button>
                        &nbsp;&nbsp;&nbsp;
                        <button className="appsettings-cancelbtn" onClick={() => this.onClose()}>Cancel</button>
                    </div>
                </div>
            </div>
        );
    }
}
