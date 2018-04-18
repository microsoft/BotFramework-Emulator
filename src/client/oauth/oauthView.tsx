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
import * as Payment from '../../types/paymentTypes';
import * as Electron from 'electron';
import { Emulator } from '../emulator';
import { ISettings } from '../settings';
import { ConversationActions, ServerSettingsActions } from '../reducers';
import { Button } from '../payments/button';
import { uniqueId } from '../../shared/utils';

interface IOAuthViewState {
    connectionName: string;
    token: string;
}

export class OAuthView extends React.Component<{}, IOAuthViewState> {
    private local: IOAuthViewState;
    private settings: ISettings;
    
    constructor(props) {
        super(props);
        let param = location.search;
        let connectionName;
        if (param) {
            if(param.startsWith('?')) {
                param = param.substring(1);
            }
            connectionName = param;
        }

        this.local = {
            connectionName: connectionName,
            token: undefined
        };

        this.tokenChanged = this.tokenChanged.bind(this);
        this.ok = this.ok.bind(this);

        this.state = this.local;

        let oauthState: any = Electron.ipcRenderer.sendSync('getOAuthState');
        
        this.settings = oauthState.settings;
        Emulator.serviceUrl = oauthState.serviceUrl;
        ConversationActions.joinConversation(this.settings.conversation.conversationId);
        ServerSettingsActions.set(this.settings.serverSettings);
    }

    private tokenChanged(text: string): void {
        this.updateState({ token: text });
    }

    private ok() {
        Emulator.sendTokenResponse(this.state.connectionName, this.state.token,
            (result: boolean) => {
                if(result) {
                    window.close();
                }
            });
    }

    private updateState(update: any) {
        this.local = Object.assign({}, this.local, update);
        this.setState(this.local);
    }

    render() {
        return (
        <div className='oauth-container'>
            <div className='oauth-field'>
                <div className='oauth-label'>Token</div>
                <input
                    type="text"
                    className={'oauth-input'}
                    value={this.state.token}
                    onChange={e => this.tokenChanged((e.target as any).value)} />
            </div>
            <div className='oauth-button-bar'> 
                <Button classes='primary-button button ok-button' onClick={this.ok} label='Send'/>
            </div>
        </div>);
    }
}
