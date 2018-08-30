import * as React from 'react';
import { Component } from 'react';
import { ServiceType } from 'msbot/bin/schema';
import { DefaultButton, Dialog, DialogFooter, PrimaryButton } from '@bfemulator/ui-react';

export interface GetStartedWithCSDialogProps {
  cancel: () => void;
  confirm: () => void;
  launchConnectedServiceEditor: () => void;
  authenticatedUser?: string;
  serviceType?: ServiceType;
}

const titleMap = {
  [ServiceType.Luis]: 'Create a LUIS app',
};

const buttonTextMap = {
  [ServiceType.Luis]: 'LUIS',
  [ServiceType.Dispatch]: 'LUIS',
  [ServiceType.QnA]: 'QnA Maker'
};

export class GetStartedWithCSDialog extends Component<GetStartedWithCSDialogProps, {}> {
  public render() {
    return (
      <Dialog
        cancel={ this.props.cancel }
        title={ titleMap[this.props.serviceType] }>
        { this.content }
        <DialogFooter>
          <DefaultButton text="Cancel" onClick={ this.props.cancel }/>
          <PrimaryButton text={ `Sign up for ${buttonTextMap[this.props.serviceType]}` }
                         onClick={ this.props.confirm }/>
        </DialogFooter>
      </Dialog>
    );
  }

  private get content(): JSX.Element {
    const { serviceType } = this.props;

    switch (serviceType) {
      case ServiceType.Luis:
      case ServiceType.Dispatch:
        return this.luisContent;

      case ServiceType.QnA:
        return this.qnaContent;

      default:
        return null;
    }
  }

  private get luisContent(): JSX.Element {
    return (
      <>
        <p>
          Language Understanding Service (LUIS) is a matching learning-based service for adding language
          understanding to bots, applications and IoT Devices
        </p>
        <p>You have not signed up for a LUIS account under { this.props.authenticatedUser } </p>
        <a href="javascript:void(0);" onClick={ this.props.launchConnectedServiceEditor }>Add a LUIS app manually</a>
      </>
    );
  }

  private get qnaContent(): JSX.Element {
    return (
      <>
        <p>
          QnA Maker is a service that creates a question-and-answer knowledge base from FAQs and product manuals
        </p>
        <p>
          You have not signed up for a QnA Maker account under { this.props.authenticatedUser }.
          <a href="javascript:void(0)">Get started with QnA Maker</a>
        </p>
        <a href="javascript:void(0);" onClick={ this.props.launchConnectedServiceEditor }>Add a LUIS app manually</a>
      </>
    );
  }
}
