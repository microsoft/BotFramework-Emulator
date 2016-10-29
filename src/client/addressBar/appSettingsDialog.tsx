import * as React from 'react';
import { getStore, getSettings, ISettings } from '../settings';
import { Settings as ServerSettings } from '../../types/serverSettingsTypes';
import { AddressBarActions, ConversationActions, ServerSettingsActions } from '../reducers';
import { IBot, newBot } from '../../types/botTypes';
import * as log from '../log';
import { AddressBarOperators } from './addressBarOperators';


export interface IAppSettingsProps {
    show?: boolean
}

interface IAppSettingsState {
    show?: boolean
}

interface IAppSettings {
    port?: number,
    ngrokPath?: string
}

export class AppSettingsDialog extends React.Component<IAppSettingsProps, IAppSettingsState> {

    constructor(props: IAppSettingsProps) {
        super(props)
        this.state = { show: props.show };
    }

    appSettings: IAppSettings = {};

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
        ServerSettingsActions.remote_setFrameworkPort(this.appSettings.port);
        ServerSettingsActions.remote_setNgrokPath(this.appSettings.ngrokPath);
        this.setState({ show: false });
    }

    onClose = () => {
        this.setState({ show: false });
    }

    frameworkPortChanged = (text: string) => {
        this.appSettings.port = Number(text);
    }

    ngrokPathChanged = (text: string) => {
        this.appSettings.ngrokPath = text;
    }

    componentWillMount() {
        window.addEventListener('click', (e) => this.pageClicked(e));
    }

    componentWillUnmount() {
        window.removeEventListener('click', (e) => this.pageClicked(e));
    }

    componentWillReceiveProps(nextProps: IAppSettingsProps) {
        this.setState({show: nextProps.show});
        if (nextProps.show) {
            const serverSettings = getSettings().serverSettings;

            this.appSettings.port = serverSettings.framework.port;
            this.appSettings.ngrokPath = serverSettings.framework.ngrokPath;

            this.appSettings = {
                port: serverSettings.framework.port,
                ngrokPath: serverSettings.framework.ngrokPath
            }
        }
    }

    render() {
        if (!this.state.show) return null;
        const settings = getSettings();
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
                            className="form-input appsettings-port-input"
                            defaultValue={`${settings.serverSettings.framework.port}`}
                            onChange={e => this.frameworkPortChanged((e.target as any).value)} />
                    </div>
                    <div className="input-group">
                        <label className="form-label">
                            Path to Ngrok
                        </label>
                        <input
                            type="text"
                            className="form-input appsettings-url-input"
                            defaultValue={`${settings.serverSettings.framework.ngrokPath}`}
                            onChange={e => this.ngrokPathChanged((e.target as any).value)} />
                    </div>
                    <p/><a href="#" onClick={() => this.onAccept()}>accept</a>
                    <p/><a href="#" onClick={() => this.onClose()}>close</a>
                </div>
            </div>
        );
    }
}
