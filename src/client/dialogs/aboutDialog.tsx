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
import * as Constants from '../constants';
import { AddressBarActions } from '../reducers';
import { getSettings, Settings, addSettingsListener } from '../settings';
var pjson = require('../../../package.json');

export class AboutDialog extends React.Component<{}, {}> {
    settingsUnsubscribe: any;
    showing: boolean;

    pageClicked = (ev: Event) => {
        if (ev.defaultPrevented)
            return;
        let target = ev.srcElement;
        while (target) {
            if (target.className.toString().includes("about")) {
                ev.preventDefault();
                return;
            }
            target = target.parentElement;
        }

        // Click was outside the dialog. Close.
        this.onClose();
    }

    onClose = () => {
        AddressBarActions.hideAbout();
    }

    componentWillMount() {
        window.addEventListener('click', this.pageClicked);
        this.settingsUnsubscribe = addSettingsListener((settings: Settings) => {
            if (settings.addressBar.showAbout != this.showing) {
                this.showing = settings.addressBar.showAbout;
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
        if (!settings.addressBar.showAbout) return null;
        return (
            <div>
                <div className="dialog-background">
                </div>
                <div className="emu-dialog about-dialog">
                    <div className="dialog-closex" onClick={() => this.onClose()} dangerouslySetInnerHTML={{ __html: Constants.clearCloseIcon("", 24) }} />
                    <div className='about-logo' dangerouslySetInnerHTML={{ __html: Constants.botFrameworkIcon('about-logo-fill', 142) }} />
                    <div className="about-name">Microsoft Bot Framework Emulator</div>
                    <div className="about-link"><a href='https://aka.ms/bf-emulator'>https://aka.ms/bf-emulator</a></div>
                    <div className="about-version">{`v${pjson.version}`}</div>
                    <div className="about-copyright">&copy; 2016 Microsoft</div>
                </div>
            </div>
        );
    }
}
