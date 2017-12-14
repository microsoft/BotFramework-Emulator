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
import { getSettings, Settings, addSettingsListener } from '../settings';
import { AddressBarActions } from '../reducers';
import { IUser } from '../../types/userTypes';
import { uniqueId } from '../../shared/utils';
import CommonDialog from './commonDialog';


export class ConversationSettingsDialog extends React.Component<{}, {}> {
    settingsUnsubscribe: any;
    showing: boolean;
    lastFocusRef: any;
    naturalFocusRef: any;

    constructor(props) {
        super(props);
        this.handleFocusLast = this.handleFocusLast.bind(this);
        this.handleFocusNatural = this.handleFocusNatural.bind(this);
    }

    handleFocusLast() {
        const element = ReactDOM.findDOMNode(this.lastFocusRef) as HTMLElement;
        element && element.focus();
    }

    handleFocusNatural() {
        const element = ReactDOM.findDOMNode(this.naturalFocusRef) as HTMLElement;
        element && element.focus();
    }

    pageClicked = (ev: Event) => {
        if (ev.defaultPrevented)
            return;
        let target = ev.srcElement;
        while (target) {
            if (target.className === "conversationsettings-dialog") {
                ev.preventDefault();
                return;
            }
            target = target.parentElement;
        }

        // Click was outside the dialog. Close.
        this.onClose();
    }

    onSaveUserChanges = (users, currentUser) => {
        AddressBarActions.hideConversationSettings();
    }

    onClose = () => {
        AddressBarActions.hideConversationSettings();
    }

    componentWillMount() {
        window.addEventListener('click', this.pageClicked);
        this.settingsUnsubscribe = addSettingsListener((settings: Settings) => {
            if (settings.addressBar.showConversationSettings != this.showing) {
                this.showing = settings.addressBar.showConversationSettings;
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
        if (!settings.addressBar.showConversationSettings) return null;
        return (
            <CommonDialog
                width={ 500 }
                height={ 400 }
                onClose={ this.onClose }
                onFocusLast={ this.handleFocusLast }
                onFocusNatural={ this.handleFocusNatural }
            >
                <UserList
                    className='conversationsettings-userlist'
                    users={[]}
                    currentUser={{ id: uniqueId(), name: 'User 1' }}
                    onSave={(users, currentUser) => this.onSaveUserChanges(users, currentUser)}
                    onCancel={() => this.onClose()}
                    saveNaturalFocus={ (ref) => this.naturalFocusRef = ref } />
                <div tabIndex={0} ref={ ref => this.lastFocusRef = ref }/>
            </CommonDialog>
        );
    }
}


interface IUserListProps {
    className: string;
    users: IUser[];
    currentUser: IUser;
    onSave(users: IUser[], currentUser: IUser);
    onCancel();
    saveNaturalFocus;
}

interface IUserListState {
    users: IUser[];
    currentUser: IUser;
}

class UserList extends React.Component<IUserListProps, IUserListState> {
    naturalFocus: any;
    constructor(props) {
        super(props);
        this.state = {
            users: this.props.users,
            currentUser: this.props.currentUser
        }
    }
    render() {
        return (
            <div className={this.props.className}>
                <h1>Manage Users</h1>
                <div className='conversationsettings-userlist-area'>
                </div>
                <div>
                    <button type="button" ref={ref => this.props.saveNaturalFocus(ref) } className='save-button' onClick={() => this.props.onSave(this.state.users, this.state.currentUser)}>Save</button>
                    <button className='cancel-button' onClick={() => this.props.onCancel()}>Cancel</button>
                </div>
            </div>
        )
    }
}
