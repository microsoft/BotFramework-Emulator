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
import { getSettings, Settings, addSettingsListener } from '../settings';
import { AddressBarActions } from '../reducers';
import { IUser } from '../../types/userTypes';
import { uniqueId } from '../../shared/utils';


export class ConversationSettingsDialog extends React.Component<{}, {}> {
    settingsUnsubscribe: any;
    showing: boolean;

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
            <div>
                <div className="dialog-background">
                </div>
                <div className="emu-dialog conversationsettings-dialog">
                    <CloseButton className='conversationsettings-closex' onClick={() => this.onClose()} />
                    <UserList
                        className='conversationsettings-userlist'
                        users={[]}
                        currentUser={{ id: uniqueId(), name: 'User 1' }}
                        onSave={(users, currentUser) => this.onSaveUserChanges(users, currentUser)}
                        onCancel={() => this.onClose()} />
                </div>
            </div>
        );
    }
}

interface ICloseButtonProps {
    className: string;
    onClick();
}

class CloseButton extends React.Component<ICloseButtonProps, {}> {
    render() {
        return <a className={this.props.className} href="javascript:void(0)" onClick={() => this.props.onClick()}>[x]</a>
    }
}


interface IUserListProps {
    className: string;
    users: IUser[];
    currentUser: IUser;
    onSave(users: IUser[], currentUser: IUser);
    onCancel();
}

interface IUserListState {
    users: IUser[];
    currentUser: IUser;
}

class UserList extends React.Component<IUserListProps, IUserListState> {
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
                    <button className='save-button' onClick={() => this.props.onSave(this.state.users, this.state.currentUser)}>Save</button>
                    <button className='cancel-button' onClick={() => this.props.onCancel()}>Cancel</button>
                </div>
            </div>
        )
    }
}
