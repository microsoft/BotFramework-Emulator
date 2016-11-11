import * as React from 'react';
import * as Constants from '../constants';
import { AddressBarActions } from '../reducers';
import { getSettings, Settings, addSettingsListener } from '../settings';


export class AboutDialog extends React.Component<{}, {}> {
    settingsUnsubscribe: any;
    showing: boolean;

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
                <div className="about-dialog">
                    <h2 className="dialog-header">Bot Framework Emulator</h2>
                    <div className="dialog-closex" onClick={() => this.onClose()} dangerouslySetInnerHTML={{ __html: Constants.clearCloseIcon("", 24) }} />
                </div>
            </div>
        );
    }
}
