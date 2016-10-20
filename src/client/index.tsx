import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { MainView, IMainViewProps } from './mainView';
import * as Settings from './settings';
import { uniqueId } from '../utils';


Settings.startup();

const props: IMainViewProps = {
    conversationId: 'new',
    username: 'User',
    userid: uniqueId()
}

ReactDOM.render(<MainView {...props} />, document.getElementById('mainview'));

