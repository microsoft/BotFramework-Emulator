import * as React from 'react';
import { Subscription } from '@reactivex/rxjs';
import * as Splitter from 'react-split-pane';
import * as BotChat from 'msbotchat';
import { store, getSettings, serverSettings$ } from './settings';
import { SettingsAction } from './reducers/reducers';
import { ISettings as IServerSettings, Settings as ServerSettings } from '../server/settings';
import { AddressBar } from './addressBar';
import { uniqueId } from '../utils';


export interface IMainViewProps {
    conversationId: string,
    username: string,
    userid: string
}

export class MainView extends React.Component<IMainViewProps, {}> {
    storeUnsubscribe: any;
    serverSubscription: Subscription;
    serverSettings: ServerSettings;

    componentWillMount() {
        this.storeUnsubscribe = store.subscribe(() => {
            this.forceUpdate();
        });
        serverSettings$.subscribe(value => {
            this.serverSettings = new ServerSettings(value);
            this.forceUpdate();
        })
    }

    componentWillUnmount() {
        this.storeUnsubscribe();
        this.serverSubscription.unsubscribe();
    }

    onHorizontalSplitMoved = (size: number) => {
        store.dispatch<SettingsAction>({
            type: 'Remember_HorizSplit',
            state: {
                size
            }
        });
    }

    onVerticalSplitMoved = (size: number) => {
        store.dispatch<SettingsAction>({
            type: 'Remember_VertSplit',
            state: {
                size
            }
        });
    }

    botChatComponent() {
        const settings = getSettings();
        if (this.serverSettings && this.serverSettings.directLine.port > 0) {
            const activeBot = this.serverSettings.getActiveBot();
            if (activeBot) {
                const props: BotChat.AppProps = {
                    uiProps: {
                        devConsole: new BotChat.ConsoleProvider(),
                        secret: this.props.conversationId,
                        directLineDomain: `http://localhost:${this.serverSettings.directLine.port}`,
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
                        <Splitter split="vertical" defaultSize={settings.vertSplit} primary="second" onChange={(size) => this.onVerticalSplitMoved(size)}>
                            <div className={ "wc-chatview-panel" }>
                                <div className="wc-chatview-header">
                                    <AddressBar />
                                </div>
                                <BotChat.UI { ...props.uiProps } />
                            </div>
                            <div className="wc-app-debugview-container">
                                <Splitter split="horizontal" defaultSize={settings.horizSplit} onChange={(size) => this.onHorizontalSplitMoved(size)}>
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
