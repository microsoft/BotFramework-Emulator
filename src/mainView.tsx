import * as React from 'react';
import {UI as BotChat} from '../node_modules/msbotchat/built/BotChat';
import {SettingsView} from './settingsView';


export class MainView extends React.Component<{}, {}> {

    render() {
        return (
            <div className='mainview'>
                <SettingsView />
                <div className='botchat-container'>
                    <BotChat appSecret='emulator' debug='visible' host='http://localhost:9001' />
                </div>
            </div>
        )
    }
}
