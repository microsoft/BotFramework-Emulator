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
import { Checkbox, DefaultButton, PrimaryButton } from '@bfemulator/ui-react';
import * as React from 'react';
import { Component } from 'react';
import * as styles from './luisModelsViewer.scss';
export class LuisModelsViewer extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {};
        this.onSelectAllChange = (event) => {
            const { luisModels = [] } = this.props;
            const { target } = event;
            const newState = {};
            luisModels.forEach(luisModel => {
                newState[luisModel.id] = target.checked ? luisModel : false;
            });
            this.setState(newState);
        };
        this.onAddClick = (_event) => {
            const { state } = this;
            const reducer = (models, luisModelId) => {
                if (state[luisModelId]) {
                    models.push(state[luisModelId]);
                }
                return models;
            };
            const addedModels = Object.keys(state).reduce(reducer, []);
            this.props.addLuisModels(addedModels);
        };
        this.onCancelClick = (_event) => {
            this.props.cancel();
        };
    }
    componentWillReceiveProps(nextProps = {}) {
        const { luisServices = [] } = nextProps;
        const state = luisServices
            .reduce((agg, luisService) => {
            agg[luisService.appId] = luisService;
            return agg;
        }, {});
        this.setState(state);
    }
    render() {
        const { state, props } = this;
        const keys = Object.keys(state);
        const checkAllChecked = props.luisModels
            .reduce((isTrue, luisModel) => state[luisModel.id] && isTrue, !!keys.length);
        return (React.createElement("section", { className: styles.luisModelsViewer },
            this.sectionHeader,
            React.createElement("div", { className: "listContainer" },
                React.createElement("p", null, "Selecting a LUIS app below will store the app ID in your bot file."),
                React.createElement("div", { className: "selectAll" },
                    React.createElement(Checkbox, { onChange: this.onSelectAllChange, checked: checkAllChecked, id: "select-all-luis-models", label: "Select all" })),
                React.createElement("ul", null, this.luisModelElements)),
            React.createElement("div", { className: "buttonGroup" },
                React.createElement(DefaultButton, { text: "Cancel", onClick: this.onCancelClick }),
                React.createElement(PrimaryButton, { text: "Add", onClick: this.onAddClick }))));
    }
    get sectionHeader() {
        return (React.createElement("header", null,
            React.createElement("button", { className: styles.closeButton, onClick: this.onCancelClick },
                React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "1 1 16 16" },
                    React.createElement("g", null,
                        React.createElement("polygon", { points: "14.1015625 2.6015625 8.7109375 8 14.1015625 13.3984375 13.3984375 14.1015625 8 8.7109375\n                2.6015625 14.1015625 1.8984375 13.3984375 7.2890625 8 1.8984375 2.6015625 2.6015625 1.8984375 8\n                7.2890625 13.3984375 1.8984375" })))),
            React.createElement("h3", null, "Add LUIS apps")));
    }
    get luisModelElements() {
        const { state, onChange } = this;
        const { luisModels } = this.props;
        return luisModels.map(luisModel => {
            const { id, name: label, culture, activeVersion } = luisModel;
            const checkboxProps = {
                label,
                checked: !!state[id],
                id: `model${id}`,
                onChange: onChange.bind(this, luisModel)
            };
            return (React.createElement("li", { key: id },
                React.createElement(Checkbox, Object.assign({}, checkboxProps, { className: "checkboxOverride" })),
                React.createElement("span", null,
                    "\u00A0-\u00A0version ",
                    activeVersion),
                React.createElement("span", null, culture)));
        });
    }
    onChange(luisModel, event) {
        const { target } = event;
        this.setState({ [luisModel.id]: target.checked ? luisModel : false });
    }
}
//# sourceMappingURL=luisModelsViewer.js.map