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
import * as styles from './host.scss';
import * as React from 'react';
import { connect } from 'react-redux';
import { DialogService } from '../service';
class DialogHostComponent extends React.Component {
    constructor(props) {
        super(props);
        this.handleOverlayClick = (event) => {
            event.stopPropagation();
            DialogService.hideDialog();
        };
        this.handleContentClick = (event) => {
            // need to stop clicks inside the dialog from bubbling up to the overlay
            event.stopPropagation();
        };
        this.saveHostRef = (elem) => {
            DialogService.setHost(elem);
            this._hostRef = elem;
        };
        this.getFocusableElementsInModal = () => {
            if (this._hostRef) {
                return this._hostRef.querySelectorAll('[tabIndex]:not([tabIndex="-1"])');
            }
            return new NodeList();
        };
        this.initFocusTrap = () => {
            const allFocusableElements = this.getFocusableElementsInModal();
            if (allFocusableElements.length) {
                const firstChild = allFocusableElements[0];
                firstChild.focus();
            }
        };
        // Reached begining of focusable items inside the modal host; re-focus the last item
        this.onFocusStartingSentinel = (e) => {
            e.preventDefault();
            const allFocusableElements = this.getFocusableElementsInModal();
            if (allFocusableElements.length) {
                let lastChild = allFocusableElements[allFocusableElements.length - 1];
                if (lastChild.hasAttribute('disabled')) {
                    // focus the last element in the list that isn't disabled
                    for (let i = allFocusableElements.length - 2; i >= 0; i--) {
                        lastChild = allFocusableElements[i];
                        if (!lastChild.hasAttribute('disabled')) {
                            lastChild.focus();
                            break;
                        }
                    }
                }
                else {
                    lastChild.focus();
                }
            }
        };
        // Reached end of focusable items inside the modal host; re-focus the first item
        this.onFocusEndingSentinel = (e) => {
            e.preventDefault();
            const allFocusableElements = this.getFocusableElementsInModal();
            if (allFocusableElements.length) {
                let firstChild = allFocusableElements[0];
                if (firstChild.hasAttribute('disabled')) {
                    // focus the first element in the list that isn't disabled
                    for (let i = 1; i <= allFocusableElements.length - 1; i++) {
                        firstChild = allFocusableElements[i];
                        if (!firstChild.hasAttribute('disabled')) {
                            firstChild.focus();
                            break;
                        }
                    }
                }
                else {
                    firstChild.focus();
                }
            }
        };
    }
    componentDidMount() {
        this._hostRef.addEventListener('dialogRendered', this.initFocusTrap);
    }
    render() {
        const visibilityClass = this.props.showing ? styles.dialogHostVisible : '';
        // sentinels shouldn't be tab-able when dialog is hidden
        const sentinelTabIndex = this.props.showing ? 0 : -1;
        return (React.createElement("div", { className: `${styles.host} ${visibilityClass}`, onClick: this.handleOverlayClick },
            React.createElement("span", { tabIndex: sentinelTabIndex, onFocus: this.onFocusStartingSentinel, className: styles.focusSentinel }),
            React.createElement("div", { className: styles.dialogHostContent, onClick: this.handleContentClick, ref: this.saveHostRef }),
            React.createElement("span", { tabIndex: sentinelTabIndex, onFocus: this.onFocusEndingSentinel, className: styles.focusSentinel })));
    }
}
function mapStateToProps(state) {
    return ({ showing: state.dialog.showing });
}
export const DialogHost = connect(mapStateToProps)(DialogHostComponent);
//# sourceMappingURL=host.js.map