import * as React from 'react';
import { Component } from 'react';
import { ServiceTypes } from 'botframework-config/lib/schema';
import { DefaultButton, Dialog, DialogFooter, PrimaryButton } from '@bfemulator/ui-react';
import { serviceTypeLabels } from '../../../utils/serviceTypeLables';

export interface GetStartedWithCSDialogProps {
  cancel: () => void;
  confirm: () => void;
  launchConnectedServiceEditor: () => void;
  authenticatedUser?: string;
  serviceType?: ServiceTypes;
  showNoModelsFoundContent?: boolean;
}

const titleMap = {
  [ServiceTypes.Luis]: 'Create a LUIS app',
  [ServiceTypes.Dispatch]: 'Create a LUIS app',
  [ServiceTypes.QnA]: 'Create a QnA Maker knowledge base'
};

const buttonTextMap = {
  [ServiceTypes.Luis]: 'LUIS',
  [ServiceTypes.Dispatch]: 'LUIS',
  [ServiceTypes.QnA]: 'QnA Maker'
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
          <PrimaryButton text={ `Go to ${buttonTextMap[this.props.serviceType]}` }
                         onClick={ this.props.confirm }/>
        </DialogFooter>
      </Dialog>
    );
  }

  private get content(): JSX.Element {
    const { serviceType } = this.props;

    switch (serviceType) {
      case ServiceTypes.Luis:
      case ServiceTypes.Dispatch:
        return this.luisContent;

      case ServiceTypes.QnA:
        return this.qnaContent;

      default:
        return null;
    }
  }

  private get luisContent(): JSX.Element {
    const { showNoModelsFoundContent, authenticatedUser, serviceType } = this.props;
    const label = serviceTypeLabels[serviceType];
    if (!showNoModelsFoundContent) {
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
    return (
      <>
        <p>
          Signed in as { authenticatedUser }.
        </p>
        <p>
          You do not have any { label } models associated with this account.&nbsp;
          <a href="javascript:void(0)">Connect to a { label } model manually</a>&nbsp;
          by entering this app ID and key.
        </p>
        <p>
          <a href="javascript:void(0)">Learn more about { label } models</a>&nbsp;
        </p>
        <p>
          You can link apps from a different { label } account to this Azure account by adding yourself as a
          collaborator.
          &nbsp;<a href="javascript:void(0)">Learn more about collaborating</a>
        </p>
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
        <p>
          Alternatively, you can&nbsp;
          <a href="javascript:void(0);" onClick={ this.props.launchConnectedServiceEditor }>
            connect to a knowledge base manually
          </a> if you know the ID and subscription key
        </p>
      </>
    );
  }
}
