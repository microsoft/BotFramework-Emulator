import * as React from 'react';
import { Component, MouseEvent } from 'react';
import { Checkbox, Dialog, DialogContent, DialogFooter, PrimaryButton } from '@bfemulator/ui-react';
import * as styles from './azureLoginSuccessDialog.scss';

export interface AzureLoginSuccessDialogState {
  rememberMeChecked: boolean;
  cancel: (persistLogin: boolean) => void;
}

export interface AzureLoginSuccessDialogProps {
  rememberMe: boolean;
}

export class AzureLoginSuccessDialog extends Component<AzureLoginSuccessDialogState, AzureLoginSuccessDialogState> {
  public state = { rememberMeChecked: false } as AzureLoginSuccessDialogState;

  constructor(props: AzureLoginSuccessDialogProps, state: AzureLoginSuccessDialogState) {
    super(state, props);
  }

  public render() {
    return (
      <Dialog title="Success!" cancel={ this.onDialogCancel } className={ styles.dialog }>
        <DialogContent>
          <p>You are now signed in with your Azure account</p>
          <Checkbox
            label="Keep me signed in to the Bot Framework Emulator."
            onChange={ this.checkBoxChanged }
          />
        </DialogContent>
        <DialogFooter>
          <PrimaryButton
            text="Close"
            onClick={ this.onDialogCancel }
            className="connect-button"
          />
        </DialogFooter>
      </Dialog>
    );
  }

  private onDialogCancel = (event: MouseEvent<HTMLDivElement | HTMLButtonElement>) => {
    this.props.cancel(this.state.rememberMeChecked);
  }

  private checkBoxChanged = (event: MouseEvent<HTMLInputElement>, isChecked: boolean) => {
    this.setState({ rememberMeChecked: isChecked });
  }
}
