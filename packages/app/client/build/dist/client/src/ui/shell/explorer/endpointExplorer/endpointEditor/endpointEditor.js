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
import { DefaultButton, Dialog, DialogContent, DialogFooter, PrimaryButton, TextField } from '@bfemulator/ui-react';
import { EndpointService } from 'msbot/bin/models';
import * as React from 'react';
import { Component } from 'react';
const title = 'Add a Endpoint for your bot';
const detailedDescription = 'You can add a endpoint that you use to communicate to an instance of your bot';
export class EndpointEditor extends Component {
    constructor(props, state) {
        super(props, state);
        this.state = {};
        this._textFieldHandler = {};
        this.onCancelClick = () => {
            this.props.cancel();
        };
        this.onSubmitClick = () => {
            this.props.updateEndpointService(this.state.endpointService);
        };
        this.onInputChange = (propName, required, value) => {
            const trimmedValue = value.trim();
            const { endpointService: originalEndpointService } = this.props;
            const errorMessage = (required && !trimmedValue) ? `The field cannot be empty` : '';
            const { endpointService } = this.state;
            endpointService[propName] = value;
            const isDirty = Object.keys(endpointService)
                .reduce((dirty, key) => (dirty || endpointService[key] !== originalEndpointService[key]), false);
            this.setState({ endpointService, [`${propName}Error`]: errorMessage, isDirty });
        };
        const endpointService = new EndpointService(props.endpointService);
        this.state = {
            endpointService,
            nameError: '',
            endpointError: '',
            appPasswordError: '',
            appIdError: '',
            isDirty: false
        };
        this._textFieldHandler = {
            'name': this.onInputChange.bind(this, 'name', true),
            'endpoint': this.onInputChange.bind(this, 'endpoint', true),
            'appId': this.onInputChange.bind(this, 'appId', false),
            'appPassword': this.onInputChange.bind(this, 'appPassword', false)
        };
    }
    componentWillReceiveProps(nextProps) {
        const endpointService = new EndpointService(nextProps.endpointService);
        this.setState({ endpointService, appIdError: '', appPasswordError: '', endpointError: '', nameError: '' });
    }
    render() {
        const { endpointService, appIdError, appPasswordError, endpointError, nameError, isDirty } = this.state;
        const { name = '', endpoint = '', appId = '', appPassword = '' } = endpointService;
        const valid = !!endpoint && !!name;
        return (React.createElement(Dialog, { title: title, detailedDescription: detailedDescription, cancel: this.onCancelClick },
            React.createElement(DialogContent, null,
                React.createElement(TextField, { errorMessage: nameError, value: name, onChanged: this._textFieldHandler.name, label: "Name", required: true }),
                React.createElement(TextField, { errorMessage: endpointError, value: endpoint, onChanged: this._textFieldHandler.endpoint, label: "Endpoint url", required: true }),
                React.createElement(TextField, { errorMessage: appIdError, value: appId, onChanged: this._textFieldHandler.appId, label: "Application Id", required: false }),
                React.createElement(TextField, { errorMessage: appPasswordError, value: appPassword, onChanged: this._textFieldHandler.appPassword, label: "Application Password", required: false })),
            React.createElement(DialogFooter, null,
                React.createElement(DefaultButton, { text: "Cancel", onClick: this.onCancelClick }),
                React.createElement(PrimaryButton, { disabled: !isDirty || !valid, text: "Submit", onClick: this.onSubmitClick }))));
    }
}
//# sourceMappingURL=endpointEditor.js.map