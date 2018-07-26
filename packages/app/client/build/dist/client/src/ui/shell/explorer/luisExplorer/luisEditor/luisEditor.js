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
import { LuisService } from 'msbot/bin/models';
import { DefaultButton, Dialog, DialogContent, DialogFooter, PrimaryButton, TextField } from '@bfemulator/ui-react';
import * as React from 'react';
import { Component } from 'react';
const title = 'Connect to a Azure Application';
const detailedDescription = 'You can connect your bot to a Azure.ai application';
export class LuisEditor extends Component {
    constructor(props, state) {
        super(props, state);
        this.state = {};
        this._textFieldHandlers = {};
        this.onCancelClick = () => {
            this.props.cancel();
        };
        this.onSubmitClick = () => {
            this.props.updateLuisService(this.state.luisService);
        };
        this.onInputChange = (propName, required, value) => {
            const trimmedValue = value.trim();
            const { luisService: originalLuisService } = this.props;
            const errorMessage = (required && !trimmedValue) ? `The field cannot be empty` : '';
            const { luisService } = this.state;
            luisService[propName] = value;
            const isDirty = Object.keys(luisService)
                .reduce((dirty, key) => (dirty || luisService[key] !== originalLuisService[key]), false);
            this.setState({ luisService, [`${propName}Error`]: errorMessage, isDirty });
        };
        const luisService = new LuisService(props.luisService);
        this.state = {
            luisService,
            nameError: '',
            appIdError: '',
            authoringKeyError: '',
            versionError: '',
            subscriptionKeyError: '',
            isDirty: false
        };
        this._textFieldHandlers = {
            name: this.onInputChange.bind(this, 'name', true),
            appId: this.onInputChange.bind(this, 'appId', true),
            authoringKey: this.onInputChange.bind(this, 'authoringKey', true),
            version: this.onInputChange.bind(this, 'version', true),
            subscriptionKey: this.onInputChange.bind(this, 'subscriptionKey', false)
        };
    }
    componentWillReceiveProps(nextProps) {
        const luisService = new LuisService(nextProps.luisService);
        this.setState({ luisService });
    }
    render() {
        const { onCancelClick, onSubmitClick } = this;
        const { luisService, nameError, appIdError, authoringKeyError, versionError, subscriptionKeyError, isDirty } = this.state;
        const { name = '', appId = '', authoringKey = '', subscriptionKey = '', version = '' } = luisService;
        const valid = !!name && !!appId && !!authoringKey && !!version;
        return (React.createElement(Dialog, { title: title, detailedDescription: detailedDescription, cancel: onCancelClick },
            React.createElement(DialogContent, null,
                React.createElement(TextField, { errorMessage: nameError, value: name, onChanged: this._textFieldHandlers.name, label: "Name", required: true }),
                React.createElement(TextField, { errorMessage: appIdError, value: appId, onChanged: this._textFieldHandlers.appId, label: "Application Id", required: true }),
                React.createElement(TextField, { errorMessage: authoringKeyError, value: authoringKey, onChanged: this._textFieldHandlers.authoringKey, label: "Authoring key", required: true, "data-propname": "authoringKey" }),
                React.createElement(TextField, { errorMessage: versionError, value: version, onChanged: this._textFieldHandlers.version, label: "Version", required: true }),
                React.createElement(TextField, { errorMessage: subscriptionKeyError, value: subscriptionKey, onChanged: this._textFieldHandlers.subscriptionKey, label: "Subscription key", required: false })),
            React.createElement(DialogFooter, null,
                React.createElement(DefaultButton, { text: "Cancel", onClick: onCancelClick }),
                React.createElement(PrimaryButton, { disabled: !isDirty || !valid, text: "Submit", onClick: onSubmitClick }))));
    }
}
//# sourceMappingURL=luisEditor.js.map