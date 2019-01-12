import { Dialog, DialogFooter, PrimaryButton } from "@bfemulator/ui-react";
import * as React from "react";
import { Component } from "react";

import * as styles from "../dialogStyles.scss";

export interface AzureLoginSuccessDialogState {
  rememberMeChecked: boolean;
}

export interface AzureLoginSuccessDialogProps {
  cancel: (persistLogin: boolean) => void;
  persistLogin: boolean;
}

export class AzureLoginFailedDialog extends Component<
  AzureLoginSuccessDialogProps,
  AzureLoginSuccessDialogState
> {
  constructor(
    props: AzureLoginSuccessDialogProps = {} as any,
    state: AzureLoginSuccessDialogState
  ) {
    super(props, state);
    this.state = { rememberMeChecked: !!props.persistLogin };
  }

  public render() {
    return (
      <Dialog
        title="Something went wrong!"
        cancel={this.onDialogCancel}
        className={styles.dialogMedium}
      >
        <p>
          {"Your authentication attempt was canceled or was not completed successfully. " +
            "You will need to authenticate with Azure before some services can be added to the emulator."}
        </p>
        <DialogFooter>
          <PrimaryButton text="Close" onClick={this.onDialogCancel} />
        </DialogFooter>
      </Dialog>
    );
  }

  private onDialogCancel = () => {
    this.props.cancel(this.state.rememberMeChecked);
  };
}
