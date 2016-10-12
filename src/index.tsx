import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { MainView } from './mainView';
import * as SettingsClient from './settings/settingsClient';

SettingsClient.startup();
ReactDOM.render(<MainView />, document.getElementById('mainview'));

