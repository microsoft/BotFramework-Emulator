import { IQnAService } from '@bfemulator/sdk-shared';
import { Modal, ModalActions, ModalContent, PrimaryButton, TextInputField } from '@bfemulator/ui-react';
import * as React from 'react';
import { Component, SyntheticEvent } from 'react';

interface QnaMakerEditorProps {
  qnaMakerService: IQnAService,
  cancel: () => void,
  updateQnaMakerService: (updatedQnaMakerService: IQnAService) => void;
}

const title = 'Add a QnA Maker knowledge base';
const detailedDescription = 'You can find your knowledge base subscription key in QnaMaker.ai';
const modalCssOverrides = {
  width: '400px',
  height: '383px'
};

export class QnaMakerEditor extends Component<QnaMakerEditorProps, IQnAService> {

  public state: IQnAService = {} as IQnAService;

  constructor(props, state) {
    super(props, state);
    this.state = props.qnaMakerService;
  }

  public componentWillReceiveProps(nextProps: Readonly<QnaMakerEditorProps>): void {
    this.setState({ ...nextProps.qnaMakerService });
  }

  public render(): JSX.Element {
    const { name, kbid, subscriptionKey } = this.state;
    return (
      <Modal cssOverrides={ modalCssOverrides } title={ title } detailedDescription={ detailedDescription } cancel={ this.onCancelClick }>
        <ModalContent>
          <TextInputField value={ name } onChange={ this.onInputChange } label="Name" required={ true } inputAttributes={ { 'data-propName': 'name' } }/>
          <TextInputField value={ kbid } onChange={ this.onInputChange } label="Knowledge base Id" required={ true } inputAttributes={ { 'data-propName': 'kbid' } }/>
          <TextInputField value={ subscriptionKey } onChange={ this.onInputChange } label="Subscription key" required={ true } inputAttributes={ { 'data-propName': 'subscriptionKey' } }/>
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
    // kbid value should be used as id
    const state = { ...this.state, id: this.state.kbid };
    this.props.updateQnaMakerService(state);
  };

  private onInputChange = (event: SyntheticEvent<HTMLInputElement>): void => {
    const { currentTarget: input } = event;
    const propName = input.getAttribute('data-propName');
    this.setState({ [propName as any]: input.value });
  };
}
