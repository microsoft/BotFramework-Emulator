import * as React from 'react';
import * as BotChat from 'msbotchat';
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
                const props: BotChat.AppProps = {
                    uiProps: {
                        secret: activeBot.botId,
                        directLineDomain: `http://localhost:${settings.directLine.port}`,
                        user: {
                            id: uniqueId(),
                            name: 'User'
                        },
                        historyProps: {
                            allowSelection: true
                        }
                    },
                    debugProps:{
                    }
                };
                return <BotChat.App {...props} />;
            } else {
                <div>Create or select a bot configuration to get started.</div>
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
