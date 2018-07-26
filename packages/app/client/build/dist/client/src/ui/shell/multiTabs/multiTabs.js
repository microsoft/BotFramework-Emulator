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
import { connect } from 'react-redux';
import * as styles from './multiTabs.scss';
import { Content as TabbedDocumentContent, Tab as TabbedDocumentTab, TabBar } from './index';
import { filterChildren, hmrSafeNameComparison } from '@bfemulator/ui-react';
class MultiTabsComponent extends React.Component {
    constructor(props) {
        super(props);
        this.childRefs = [];
        this.handleTabClick = (nextValue) => {
            if (this.props.onChange) {
                this.props.onChange(nextValue);
            }
        };
        this.setRef = (input) => {
            this.childRefs.push(input);
        };
    }
    render() {
        return (React.createElement("div", { className: styles.multiTabs },
            !this.props.presentationModeEnabled &&
                React.createElement(TabBar, { owningEditor: this.props.owningEditor, childRefs: this.childRefs, activeIndex: this.props.value }, React.Children.map(this.props.children, (tabbedDocument, index) => React.createElement("button", { className: styles.tab, onClick: this.handleTabClick.bind(this, index), ref: this.setRef }, filterChildren(tabbedDocument.props.children, child => hmrSafeNameComparison(child.type, TabbedDocumentTab))))),
            !!this.props.children.length && React.Children.map(this.props.children, (tabbedDocument, index) => filterChildren(tabbedDocument.props.children, child => hmrSafeNameComparison(child.type, TabbedDocumentContent)).map(child => child && React.cloneElement(child, { hidden: index !== this.props.value })))));
    }
}
const mapStateToProps = (state) => ({
    presentationModeEnabled: state.presentation.enabled
});
export const MultiTabs = connect(mapStateToProps)(MultiTabsComponent);
//# sourceMappingURL=multiTabs.js.map