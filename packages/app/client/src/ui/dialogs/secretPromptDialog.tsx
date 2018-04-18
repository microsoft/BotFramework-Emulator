import * as React from 'react';
import { css } from 'glamor';

import { Colors, PrimaryButton, TextInputField, Row, RowJustification, Column, MediumHeader, SmallHeader } from '@bfemulator/ui-react';
import { DialogService } from './service/index';

const CSS = css({
  backgroundColor: Colors.EDITOR_TAB_BACKGROUND_DARK,
  padding: '32px',
  width: '480px',

  '& .button-row': {
    marginTop: '48px',

    '& > .save-button': {
      marginLeft: '8px'
    }
  }
});

interface SecretPromptDialogState {
  secret: string;
}

export default class SecretPromptDialog extends React.Component<{}, SecretPromptDialogState> {
  constructor(props, context) {
    super(props, context);

    this.state = { secret: '' };
  }

  private onClickDismiss = (e) => {
    DialogService.hideDialog(null);
  }

  private onClickSave = (e) => {
    // return the secret
    DialogService.hideDialog(this.state.secret);
  }

  private onChangeSecret = (e) => {
    this.setState({ secret: e.target.value });
  }

  render(): JSX.Element {
    return (
      <div { ...CSS }>
        <Column>
          <MediumHeader>Bot secret required!</MediumHeader>
          <SmallHeader>Please enter your bot's secret</SmallHeader>
          <TextInputField value={ this.state.secret } onChange={ this.onChangeSecret } label={ 'Bot secret' } type={ 'password' } />
          <Row className="button-row" justify={ RowJustification.Right }>
              <PrimaryButton secondary text={ 'Dismiss' } onClick={ this.onClickDismiss } />
              <PrimaryButton className="save-button" text={ 'Save' } onClick={ this.onClickSave } />
          </Row>
        </Column>
      </div>
    );
  }
}
