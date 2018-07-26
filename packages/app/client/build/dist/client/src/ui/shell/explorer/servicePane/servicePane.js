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
import { ExpandCollapse, ExpandCollapseContent, ExpandCollapseControls } from '@bfemulator/ui-react';
import * as React from 'react';
import { Component } from 'react';
import * as styles from './servicePane.scss';
export class ServicePane extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {};
        this.onContextMenu = (event) => {
            const { listRef } = this;
            let target = event.target;
            while (target && target.tagName !== 'LI') {
                target = target.parentElement;
            }
            if (!target || target.tagName !== 'LI' || !listRef.contains(target)) {
                return;
            }
            event.preventDefault();
            event.stopPropagation();
            this.onContextMenuOverLiElement(target);
        };
    }
    get controls() {
        return (React.createElement(ExpandCollapseControls, null,
            React.createElement("span", { className: styles.servicePane },
                React.createElement("button", { onClick: this.onAddIconClick, className: styles.addIconButton },
                    React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 25 25" },
                        React.createElement("g", null,
                            React.createElement("path", { d: "M0 10L10 10 10 0 15 0 15 10 25 10 25 15 15 15 15 25 10 25 10 15 0 15" })))))));
    }
    get content() {
        const { links, emptyContent } = this;
        if (!links || !links.length) {
            return (React.createElement(ExpandCollapseContent, null, emptyContent));
        }
        return (React.createElement(ExpandCollapseContent, null,
            React.createElement("ul", { className: styles.servicePaneList, ref: ul => this.listRef = ul }, links)));
    }
    get emptyContent() {
        return (React.createElement("p", { className: styles.emptyContent },
            "You have not saved any ",
            this.props.title,
            " apps to this bot."));
    }
    get listRef() {
        return this._listRef;
    }
    set listRef(value) {
        const { window } = this.props;
        window.removeEventListener('contextmenu', this.onContextMenu, true);
        const ref = this._listRef = value;
        if (ref) {
            window.addEventListener('contextmenu', this.onContextMenu, true);
        }
    }
    render() {
        return (React.createElement(ExpandCollapse, { className: styles.servicePane, key: this.props.title, title: this.props.title, expanded: this.state.expanded },
            this.controls,
            this.content));
    }
    onContextMenuOverLiElement(li) {
        const { window } = this.props;
        const { document } = window;
        li.setAttributeNode(document.createAttribute('data-selected')); // Boolean attribute
        const deselectLiElement = function () {
            window.removeEventListener('click', deselectLiElement, true);
            window.removeEventListener('contextmenu', deselectLiElement, true);
            li.removeAttribute('data-selected');
        };
        window.addEventListener('click', deselectLiElement, true);
        window.addEventListener('contextmenu', deselectLiElement, true);
    }
}
//# sourceMappingURL=servicePane.js.map