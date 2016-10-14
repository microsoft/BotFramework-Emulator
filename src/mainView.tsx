import * as React from 'react';
import { UI as BotChat } from '../node_modules/msbotchat/built/BotChat';
import { SettingsView } from './settingsView';
import * as SettingsClient from './settings/settingsClient';
import { uniqueId } from './utils';


export class MainView extends React.Component<{}, {}> {

    configChangeHandler = () => {
        this.forceUpdate();
    }

    componentWillMount() {
        SettingsClient.settingsChange.on('configure', this.configChangeHandler);
    }

    componentWillUnmount() {
        SettingsClient.settingsChange.removeListener('configure', this.configChangeHandler);
    }

    botChatComponent() {
        const settings = SettingsClient.settings;
        if (settings && settings.directLine.port > 0) {
            const activeBot = SettingsClient.settings.getActiveBot();
            if (activeBot) {
                return <BotChat appSecret={activeBot.botId} debug='visible' host={`http://localhost:${settings.directLine.port}`} />;
            } else {
                // TODO: Show "loading" or something.
            }
        }
    }

    render() {
        return (
            <div className='mainview'>
                <SettingsView />
                <div className='botchat-container'>
                    {this.botChatComponent()}
                </div>
            </div>
        );
    }
}
