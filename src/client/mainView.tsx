import * as React from 'react';
import * as Splitter from 'react-split-pane';
import * as BotChat from 'msbotchat';
import * as log from './log';
import { getSettings, settingsDefault, Settings, addSettingsListener } from './settings';
import { LayoutActions, InspectorActions, LogActions } from './reducers';
import { Settings as ServerSettings } from '../types/serverSettingsTypes';
import { AddressBar } from './addressBar/addressBar';
import { InspectorView } from './inspectorView'
import { LogView } from './logView';
import { uniqueId } from '../utils';
import { IUser } from '../types/userTypes';


export class MainView extends React.Component<{}, {}> {
    settingsUnsubscribe: any;
    cache: {
        activeBot?: string,
        conversationId?: string,
        userId?: string
    } = {};
    reuseKey: number = 0;

    shouldUpdate(newSettings: Settings): boolean {
        if (newSettings.serverSettings.activeBot && newSettings.serverSettings.activeBot.length && newSettings.serverSettings.activeBot != this.cache.activeBot) {
            return true;
        }
        if (newSettings.conversation.conversationId && newSettings.conversation.conversationId.length && newSettings.conversation.conversationId != this.cache.conversationId) {
            return true;
        }
        if (newSettings.serverSettings.users.currentUserId && newSettings.serverSettings.users.currentUserId.length && newSettings.serverSettings.users.currentUserId != this.cache.userId) {
            return true;
        }
        return false;
    }

    componentWillMount() {
        this.settingsUnsubscribe = addSettingsListener((settings: Settings) => {
            if (this.shouldUpdate(settings)) {
                console.log(`updating mainview because: ${settings.serverSettings.activeBot}, ${settings.conversation.conversationId}, ${settings.serverSettings.users.currentUserId}`);
                console.log(`was: ${this.cache.activeBot}, ${this.cache.conversationId}, ${this.cache.userId}`);
                this.reuseKey++;
                this.forceUpdate();
            }
            this.cache = {
                activeBot: settings.serverSettings.activeBot,
                conversationId: settings.conversation.conversationId,
                userId: settings.serverSettings.users.currentUserId
            }
        });
    }

    componentWillUnmount() {
        this.settingsUnsubscribe();
    }

    getActiveBot(settings: Settings): string {
        if (settings.serverSettings.activeBot && settings.serverSettings.activeBot.length)
            return settings.serverSettings.activeBot;
        return null;
    }

    getCurrentUser(serverSettings: ServerSettings): IUser {
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
        const botId = this.getActiveBot(settings);
        const user = this.getCurrentUser(settings.serverSettings);
        if (user && botId) {
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
            InspectorActions.clear();
            let srvSettings = new ServerSettings(settings.serverSettings);
            // We always want a new component instance when these parameters change, so gen a random key each time.
            return <BotChat.Chat key={this.reuseKey} {...props} />
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
                            <Splitter split="horizontal" primary="second" defaultSize={settings.layout.horizSplit} onChange={(size) => LayoutActions.rememberHorizontalSplitter(size)}>
                                <div className="wc-chatview-panel">
                                    <div className="wc-inspectorview-header">
                                        <span>INSPECTOR</span>
                                    </div>
                                    <InspectorView />
                                </div>
                                <div className="wc-app-logview-container">
                                    <div className="wc-logview-header">
                                        <span>LOG</span>
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
