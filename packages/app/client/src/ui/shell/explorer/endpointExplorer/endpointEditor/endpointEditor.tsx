import { IEndpointService, uniqueId } from '@bfemulator/sdk-shared';
import { Modal, ModalActions, ModalContent, PrimaryButton, TextInputField } from '@bfemulator/ui-react';
import * as React from 'react';
import { Component, SyntheticEvent } from 'react';

interface EndpointEditorProps {
  endpointService: IEndpointService,
  cancel: () => void,
  updateEndpointService: (updatedEndpointService: IEndpointService) => void;
}

const title = 'Add a Endpoint for your bot';
const detailedDescription = 'You can add a endpoint that you use to communicate to an instance of your bot';
const modalCssOverrides = {
  width: '400px',
  height: '500px'
};

export class EndpointEditor extends Component<EndpointEditorProps, IEndpointService> {

  public state: IEndpointService = {} as IEndpointService;

  constructor(props, state) {
    super(props, state);
    this.state = props.endpointService;
  }

  public componentWillReceiveProps(nextProps: Readonly<EndpointEditorProps>): void {
    this.setState({ ...nextProps.endpointService });
  }

  public render(): JSX.Element {
    const { name, endpoint, appId, appPassword } = this.state;
    return (
      <Modal cssOverrides={modalCssOverrides} title={title} detailedDescription={detailedDescription} cancel={this.onCancelClick}>
        <ModalContent>
          <TextInputField value={name} onChange={this.onInputChange} label="Name" required={true} inputAttributes={{ 'data-propName': 'name' }} />
          <TextInputField value={endpoint} onChange={this.onInputChange} label="Endpoint url" required={true} inputAttributes={{ 'data-propName': 'endpoint' }} />
          <TextInputField value={appId} onChange={this.onInputChange} label="Application Id" required={false} inputAttributes={{ 'data-propName': 'appId' }} />
          <TextInputField value={appPassword} onChange={this.onInputChange} label="Application Password" required={false} inputAttributes={{ 'data-propName': 'appPassword' }} />
        </ModalContent>
        <ModalActions>
          <PrimaryButton text="Cancel" secondary={true} onClick={this.onCancelClick} />
          <PrimaryButton text="Submit" onClick={this.onSubmitClick} />
        </ModalActions>
      </Modal>
    );
  }

  private onCancelClick = (event: SyntheticEvent<HTMLButtonElement>): void => {
    this.props.cancel();
  };

  private onSubmitClick = (event: SyntheticEvent<HTMLButtonElement>): void => {
    // generate an id if none exists
    let state = { ...this.state };
    if (!this.state.id)
      state.id = uniqueId();
    this.props.updateEndpointService(state);
  };

  private onInputChange = (event: SyntheticEvent<HTMLInputElement>): void => {
    const { currentTarget: input } = event;
    const propName = input.getAttribute('data-propName');
    this.setState({ [propName as any]: input.value });
  };
}
