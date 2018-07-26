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
import { AzureBotService } from 'msbot/bin/models';
import * as React from 'react';
import { Component } from 'react';
const title = 'Connect to Azure Bot Service';
const detailedDescription = 'Connect your bot to a registration in the Azure Bot Service portal';
export class AzureBotServiceEditor extends Component {
    constructor(props, state) {
        super(props, state);
        this.state = {};
        this._textFieldHandlers = {};
        this.onCancelClick = () => {
            this.props.cancel();
        };
        this.onSubmitClick = () => {
            this.props.updateAzureBotService(this.state.azureBotService);
        };
        this.onInputChange = (propName, required, value) => {
            const trimmedValue = value.trim();
            const { azureBotService: originalAzureBotService } = this.props;
            const errorMessage = (required && !trimmedValue) ? `The field cannot be empty` : '';
            const { azureBotService } = this.state;
            azureBotService[propName] = value;
            const isDirty = Object.keys(azureBotService)
                .reduce((dirty, key) => (dirty || azureBotService[key] !== originalAzureBotService[key]), false);
            this.setState({ azureBotService, [`${propName}Error`]: errorMessage, isDirty });
        };
        const azureBotService = new AzureBotService(props.azureBotService);
        this.state = {
            azureBotService,
            isDirty: false,
            idError: '',
            nameError: '',
            tenantIdError: '',
            subscriptionIdError: '',
            resourceGroupError: ''
        };
        this._textFieldHandlers = {
            'name': this.onInputChange.bind(this, 'name', true),
            'id': this.onInputChange.bind(this, 'id', true),
            'tenantId': this.onInputChange.bind(this, 'tenantId', true),
            'subscriptionId': this.onInputChange.bind(this, 'subscriptionId', true),
            'resourceGroup': this.onInputChange.bind(this, 'resourceGroup', true)
        };
    }
    componentWillReceiveProps(nextProps) {
        const azureBotService = new AzureBotService(nextProps.azureBotService);
        this.setState({ azureBotService });
    }
    render() {
        const { azureBotService, idError, nameError, isDirty, tenantIdError, subscriptionIdError, resourceGroupError } = this.state;
        const { name = '', id = '', tenantId = '', subscriptionId = '', resourceGroup = '' } = azureBotService;
        const valid = !tenantIdError && !subscriptionIdError && !resourceGroupError && !idError && !nameError;
        return (React.createElement(Dialog, { title: title, detailedDescription: detailedDescription, cancel: this.onCancelClick },
            React.createElement(DialogContent, null,
                React.createElement(TextField, { errorMessage: nameError, value: name, onChanged: this._textFieldHandlers.name, label: "Bot Name", required: true }),
                React.createElement(TextField, { errorMessage: idError, value: id, onChanged: this._textFieldHandlers.id, label: "Azure Bot Id", required: true }),
                React.createElement(TextField, { errorMessage: tenantIdError, value: tenantId, onChanged: this._textFieldHandlers.tenantId, label: "Azure Tenant Id", required: true, "data-propname": "tenantId" }),
                React.createElement(TextField, { errorMessage: subscriptionIdError, value: subscriptionId, onChanged: this._textFieldHandlers.subscriptionId, label: "Azure Subscription Id", required: true }),
                React.createElement(TextField, { errorMessage: resourceGroupError, value: resourceGroup, onChanged: this._textFieldHandlers.resourceGroup, label: "Azure Resource Group", required: true })),
            React.createElement(DialogFooter, null,
                React.createElement(DefaultButton, { text: "Cancel", onClick: this.onCancelClick }),
                React.createElement(PrimaryButton, { disabled: !isDirty || !valid, text: "Submit", onClick: this.onSubmitClick }))));
    }
}
//# sourceMappingURL=azureBotServiceEditor.js.map