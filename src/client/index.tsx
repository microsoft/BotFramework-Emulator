import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { MainView } from './mainView';
import * as Settings from './settings';
import { uniqueId } from '../utils';


Settings.startup();

ReactDOM.render(
    <MainView />,
    document.getElementById('mainview'));
