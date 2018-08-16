import * as React from 'react';
import { Component } from 'react';
import { DefaultButton, Dialog, DialogFooter, PrimaryButton } from '@bfemulator/ui-react';
import * as styles from './azureLoginPromptDialog.scss';

export interface AzureLoginPromptDialogProps {
  cancel: () => void;
  confirm: () => void;
}

export class AzureLoginPromptDialog extends Component<AzureLoginPromptDialogProps, {}> {
  public render() {
    return (
      <Dialog cancel={ this.props.cancel } className={ styles.azureLoginPrompt } title="Sign in with an Azure account">
        <p>Use your Azure account to sign in to all your Azure services, such as Azure Bot Service, Dispatch,
          LUIS, ans QnA Maker.&nbsp;
          <a href="https://azure.microsoft.com/en-us/services/bot-service">Don't have an Azure Account? Sign up.</a>
        </p>
        <p>By signing in to your services, you can regiser any app in that service with your bot without having
          to enter in credentials manually.</p>
        <p>Learn more about registering services</p>
        <DialogFooter>
          <DefaultButton text="Cancel" onClick={ this.props.cancel }/>
          <PrimaryButton text="Sign in with Azure" onClick={ this.props.confirm }/>
        </DialogFooter>
      </Dialog>
    );
  }
}
