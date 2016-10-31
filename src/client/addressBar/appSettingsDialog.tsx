import * as React from 'react';
import { getSettings, Settings, addSettingsListener } from '../settings';
import { Settings as ServerSettings } from '../../types/serverSettingsTypes';
import { AddressBarActions, ConversationActions, ServerSettingsActions } from '../reducers';
import { IBot, newBot } from '../../types/botTypes';
import * as log from '../log';
import { AddressBarOperators } from './addressBarOperators';


interface IAppSettings {
    port?: number,
    ngrokPath?: string
}

export class AppSettingsDialog extends React.Component<{}, {}> {
    settingsUnsubscribe: any;
    showing: boolean;

    portRef: any;
    ngrokPathRef: any;

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
        ServerSettingsActions.remote_setFrameworkServerSettings({
            port: Number(this.portRef.value),
            ngrokPath: this.ngrokPathRef.value
        });
        AddressBarActions.hideAppSettings();
    }

    onClose = () => {
        AddressBarActions.hideAppSettings();
    }

    componentWillMount() {
        window.addEventListener('click', (e) => this.pageClicked(e));
        this.settingsUnsubscribe = addSettingsListener((settings: Settings) => {
            if (settings.addressBar.showAppSettings != this.showing) {
                this.showing = settings.addressBar.showAppSettings;
                this.forceUpdate();
            }
        });
    }

    componentWillUnmount() {
        window.removeEventListener('click', (e) => this.pageClicked(e));
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
                <div className="appsettings-dialog">
                    <div className="input-group">
                        <label className="form-label">
                            Framework Port
                        </label>
                        <input
                            type="text"
                            ref={ ref => this.portRef = ref }
                            className="form-input appsettings-port-input"
                            defaultValue={`${serverSettings.framework.port || 9002}`} />
                    </div>
                    <div className="input-group">
                        <label className="form-label">
                            Path to Ngrok
                        </label>
                        <input
                            type="text"
                            ref={ ref => this.ngrokPathRef = ref }
                            className="form-input appsettings-url-input"
                            defaultValue={`${serverSettings.framework.ngrokPath || ''}`} />
                    </div>
                    <p/><a href="#" onClick={() => this.onAccept()}>accept</a>
                    <p/><a href="#" onClick={() => this.onClose()}>close</a>
                </div>
            </div>
        );
    }
}
