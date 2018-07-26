import * as React from 'react';
import { Component } from 'react';
import { DefaultButton, Dialog, DialogContent, DialogFooter, PrimaryButton } from '@bfemulator/ui-react';
import * as styles from './azureLoginPromptDialog.scss';
export class AzureLoginPromptDialog extends Component {
    render() {
        return (React.createElement(Dialog, { cancel: this.props.cancel, className: styles.azureLoginPrompt, title: "Sign in with an Azure account" },
            React.createElement(DialogContent, null,
                React.createElement("p", null,
                    "Use your Azure account to sign in to all your Azure services, such as Azure Bot Service, Dispatch, LUIS, ans QnA Maker.",
                    React.createElement("a", { href: "https://azure.microsoft.com/en-us/services/bot-service" }, "Don't have an Azure Account? Sign up.")),
                React.createElement("p", null, "By signing in to your services, you can regiser any app in that service with your bot without having to enter in credentials manually."),
                React.createElement("p", null, "Learn more about registering services")),
            React.createElement(DialogFooter, null,
                React.createElement(DefaultButton, { text: "Cancel", onClick: this.props.cancel }),
                React.createElement(PrimaryButton, { text: "Sign in with Azure", onClick: this.props.confirm }))));
    }
}
//# sourceMappingURL=azureLoginPromptDialog.js.map