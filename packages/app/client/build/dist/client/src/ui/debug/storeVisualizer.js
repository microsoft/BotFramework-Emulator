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
import * as styles from './storeVisualizer.scss';
import { PrimaryButton } from '@bfemulator/ui-react';
/** Transparent overlay that helps visualize a selected slice of the state */
class StoreVisualizerComponent extends React.Component {
    constructor(props) {
        super(props);
        this.toggleShowing = this.toggleShowing.bind(this);
        this.onSelectSlice = this.onSelectSlice.bind(this);
        this.state = {
            showing: true,
            selectedSlice: 'editor'
        };
    }
    toggleShowing() {
        this.setState({ showing: !this.state.showing });
    }
    onSelectSlice(e) {
        this.setState({ selectedSlice: e.target.value });
    }
    get content() {
        const { showing, selectedSlice } = this.state;
        const { rootState } = this.props;
        if (showing) {
            const prettyState = JSON.stringify(rootState[selectedSlice], null, 2);
            return (React.createElement(React.Fragment, null,
                React.createElement("select", { value: selectedSlice, onChange: this.onSelectSlice },
                    React.createElement("option", { value: "assetExplorer" }, "Asset Explorer"),
                    React.createElement("option", { value: "bot" }, "Bot"),
                    React.createElement("option", { value: "chat" }, "Chat"),
                    React.createElement("option", { value: "dialog" }, "Dialog"),
                    React.createElement("option", { value: "editor" }, "Editor"),
                    React.createElement("option", { value: "explorer" }, "Explorer"),
                    React.createElement("option", { value: "navBar" }, "NavBar"),
                    React.createElement("option", { value: "presentation" }, "Presentation"),
                    React.createElement("option", { value: "server" }, "Server")),
                React.createElement("pre", null, prettyState),
                React.createElement(PrimaryButton, { text: "Hide Visualizer", className: styles.visualizerButton, onClick: this.toggleShowing })));
        }
        else {
            return (React.createElement(PrimaryButton, { text: "Show visualizer", className: styles.visualizerButton, onClick: this.toggleShowing }));
        }
    }
    render() {
        return this.props.enabled ? (React.createElement("div", { className: styles.storeVisualizer },
            " ",
            this.content)) : null;
    }
}
const mapStateToProps = (state) => ({ rootState: state });
export const StoreVisualizer = connect(mapStateToProps)(StoreVisualizerComponent);
//# sourceMappingURL=storeVisualizer.js.map