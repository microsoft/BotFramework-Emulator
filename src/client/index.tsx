import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { MainView, IMainViewProps } from './mainView';
import * as SettingsClient from '../settings/settingsClient';
import { uniqueId } from '../utils';


SettingsClient.startup();

const props: IMainViewProps = {
    conversationId: 'new',
    username: 'User',
    userid: uniqueId()
}

ReactDOM.render(<MainView {...props} />, document.getElementById('mainview'));

