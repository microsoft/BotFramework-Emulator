import * as React from 'react';
import { Component } from 'react';
import { Checkbox, Dialog, DialogContent, DialogFooter, PrimaryButton } from '@bfemulator/ui-react';
import * as styles from './azureLoginSuccessDialog.scss';
export class AzureLoginSuccessDialog extends Component {
    constructor() {
        super(...arguments);
        this.state = { rememberMeChecked: false };
        this.onDialogCancel = (event) => {
            this.props.cancel(this.state.rememberMeChecked);
        };
        this.checkBoxChanged = (event, isChecked) => {
            this.setState({ rememberMeChecked: isChecked });
        };
    }
    render() {
        return (React.createElement(Dialog, { title: "Success!", cancel: this.onDialogCancel, className: styles.dialog },
            React.createElement(DialogContent, null,
                React.createElement("p", null, "You are now signed in with your Azure account"),
                React.createElement(Checkbox, { label: "Keep me signed in to the Bot Framework Emulator.", onChange: this.checkBoxChanged })),
            React.createElement(DialogFooter, null,
                React.createElement(PrimaryButton, { text: "Close", onClick: this.onDialogCancel }))));
    }
}
//# sourceMappingURL=azureLoginSuccessDialog.js.map