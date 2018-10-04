import * as React from 'react';
import { Component } from 'react';
import { DefaultButton, Dialog, DialogFooter, PrimaryButton } from '@bfemulator/ui-react';

export interface AzureLoginPromptDialogProps {
  cancel: () => void;
  confirm: () => void;
  onAnchorClick: (url: string) => void;
}

export class AzureLoginPromptDialog extends Component<AzureLoginPromptDialogProps, {}> {
  public render() {
    return (
      <Dialog cancel={ this.props.cancel } title="Sign in with an Azure account">
        <p>Use your Azure account to sign in to all your Azure services,<br/>
          such as Azure Bot Service, Dispatch, LUIS, and QnA Maker.<br/>
          <a href="javascript:void(0);" onClick={ this.onLearnMoreAzureAccount }>
            Don't have an Azure Account? Sign up.
          </a>
        </p>
        <p>By signing in to your services, you can register any app in that<br/>
          service with your bot without having to enter in credentials manually.</p>
        <p>
          <a href="javascript:void(0);" onClick={ this.onLearnMoreRegister }>
            Learn more about registering services
          </a>
        </p>
        <DialogFooter>
          <DefaultButton text="Cancel" onClick={ this.props.cancel } />
          <PrimaryButton text="Sign in with Azure" onClick={ this.props.confirm } />
        </DialogFooter>
      </Dialog>
    );
  }

  private onLearnMoreAzureAccount = () => {
    this.props.onAnchorClick('https://azure.microsoft.com/en-us/services/bot-service');
  }

  private onLearnMoreRegister = () => {
    this.props.onAnchorClick('https://aka.ms/about-bot-file');
  }
}
