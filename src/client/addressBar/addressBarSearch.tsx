import * as React from 'react';
import { getSettings, ISettings, addSettingsListener } from '../settings';
import { Settings as ServerSettings } from '../../types/serverSettingsTypes';
import { AddressBarActions, ConversationActions, ServerSettingsActions } from '../reducers';
import { IBot, newBot } from '../../types/botTypes';
import * as log from '../log';
import { AddressBarOperators } from './addressBarOperators';


export class AddressBarSearch extends React.Component<{}, {}> {
    settingsUnsubscribe: any;

    componentWillMount() {
        this.settingsUnsubscribe = addSettingsListener(() => {
            this.forceUpdate();
        });
    }

    componentWillUnmount() {
        this.settingsUnsubscribe();
    }

    searchResultComponents() {
        const settings = getSettings();
        return settings.addressBar.matchingBots.map((bot, index) => <AddressBarSearchResult index={index} bot={bot} key={bot.botId} />);
    }

    render() {
        const settings = getSettings();
        if (!settings.addressBar.showSearchResults) return null;
        if (!settings.addressBar.matchingBots.length) return null;
        return (
            <div className="addressbar-search">
                {this.searchResultComponents()}
            </div>
        );
    }
}

interface AddressBarSearchResultProps {
    index: number,
    bot: IBot
}

class AddressBarSearchResult extends React.Component<AddressBarSearchResultProps, {}> {
    selectBot() {
        AddressBarOperators.setText(this.props.bot.botUrl);
        AddressBarOperators.selectBot(this.props.bot);
        AddressBarOperators.clearMatchingBots();
        AddressBarActions.showBotCreds();
    }

    deleteBot() {
        const settings = getSettings();
        if (settings.addressBar.selectedBot && settings.addressBar.selectedBot.botId === this.props.bot.botId) {
            AddressBarOperators.setText('');
            AddressBarOperators.selectBot(null);
        }
        const matchingBots = settings.addressBar.matchingBots.filter(bot => bot.botId !== this.props.bot.botId);
        AddressBarOperators.setMatchingBots(matchingBots);
        AddressBarOperators.deleteBot(this.props.bot.botId);
    }

    render() {
        return (
            <div className='addressbar-searchresult' >
                <a className='addressbar-searchresult-a' href='javascript:void(0)' onClick={() => this.selectBot()}>
                    <div className='addressbar-searchresult-title'>
                        {this.props.bot.botUrl}
                    </div>
                </a>
                <a className='addressbar-searchresult-a' href='javascript:void(0)' onClick={() => this.deleteBot()}>
                    <div className='addressbar-searchresult-delete' >
                        [x]
                    </div>
                </a>
            </div>
        );
    }
}
