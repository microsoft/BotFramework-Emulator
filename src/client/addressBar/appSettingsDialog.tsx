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

    emulatorPortInputRef: any;
    serviceUrlInputRef: any;
    ngrokPathInputRef: any;
    serviceUrlTabRef: any;
    ngrokConfigTabRef: any;

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
            port: Number(this.emulatorPortInputRef.value),
            ngrokPath: this.ngrokPathInputRef.value
        });
        AddressBarActions.hideAppSettings();
    }

    onClose = () => {
        AddressBarActions.hideAppSettings();
    }

    showServiceUrl = () => {

    }

    showNgrokConfig = () => {

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
                            Emulator Port
                        </label>
                        <input
                            type="text"
                            ref={ ref => this.emulatorPortInputRef = ref }
                            className="form-input appsettings-port-input"
                            defaultValue={`${serverSettings.framework.port || 9002}`} />
                    </div>
                    <div className="appsettings-lowerpane">
                        <ul className="appsettings-navbar">
                            <li><a href="javascript:void(0)" className="appsettings-nav" onClick={() => this.showServiceUrl()} /></li>
                            <li><a href="javascript:void(0)" className="appsettings-nav" onClick={() => this.showNgrokConfig()} /></li>
                        </ul>
                        <div className="appsettings-serviceurl-tab" ref={(ref) => this.serviceUrlTabRef = ref}>
                            <div className="input-group">
                                <label className="form-label">
                                    Path to Ngrok
                                </label>
                                <input
                                    type="text"
                                    ref={ ref => this.serviceUrlInputRef = ref }
                                    className="form-input appsettings-url-input"
                                    defaultValue={`${serverSettings.framework.ngrokPath || ''}`} />
                            </div>
                        </div>
                        <div className="appsettings-serviceurl-tab" ref={(ref) => this.ngrokConfigTabRef = ref}>
                            <div className="input-group">
                                <label className="form-label">
                                    Path to Ngrok
                                </label>
                                <input
                                    type="text"
                                    ref={ ref => this.ngrokPathInputRef = ref }
                                    className="form-input appsettings-url-input"
                                    defaultValue={`${serverSettings.framework.ngrokPath || ''}`} />
                            </div>
                        </div>
                    </div>
                    <div className="appsettings-buttons">
                        <p/><a href="javascript:void(0)" onClick={() => this.onAccept()}>accept</a>
                        <p/><a href="javascript:void(0)" onClick={() => this.onClose()}>close</a>
                    </div>
                </div>
            </div>
        );
    }
}
