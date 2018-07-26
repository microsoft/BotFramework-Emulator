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
import { Detail } from '../parts';
import Panel, { PanelContent, PanelControls } from '../../panel/panel';
import { ExtensionManager } from '../../../../extensions';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib-commonjs/Spinner';
import * as styles from './detailPanel.scss';
class DetailPanel extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.onAccessoryClick = (id) => {
            if (this.detailRef) {
                this.detailRef.accessoryClick(id);
            }
        };
        this.onToggleDevToolsClick = () => {
            if (this.detailRef) {
                this.detailRef.toggleDevTools();
            }
        };
        this.enableAccessory = (id, enable) => {
            const button = this.state.buttons.find(buttonArg => buttonArg.config.id === id);
            if (button) {
                if (button.enabled !== enable) {
                    button.enabled = enable;
                    this.setState(this.state);
                }
            }
        };
        this.setAccessoryState = (id, state) => {
            const button = this.state.buttons.find(buttonArg => buttonArg.config.id === id);
            if (button && button.state !== state) {
                const { config } = button;
                if (config.states[state]) {
                    button.state = state;
                    this.setState(this.state);
                }
            }
        };
        this.setInspectortitle = (title) => {
            this.setState(Object.assign({}, this.state, { title }));
        };
        this.state = {
            extension: null,
            inspector: null,
            buttons: [],
            inspectObj: null,
            title: ''
        };
    }
    componentDidUpdate() {
        let inspector = null;
        let extension = null;
        const getInsp = this.getInspector();
        if (getInsp.response) {
            inspector = getInsp.response.inspector;
            extension = getInsp.response.extension;
        }
        if (this.state.inspector !== inspector || this.state.inspectObj !== getInsp.inspectObj) {
            const accessories = inspector ? inspector.accessories || [] : [];
            const title = inspector ? inspector.name || '' : '';
            this.setState({
                inspectObj: getInsp.inspectObj,
                title,
                inspector,
                extension,
                // Copy the accessories from the new inspector to this.state
                buttons: accessories.map(config => {
                    // Accessory must have a "default" state to be added
                    if (config && config.states.default) {
                        return {
                            config,
                            state: 'default',
                            enabled: true
                        };
                    }
                    else {
                        return null;
                    }
                }).filter(accessoryState => !!accessoryState) || []
            });
        }
    }
    renderAccessoryIcon(config) {
        if (config.icon === 'Spinner') {
            return (React.createElement(Spinner, { className: styles.accessoryButtonIcon, size: SpinnerSize.xSmall }));
        }
        else if (config.icon) {
            return (React.createElement("i", { className: `${styles.accessoryButtonIcon} ms-Icon ms-Icon--${config.icon}`, "aria-hidden": "true" }));
        }
        else {
            return false;
        }
    }
    renderAccessoryButton(button, handler) {
        const { config, state, enabled } = button;
        const currentState = config.states[state] || {};
        return (React.createElement("button", { className: styles.accessoryButton, key: config.id, disabled: !enabled, onClick: () => handler(config.id) },
            this.renderAccessoryIcon(currentState),
            currentState.label));
    }
    renderAccessoryButtons(_inspector) {
        return (React.createElement(PanelControls, null, this.state.buttons.map(a => this.renderAccessoryButton(a, this.onAccessoryClick))));
    }
    render() {
        if (this.state.inspector) {
            // TODO - localization
            return (React.createElement("div", { className: styles.detailPanel },
                React.createElement(Panel, { title: ['inspector', this.state.title].filter(s => s && s.length).join(' - ') },
                    this.renderAccessoryButtons(this.state.inspector),
                    React.createElement(PanelContent, null,
                        React.createElement(Detail, { ref: ref => this.detailRef = ref, bot: this.props.bot, document: this.props.document, inspectObj: this.state.inspectObj, extension: this.state.extension, inspector: this.state.inspector, enableAccessory: this.enableAccessory, setAccessoryState: this.setAccessoryState, setInspectorTitle: this.setInspectortitle })))));
        }
        else {
            return (
            // No inspector was found.
            React.createElement("div", { className: styles.detailPanel },
                React.createElement(Panel, { title: `inspector` })));
        }
    }
    getInspector() {
        let obj = this.props.document.inspectorObjects && this.props.document.inspectorObjects.length ?
            this.props.document.inspectorObjects[0] : null;
        return {
            inspectObj: obj,
            // Find an inspector for this object.
            response: obj ? ExtensionManager.inspectorForObject(obj, true) : null
        };
    }
}
function mapStateToProps(state, ownProps) {
    return Object.assign({}, ownProps, { bot: state.bot.activeBot });
}
export default connect(mapStateToProps)(DetailPanel);
//# sourceMappingURL=detailPanel.js.map