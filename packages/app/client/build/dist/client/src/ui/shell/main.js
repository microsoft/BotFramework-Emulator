//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
import * as React from 'react';
import * as styles from './main.scss';
import { Splitter } from '@bfemulator/ui-react';
import { ExplorerBar } from './explorer';
import { MDI } from './mdi';
import { NavBar } from './navBar';
import { DialogHost, TabManager } from '../dialogs';
import * as Constants from '../../constants';
import { StatusBar } from './statusBar/statusBar';
import { StoreVisualizer } from '../debug/storeVisualizer';
export class Main extends React.Component {
    constructor(props) {
        super(props);
        this.handleTabChange = this.handleTabChange.bind(this);
        this.state = {
            tabValue: 0
        };
    }
    componentWillReceiveProps(newProps) {
        if (newProps.presentationModeEnabled) {
            window.addEventListener('keydown', this.props.exitPresentationMode);
        }
        else {
            window.removeEventListener('keydown', this.props.exitPresentationMode);
        }
    }
    handleTabChange(nextTabValue) {
        this.setState(() => ({ tabValue: nextTabValue }));
    }
    render() {
        const tabGroup1 = this.props.primaryEditor &&
            React.createElement("div", { className: styles.mdiWrapper, key: 'primaryEditor' },
                React.createElement(MDI, { owningEditor: Constants.EDITOR_KEY_PRIMARY }));
        const tabGroup2 = this.props.secondaryEditor && Object.keys(this.props.secondaryEditor.documents).length ?
            React.createElement("div", { className: `${styles.mdiWrapper} ${styles.secondaryMdi}`, key: 'secondaryEditor' },
                React.createElement(MDI, { owningEditor: Constants.EDITOR_KEY_SECONDARY })) : null;
        // If falsy children aren't filtered out, splitter won't recognize change in number of children
        // (i.e. [child1, child2] -> [false, child2] is still seen as 2 children by the splitter)
        // TODO: Move this logic to splitter-side
        const tabGroups = [tabGroup1, tabGroup2].filter(tG => !!tG);
        // Explorer & TabGroup(s) pane
        const workbenchChildren = [];
        if (this.props.showingExplorer && !this.props.presentationModeEnabled) {
            workbenchChildren.push(React.createElement(ExplorerBar, { key: 'explorer-bar' }));
        }
        workbenchChildren.push(React.createElement(Splitter, { orientation: 'vertical', key: 'tab-group-splitter', minSizes: { 0: 160, 1: 160 } }, tabGroups));
        return (React.createElement("div", { className: styles.main },
            React.createElement("div", { className: styles.nav },
                !this.props.presentationModeEnabled &&
                    React.createElement(NavBar, { selection: this.props.navBarSelection, showingExplorer: this.props.showingExplorer }),
                React.createElement("div", { className: styles.workbench },
                    React.createElement(Splitter, { orientation: 'vertical', primaryPaneIndex: 0, minSizes: { 0: 40, 1: 40 }, initialSizes: { 0: 210 } }, workbenchChildren)),
                React.createElement(TabManager, { disabled: false })),
            !this.props.presentationModeEnabled && React.createElement(StatusBar, null),
            React.createElement(DialogHost, null),
            React.createElement(StoreVisualizer, { enabled: false })));
    }
}
//# sourceMappingURL=main.js.map