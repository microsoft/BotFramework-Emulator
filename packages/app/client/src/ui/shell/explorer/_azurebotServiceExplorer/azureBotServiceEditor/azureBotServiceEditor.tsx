import { IAzureBotService } from '@bfemulator/sdk-shared';
import { Modal, ModalActions, ModalContent, PrimaryButton, TextInputField } from '@bfemulator/ui-react';
import * as React from 'react';
import { Component, SyntheticEvent } from 'react';

interface AzureBotServiceEditorProps {
  azureBotService: IAzureBotService,
  cancel: () => void,
  updateAzureBotService: (updatedAzureBotService: IAzureBotService) => void;
}

const title = 'Connect to Azure Bot Service';
const detailedDescription = 'Connect your bot to a registration in the Azure Bot Service portal';
const modalCssOverrides = {
  width: '400px',
  height: '400px'
};

export class AzureBotServiceEditor extends Component<AzureBotServiceEditorProps, IAzureBotService> {

  public state: IAzureBotService = {} as IAzureBotService;

  constructor(props, state) {
    super(props, state);
    this.state = props.azureBotService;
  }

  public componentWillReceiveProps(nextProps: Readonly<AzureBotServiceEditorProps>): void {
    this.setState({ ...nextProps.azureBotService });
  }

  public render(): JSX.Element {
    const { name, id, appId } = this.state;
    return (
      <Modal cssOverrides={ modalCssOverrides } title={ title } detailedDescription={ detailedDescription } cancel={ this.onCancelClick }>
        <ModalContent>
          <TextInputField value={ name } onChange={ this.onInputChange } label="Name" required={ true } inputAttributes={ { 'data-propName': 'name' } }/>
          <TextInputField value={ id } onChange={ this.onInputChange } label="Bot Id" required={ true } inputAttributes={ { 'data-propName': 'id' } }/>
          <TextInputField value={ appId } onChange={ this.onInputChange } label="Application Id" required={ true } inputAttributes={ { 'data-propName': 'appId' } }/>
        </ModalContent>
        <ModalActions>
          <PrimaryButton text="Cancel" secondary={ true } onClick={ this.onCancelClick }/>
          <PrimaryButton text="Submit" onClick={ this.onSubmitClick }/>
        </ModalActions>
      </Modal>
    );
  }

  private onCancelClick = (event: SyntheticEvent<HTMLButtonElement>): void => {
    this.props.cancel();
  };

  private onSubmitClick = (event: SyntheticEvent<HTMLButtonElement>): void => {
    this.props.updateAzureBotService(this.state);
  };

  private onInputChange = (event: SyntheticEvent<HTMLInputElement>): void => {
    const { currentTarget: input } = event;
    const propName = input.getAttribute('data-propName');
    this.setState({ [propName as any]: input.value });
  };
}
