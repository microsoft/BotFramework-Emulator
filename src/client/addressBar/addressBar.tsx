import * as React from 'react';
import { getSettings, ISettings } from '../settings';
import { Settings as ServerSettings } from '../../types/serverSettingsTypes';
import { AddressBarActions, ConversationActions, ServerSettingsActions } from '../reducers';
import { IBot, newBot } from '../../types/botTypes';
import * as log from '../log';
import { AddressBarOperators } from './addressBarOperators';
import { AddressBarStatus } from './addressBarStatus';
import { AddressBarTextBox } from './addressBarTextBox';
import { AddressBarMenu } from './addressBarMenu';
import { AddressBarSearch } from './addressBarSearch';
import { AddressBarBotCreds } from './addressBarBotCreds';


export class AddressBar extends React.Component<{}, {}> {

    pageClicked = (ev: Event) => {
        let target = ev.srcElement;
        while (target) {
            if (target.className === "addressbar") {
                // Click was inside the address bar.
                return;
            }
            target = target.parentElement;
        }

        // Click was outside the address bar. Close open subpanels.
        AddressBarOperators.clearMatchingBots();
        //AddressBarOperators.selectBot(null);
    }

    componentWillMount() {
        window.addEventListener('click', (e) => this.pageClicked(e));
    }

    componentWillUnmount() {
        window.removeEventListener('click', (e) => this.pageClicked(e));
    }

    render() {
        return (
            <div className="addressbar">
                <AddressBarStatus />
                <AddressBarTextBox />
                <AddressBarMenu />
                <AddressBarSearch />
                <AddressBarBotCreds />
            </div>
        );
    }
}




