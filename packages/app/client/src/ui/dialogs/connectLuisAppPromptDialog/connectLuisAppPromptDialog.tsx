import * as React from 'react';
import { Component } from 'react';
import { DefaultButton, Dialog, DialogFooter, PrimaryButton } from '@bfemulator/ui-react';
import * as styles from './connectLuisAppPromptDialog.scss';

export interface ConnectLuisAppPromptDialogProps {
  cancel: () => void;
  confirm: () => void;
  addLuisAppManually: () => void;
}

export class ConnectLuisAppPromptDialog extends Component<ConnectLuisAppPromptDialogProps, {}> {
  public render() {
    return (
      <Dialog
        cancel={ this.props.cancel }
        className={ styles.connectLuisPrompt }
        title="Connect your bot to a LUIS application">
        <p>Sign into your Azure account to select the LUIS applications you'd like to associate with this bot.&nbsp;
          <a href="https://luis.ai">Learn more about LUIS</a>
        </p>
        <p>
          Alternatively, you can&nbsp;
          <a href="javascript:void(0);" onClick={ this.props.addLuisAppManually }>add a LUIS app manually</a>
          &nbsp;with the app ID, version and authoring key
        </p>
        <DialogFooter>
          <DefaultButton text="Cancel" onClick={ this.props.cancel }/>
          <PrimaryButton text="Sign in with Azure" onClick={ this.props.confirm }/>
        </DialogFooter>
      </Dialog>
    );
  }
}
