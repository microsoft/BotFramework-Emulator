import { IQnAService } from '@bfemulator/sdk-shared';
import { Modal, ModalActions, ModalContent, PrimaryButton, TextInputField } from '@bfemulator/ui-react';
import * as React from 'react';
import { Component, SyntheticEvent } from 'react';
import { QnaMakerService } from './qnaMakerService';

interface QnaMakerEditorProps {
  qnaMakerService: IQnAService,
  cancel: () => void,
  updateQnaMakerService: (updatedQnaMakerService: IQnAService) => void;
}

interface QnaMakerEditorState {
  qnaMakerService: IQnAService;
  nameError: string;
  subscriptionKeyError: string;
  hostnameError: string;
  endpointKeyError: string;
  kbidError: string;
  isDirty: boolean
}

const title = 'Add a QnA Maker knowledge base';
const detailedDescription = 'You can find your knowledge base subscription key in QnaMaker.ai';
const modalCssOverrides = {
  width: '400px',
  height: '530px'
};

export class QnaMakerEditor extends Component<QnaMakerEditorProps, QnaMakerEditorState> {

  public state: QnaMakerEditorState = {} as QnaMakerEditorState;

  constructor(props, state) {
    super(props, state);
    const qnaMakerService = new QnaMakerService(props.qnaMakerService);
    this.state = { qnaMakerService, nameError: '', kbidError: '', subscriptionKeyError: '', endpointKeyError: '', hostnameError: '', isDirty: false };
  }

  public componentWillReceiveProps(nextProps: Readonly<QnaMakerEditorProps>): void {
    const qnaMakerService = new QnaMakerService(nextProps.qnaMakerService);
    this.setState({ qnaMakerService });
  }

  public render(): JSX.Element {
    const { qnaMakerService, kbidError, nameError, subscriptionKeyError, hostnameError, endpointKeyError, isDirty } = this.state;
    const { name = '', subscriptionKey = '', hostname = '', endpointKey, kbId = '' } = qnaMakerService;
    const valid = !kbidError && !nameError && !subscriptionKeyError;
    return (
      <Modal cssOverrides={ modalCssOverrides } title={ title } detailedDescription={ detailedDescription } cancel={ this.onCancelClick }>
        <ModalContent>
          <TextInputField error={ nameError } value={ name } onChange={ this.onInputChange } label="Name" required={ true } inputAttributes={ { 'data-propname': 'name' } } />
          <TextInputField error={ subscriptionKeyError } value={ subscriptionKey } onChange={ this.onInputChange } label="Subscription key" required={ true } inputAttributes={ { 'data-propname': 'subscriptionKey' } } />
          <TextInputField error={ hostnameError } value={ hostname } onChange={ this.onInputChange } label="Host name" required={ true } inputAttributes={ { 'data-propname': 'hostname' } } />
          <TextInputField error={ endpointKeyError } value={ endpointKey } onChange={ this.onInputChange } label="Endpoint Key" required={ true } inputAttributes={ { 'data-propname': 'endpointKey' } } />
          <TextInputField error={ kbidError } value={ kbId } onChange={ this.onInputChange } label="Knowledge base Id" required={ true } inputAttributes={ { 'data-propname': 'kbId' } } />
        </ModalContent>
        <ModalActions>
          <PrimaryButton text="Cancel" secondary={ true } onClick={ this.onCancelClick } />
          <PrimaryButton disabled={ !isDirty || !valid } text="Submit" onClick={ this.onSubmitClick } />
        </ModalActions>
      </Modal>
    );
  }

  private onCancelClick = (event: SyntheticEvent<HTMLButtonElement>): void => {
    this.props.cancel();
  };

  private onSubmitClick = (event: SyntheticEvent<HTMLButtonElement>): void => {
    this.props.updateQnaMakerService(this.state.qnaMakerService);
  };

  private onInputChange = (event: SyntheticEvent<HTMLInputElement>): void => {
    const { currentTarget: input } = event;
    const { required, value } = input;
    const trimmedValue = value.trim();

    const { qnaMakerService: originalQnaMakerService } = this.props;
    const propName = input.getAttribute('data-propname');
    const errorMessage = (required && !trimmedValue) ? `The field cannot be empty` : '';

    const { qnaMakerService } = this.state;
    qnaMakerService[propName] = input.value;

    const isDirty = Object.keys(qnaMakerService).reduce((isDirty, key) => (isDirty || qnaMakerService[key] !== originalQnaMakerService[key]), false);
    this.setState({ qnaMakerService, [`${propName}Error`]: errorMessage, isDirty } as any);
  };
}
