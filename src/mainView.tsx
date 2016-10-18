import * as React from 'react';
import * as BotChat from 'msbotchat';
import { SettingsView } from './settingsView';
import * as SettingsClient from './settings/settingsClient';
import { uniqueId } from './utils';

export interface IMainViewProps {
    conversationId: string,
    username: string,
    userid: string
}

export class MainView extends React.Component<IMainViewProps, {}> {

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
                        secret: this.props.conversationId,
                        directLineDomain: `http://localhost:${settings.directLine.port}`,
                        user: {
                            id: this.props.userid,
                            name: this.props.username
                        },
                        historyProps: {
                            allowSelection: true
                        }
                    },
                    debugProps: {
                    }
                };
                return <BotChat.App {...props} />;
            } else {
                <div>Create or select a bot configuration to get started.</div>
                // TODO: Show "loading" or something.
            }
        } else {
            <div>Loading...</div>
            // TODO: Show "loading" or something.
        }
    }

    render() {
        return (
            <div className='mainview'>
                <div className='botchat-container'>
                    {this.botChatComponent()}
                </div>
            </div>
        );
    }
}
