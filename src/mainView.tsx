import * as React from 'react';
import { UI as BotChat } from '../node_modules/msbotchat/built/BotChat';
import { SettingsView } from './settingsView';
import * as SettingsStore from './settings/settingsStore';


export class MainView extends React.Component<{}, {}> {

    unsubscribe: any;

    componentWillMount() {
        this.unsubscribe = SettingsStore.store.subscribe(() => {
            this.forceUpdate();
        });
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    botChatComponent() {
        const state = SettingsStore.store.getState();
        if (state.directLine.port > 0) {
            const activeBot = SettingsStore.getActiveBot();
            if (activeBot) {
                return <BotChat appSecret='emulator' debug='visible' host={`http://localhost:${state.directLine.port}`} />;
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
