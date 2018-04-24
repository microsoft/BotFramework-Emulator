import { IDispatchService } from '@bfemulator/sdk-shared';
import { Modal, ModalActions, ModalContent, PrimaryButton, TextInputField } from '@bfemulator/ui-react';
import * as React from 'react';
import { Component, SyntheticEvent } from 'react';
import { DispatchService } from './dispatchService';

interface DispatchEditorProps {
  dispatchService: IDispatchService,
  cancel: () => void,
  updateDispatchService: (updatedDispatchService: IDispatchService) => void;
}

interface DispatchEditorState {
  dispatchService: IDispatchService,
  nameError: string;
  appIdError: string;
  authoringKeyError: string;
  versionError: string;
  subscriptionKeyError: string;
  isDirty: boolean
}

const title = 'Connect to a Dispatch Application';
const detailedDescription = 'You can connect your bot to a Dispatch.ai application';
const modalCssOverrides = {
  width: '400px',
  height: '525px'
};

export class DispatchEditor extends Component<DispatchEditorProps, DispatchEditorState> {

  public state: DispatchEditorState = {} as DispatchEditorState;

  constructor(props, state) {
    super(props, state);
    const dispatchService = new DispatchService(props.dispatchService);
    this.state = { dispatchService, nameError: '', appIdError: '', authoringKeyError: '', versionError: '', subscriptionKeyError: '', isDirty: false };
  }

  public componentWillReceiveProps(nextProps: Readonly<DispatchEditorProps>): void {
    const dispatchService = new DispatchService(nextProps.dispatchService);
    this.setState({ dispatchService });
  }

  public render(): JSX.Element {
    const { dispatchService, appIdError, authoringKeyError, isDirty, nameError, subscriptionKeyError, versionError } = this.state;
    const { name = '', appId = '', authoringKey = '', subscriptionKey = '', version = '' } = dispatchService;
    const valid = !nameError && !appIdError && !authoringKeyError && !versionError && !subscriptionKeyError;

    return (
      <Modal cssOverrides={ modalCssOverrides } title={ title } detailedDescription={ detailedDescription } cancel={ this.onCancelClick }>
        <ModalContent>
          <TextInputField value={ name } onChange={ this.onInputChange } label="Name" required={ true } inputAttributes={ { 'data-propname': 'name' } }/>
          <TextInputField value={ appId } onChange={ this.onInputChange } label="Application Id" required={ true } inputAttributes={ { 'data-propname': 'appId' } }/>
          <TextInputField value={ authoringKey } onChange={ this.onInputChange } label="Authoring key" required={ true } inputAttributes={ { 'data-propname': 'authoringKey' } }/>
          <TextInputField value={ version } onChange={ this.onInputChange } label="Version" required={ true } inputAttributes={ { 'data-propname': 'version' } }/>
          <TextInputField value={ subscriptionKey } onChange={ this.onInputChange } label="Subscription key" required={ false } inputAttributes={ { 'data-propname': 'subscriptionKey' } }/>
        </ModalContent>
        <ModalActions>
          <PrimaryButton text="Cancel" secondary={ true } onClick={ this.onCancelClick }/>
          <PrimaryButton disabled={ !isDirty || !valid } text="Submit" onClick={ this.onSubmitClick }/>
        </ModalActions>
      </Modal>
    );
  }

  private onCancelClick = (event: SyntheticEvent<HTMLButtonElement>): void => {
    this.props.cancel();
  };

  private onSubmitClick = (event: SyntheticEvent<HTMLButtonElement>): void => {
    const { dispatchService } = this.state;
    dispatchService.id = dispatchService.appId;
    this.props.updateDispatchService(dispatchService);
  };

  private onInputChange = (event: SyntheticEvent<HTMLInputElement>): void => {
    const { currentTarget: input } = event;
    const { required, value } = input;
    const trimmedValue = value.trim();

    const { dispatchService: originalDispatchService } = this.props;
    const propName = input.getAttribute('data-propname');
    const errorMessage = ( required && !trimmedValue ) ? `The field cannot be empty` : '';

    const { dispatchService } = this.state;
    dispatchService[propName] = input.value;

    const isDirty = Object.keys(dispatchService).reduce((isDirty, key) => ( isDirty || dispatchService[key] !== originalDispatchService[key] ), false);
    this.setState({ dispatchService, [`${propName}Error`]: errorMessage, isDirty } as any);
  };
}
