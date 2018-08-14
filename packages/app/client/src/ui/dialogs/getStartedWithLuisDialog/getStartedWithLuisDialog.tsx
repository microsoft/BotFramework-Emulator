import * as React from 'react';
import { Component } from 'react';
import { DefaultButton, Dialog, DialogFooter, PrimaryButton } from '@bfemulator/ui-react';
import * as styles from './getStartedWithLuisDialog.scss';

export interface GetStartedWithLuisDialogProps {
  cancel: () => void;
  confirm: () => void;
  addLuisAppManually: () => void;
}

export class GetStartedWithLuisDialog extends Component<GetStartedWithLuisDialogProps, {}> {
  public render() {
    return (
      <Dialog
        cancel={ this.props.cancel }
        className={ styles.getStartedWithLuis }
        title="Create a LUIS app">
        <p>Language Understanding Service (LUIS) is a maching learning-based service for adding language
          understanding to bots, applications and IoT Devices
        </p>
        <p>You have not signed up for a LUIS account under { } </p>
        <a href="javascript:void(0);" onClick={ this.props.addLuisAppManually }>Add a LUIS app manually</a>
        <DialogFooter>
          <DefaultButton text="Cancel" onClick={ this.props.cancel }/>
          <PrimaryButton text="Sign up for LUIS" onClick={ this.props.confirm }/>
        </DialogFooter>
      </Dialog>
    );
  }
}
