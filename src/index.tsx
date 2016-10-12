import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { MainView } from './mainView';
import * as SettingsClient from './settingsClient';

ReactDOM.render(<MainView />, document.getElementById('mainview'));
SettingsClient.startup();

