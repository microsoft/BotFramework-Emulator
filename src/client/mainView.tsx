import * as React from 'react';
import * as Splitter from 'react-split-pane';
import * as BotChat from 'msbotchat';
import { getStore, getSettings } from './settings';
import { LayoutActions, InspectorActions } from './reducers';
import { Settings as ServerSettings } from '../server/settings';
import { AddressBar } from './addressBar';
import { InspectorView } from './inspectorView'
import { LogView } from './logView';
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

    onActivitySelected(activity: any) {
        InspectorActions.setSelectedObject(activity);
    }

    botChatComponent() {
        const settings = getSettings();
        const bot = this.getActiveBot();
        const user = this.getCurrentUser();
        if (user && bot) {
            const props: BotChat.ChatProps = {
                botConnection: new BotChat.DirectLine(
                    settings.conversation.conversationId,
                    `http://localhost:${settings.serverSettings.directLine.port}`),
                locale: 'en-us',
                formatOptions: {
                    showHeader: false
                },
                onActivitySelected: this.onActivitySelected,
                user
            }
            return <BotChat.Chat {...props} />
        }
        return null;
    }

    render() {
        const settings = getSettings();
        return (
            <div className='mainview'>
                <div className='botchat-container'>
                    <Splitter split="vertical" defaultSize={settings.layout.vertSplit} primary="second" onChange={(size) => LayoutActions.rememberVerticalSplitter(size)}>
                        <div className={"wc-chatview-panel"}>
                            <AddressBar />
                            {this.botChatComponent()}
                        </div>
                        <div className="wc-app-inspectorview-container">
                            <Splitter split="horizontal" defaultSize={settings.layout.horizSplit} onChange={(size) => LayoutActions.rememberHorizontalSplitter(size)}>
                                <div className="wc-chatview-panel">
                                    <div className="wc-inspectorview-header">
                                        <span>JSON</span>
                                    </div>
                                    <InspectorView />
                                </div>
                                <div className="wc-app-logview-container">
                                    <div className="wc-logview-header">
                                        <span>Output</span>
                                    </div>
                                    <LogView />
                                </div>
                            </Splitter>
                        </div>
                    </Splitter>
                </div>
            </div>
        );
    }
}
