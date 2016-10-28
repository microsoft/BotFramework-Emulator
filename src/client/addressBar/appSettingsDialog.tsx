import * as React from 'react';
import { getStore, getSettings, ISettings } from '../settings';
import { Settings as ServerSettings } from '../../types/serverSettingsTypes';
import { AddressBarActions, ConversationActions, ServerSettingsActions } from '../reducers';
import { IBot, newBot } from '../../types/botTypes';
import * as log from '../log';
import { AddressBarOperators } from './addressBarOperators';


export interface IAppSettingsProps {
    show?: boolean,
    onAccept?: (appSettings: IAppSettings) => void,
    onClose?: () => void
}

export interface IAppSettings {
    port?: number
}

export class AppSettingsDialog extends React.Component<IAppSettingsProps, {}> {

    pageClicked = (ev: Event) => {
        let target = ev.srcElement;
        while (target) {
            if (target.className === "appsettings-dialog") {
                // Click was inside the address bar.
                return;
            }
            target = target.parentElement;
        }

        // Click was outside the dialog. Close.
        this.onClose();
    }

    onAccept = () => {
        if (this.props.onAccept) {
            this.props.onAccept(null);
        }
    }

    onClose = () => {
        if (this.props.onClose) {
            this.props.onClose();
        }
    }

    componentWillMount() {
        window.addEventListener('click', (e) => this.pageClicked(e));
    }

    componentWillUnmount() {
        window.removeEventListener('click', (e) => this.pageClicked(e));
    }

    render() {
        if (!this.props.show) return null;
        return (
            <div className="appsettings-dialog" data-modal={true}>
                Hey.
                <a href="#" onClick={() => this.onClose()}>close</a>
            </div>
        );
    }
}
