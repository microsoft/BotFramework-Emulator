import * as React from 'react';
import * as Splitter from 'react-split-pane';
import * as BotChat from 'msbotchat';
import { getStore, getSettings } from './settings';
import { LayoutActions } from './reducers';
import { Settings as ServerSettings } from '../server/settings';
import { AddressBar } from './addressBar';
import { uniqueId } from '../utils';
import { IUser } from '../types/userTypes';


export class MainView extends React.Component<{}, {}> {
    storeUnsubscribe: any;

    componentWillMount() {
        this.storeUnsubscribe = getStore().subscribe(() => {
            this.forceUpdate();
        });
    }

    componentWillUnmount() {
        this.storeUnsubscribe();
    }

    getActiveBot(): string {
        const settings = getSettings();
        if (settings.serverSettings.activeBot && settings.serverSettings.activeBot.length)
            return settings.serverSettings.activeBot;
        return null;
    }

    getCurrentUser(): IUser {
        const serverSettings = getSettings().serverSettings;
        if (serverSettings && serverSettings.users && serverSettings.users.currentUserId) {
            let user: IUser = serverSettings.users.usersById[serverSettings.users.currentUserId];
            if (user && user.id && user.id.length)
                return user;
        }
        return null;
    }

    botChatComponent() {
        const settings = getSettings();
        const activeBot = this.getActiveBot();
        const user = this.getCurrentUser();
        if (user && activeBot) {
            const props: BotChat.UIProps = {
                devConsole: new BotChat.ConsoleProvider(),
                secret: settings.conversation.conversationId,
                directLineDomain: `http://localhost:${settings.serverSettings.directLine.port}`,
                user,
                allowMessageSelection: true
            }
            return <BotChat.UI {...props} />
        }
        return null;
    }

    botChatApp() {
        const settings = getSettings();
        return (
            <div className="wc-app">
                <Splitter split="vertical" defaultSize={settings.layout.vertSplit} primary="second" onChange={(size) => LayoutActions.rememberVerticalSplitter(size)}>
                    <div className={"wc-chatview-panel"}>
                        <AddressBar />
                        {this.botChatComponent()}
                    </div>
                    <div className="wc-app-debugview-container">
                        <Splitter split="horizontal" defaultSize={settings.layout.horizSplit} onChange={(size) => LayoutActions.rememberHorizontalSplitter(size)}>
                            <div className="wc-chatview-panel">
                                <div className="wc-debugview-header">
                                    <span>JSON</span>
                                </div>
                                <BotChat.DebugView />
                            </div>
                            <div className="wc-app-consoleview-container">
                                <div className="wc-consoleview-header">
                                    <span>Output</span>
                                </div>
                                <BotChat.ConsoleView />
                            </div>
                        </Splitter>
                    </div>
                </Splitter>
            </div>
        );
    }

    render() {
        return (
            <div className='mainview'>
                <div className='botchat-container'>
                    {this.botChatApp()}
                </div>
            </div>
        );
    }
}
