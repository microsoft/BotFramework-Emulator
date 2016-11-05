import * as React from 'react';
import { getSettings, Settings, addSettingsListener } from '../settings';
import { Settings as ServerSettings } from '../../types/serverSettingsTypes';
import { AddressBarActions, ConversationActions, ServerSettingsActions } from '../reducers';
import { IBot, newBot } from '../../types/botTypes';
import { IUser } from '../../types/userTypes';
import * as log from '../log';
import { AddressBarOperators } from './addressBarOperators';
import { uniqueId } from '../../utils';



interface IConversationSettings {
    conversationId: string,
    users: IUser[],
    currentUserId: string
}

export class ConversationSettingsDialog extends React.Component<{}, {}> {
    settingsUnsubscribe: any;
    showing: boolean;

    pageClicked = (ev: Event) => {
        let target = ev.srcElement;
        while (target) {
            if (target.className === "conversationsettings-dialog") {
                // Click was inside the address bar.
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
        const serverSettings = settings.serverSettings;
        let users
        return (
            <div>
                <div className="dialog-background">
                </div>
                <div className="conversationsettings-dialog">
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
