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
import * as fs from 'fs';

interface IAppSettings {
    ngrokPath?: string,
    bypassNgrokLocalhost?: boolean
}

export class AppSettingsDialog extends React.Component<{}, { ngrokPath: string }> {
    settingsUnsubscribe: any;
    ngrokPathInputRef: any;
    bypassNgrokLocalhostInputRef: any;

    showing: boolean;

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
                if (filenames && filenames.length && fs.existsSync(filenames[0])) {
                    // TODO: validate selection
                    //      done.
                    this.ngrokPathInputRef.value = filenames[0];
                    this.setState({ ngrokPath: filenames[0] });
                }
            });
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
                            <li>
                                <a href="javascript:void(0)"
                                    className={"emu-navitem emu-navitem-selected"}
                                >
                                    General
                                </a>
                            </li>
                        </ul>
                        <hr className='enu-navhdr' />
                        <div className={"emu-tab emu-visible"}>
                            <div className='emu-dialog-text'>
                                <a title='https://ngrok.com' href='https://ngrok.com'>ngrok</a> is network tunneling software.
                            The Bot Framework Emulator works with ngrok to communicate with bots hosted remotely.
                            Read the <a title='https://github.com/Microsoft/BotFramework-Emulator/wiki/Tunneling-(ngrok)' href='https://github.com/Microsoft/BotFramework-Emulator/wiki/Tunneling-(ngrok)'>wiki page</a> to learn more about using ngrok and to download it.
                            </div>
                            <div className="input-group">
                                <label className="form-label">
                                    Path to ngrok:
                                </label>
                                <input
                                    type="text"
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
                                        ref={ref => this.bypassNgrokLocalhostInputRef = ref}
                                        className="form-input"
                                        defaultChecked={ serverSettings.framework.bypassNgrokLocalhost }
                                        disabled={ this.state ? !this.state.ngrokPath : !serverSettings.framework.ngrokPath } />
                                    Bypass ngrok for local addresses
                                </label>
                            </div>
                        </div>
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
