import * as React from 'react';
import * as Splitter from 'react-split-pane';
import * as BotChat from 'msbotchat';
import * as log from './log';
import { getStore, getSettings, settingsDefault, ISettings } from './settings';
import { LayoutActions, InspectorActions, LogActions } from './reducers';
import { Settings as ServerSettings } from '../types/serverSettingsTypes';
import { AddressBar } from './addressBar/addressBar';
import { InspectorView } from './inspectorView'
import { LogView } from './logView';
import { uniqueId } from '../utils';
import { IUser } from '../types/userTypes';


export class MainView extends React.Component<{}, {}> {
    storeUnsubscribe: any;
    prevSettings = settingsDefault;
    reuseKey: number = 0;

    shouldUpdate(newSettings: ISettings): boolean {
        if (newSettings.serverSettings.activeBot != this.prevSettings.serverSettings.activeBot) {
            return true;
        }
        if (newSettings.conversation.conversationId != this.prevSettings.conversation.conversationId) {
            return true;
        }
        if (newSettings.serverSettings.users.currentUserId != this.prevSettings.serverSettings.users.currentUserId) {
            return true;
        }
        return false;
    }

    componentWillMount() {
        this.storeUnsubscribe = getStore().subscribe(() => {
            const newSettings = getSettings();
            if (this.shouldUpdate(newSettings)) {
                this.forceUpdate();
            }
            this.prevSettings = Object.assign({}, newSettings);
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
        const botId = this.getActiveBot();
        const user = this.getCurrentUser();
        if (user && botId) {
            const settings = getSettings();
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
            log.info(`Starting conversation with ${srvSettings.botById(srvSettings.activeBot).botUrl}`);
            // We always want a new component instance when these parameters change, so gen a random key each time.
            return <BotChat.Chat key={this.reuseKey++} {...props} />
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
                                        <span>Inspector</span>
                                    </div>
                                    <InspectorView />
                                </div>
                                <div className="wc-app-logview-container">
                                    <div className="wc-logview-header">
                                        <span>Log</span>
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
