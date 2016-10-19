import * as React from 'react';
import * as Splitter from 'react-split-pane';
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
                        devConsole: new BotChat.ConsoleProvider(),
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

                return (
                    <div className="wc-app">
                        <Splitter split="vertical" defaultSize={"33%"} primary="second">
                            <div className={ "wc-chatview-panel" }>
                                <div className="wc-chatview-header">
                                    <span>WebChat</span>
                                </div>
                                <BotChat.UI { ...props.uiProps } />
                            </div>
                            <div className="wc-app-debugview-container">
                                <Splitter split="horizontal" defaultSize={"66%"}>
                                    <div className="wc-chatview-panel">
                                        <div className="wc-debugview-header">
                                            <span>JSON</span>
                                        </div>
                                        <BotChat.DebugView { ...props.debugProps } />
                                    </div>
                                    <div className="wc-app-consoleview-container">
                                        <div className="wc-consoleview-header">
                                            <span>Console</span>
                                        </div>
                                        <BotChat.ConsoleView />
                                    </div>
                                </Splitter>
                            </div>
                        </Splitter>
                    </div>
                );

            } else {
                return <div>Create or select a bot configuration to get started.</div>
                // TODO: Show "loading" or something.
            }
        } else {
            return <div>Loading...</div>
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
