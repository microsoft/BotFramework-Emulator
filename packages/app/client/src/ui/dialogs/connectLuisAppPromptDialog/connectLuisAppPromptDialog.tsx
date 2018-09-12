import * as React from 'react';
import { Component } from 'react';
import { DefaultButton, Dialog, DialogFooter, PrimaryButton } from '@bfemulator/ui-react';
import { ServiceTypes } from 'botframework-config/lib/schema';

export interface ConnectLuisAppPromptDialogProps {
  cancel: () => void;
  confirm: () => void;
  addLuisAppManually: () => void;
  onAnchorClick: (url: string) => void;
  serviceType?: ServiceTypes;
}

export class ConnectLuisAppPromptDialog extends Component<ConnectLuisAppPromptDialogProps, {}> {
  public render() {
    if (this.props.serviceType === 'luis') {
      return this.luisView;
    } else if (this.props.serviceType === 'qna') {
      return this.qnaView;
    } else {
      return this.dispatchView;
    }
  }

  private get luisView(): JSX.Element {
    return (
      <Dialog
        cancel={ this.props.cancel }
        title="Connect your bot to a LUIS application">
        <p>
          Sign in to your Azure account to select the LUIS applications you'd like to associate with this bot.&nbsp;
          <a href="javascript:void(0);" onClick={ this.onLearnMoreLUIS }>Learn more about LUIS</a>
        </p>
        <p>
          Alternatively, you can&nbsp;
          <a href="javascript:void(0);" onClick={ this.props.addLuisAppManually }>add a LUIS app manually</a>
          &nbsp;with the app ID, version, and authoring key
        </p>
        <DialogFooter>
          <DefaultButton text="Cancel" onClick={ this.props.cancel } />
          <PrimaryButton text="Sign in with Azure" onClick={ this.props.confirm } />
        </DialogFooter>
      </Dialog>
    );
  }

  private get qnaView(): JSX.Element {
    return (
      <Dialog
        cancel={ this.props.cancel }
        title="Connect your bot to a QnA Maker knowledge base">
        <p>
          Sign in to your Azure account to select the QnA Maker knowledge&nbsp;
           bases you'd like to associate with this bot.&nbsp;
          <a href="javascript:void(0);" onClick={ this.onLearnMoreQnAMaker }>Learn more about QnA Maker</a>
        </p>
        <p>
          Alternatively, you can&nbsp;
          <a href="javascript:void(0);" onClick={ this.props.addLuisAppManually }>
            connect to a QnA Maker knowledge base manually
          </a>
          &nbsp;with the app ID, version, and authoring key
        </p>
        <DialogFooter>
          <DefaultButton text="Cancel" onClick={ this.props.cancel } />
          <PrimaryButton text="Sign in with Azure" onClick={ this.props.confirm } />
        </DialogFooter>
      </Dialog>
    );
  }

  private get dispatchView(): JSX.Element {
    return (
      <Dialog
        cancel={ this.props.cancel }
        title="Connect your bot to a Dispatch model">
        <p>
          Sign in to your Azure account to select the Dispatch model you'd like to associate with this bot.&nbsp;
          <a href="javascript:void(0);" onClick={ this.onLearnMoreDispatch }>Learn more about Dispatch models</a>
        </p>
        <p>
          Alternatively, you can&nbsp;
          <a href="javascript:void(0);" onClick={ this.props.addLuisAppManually }>
            connect to a Dispatch model manually
          </a>
          &nbsp;with the app ID, version, and authoring key
        </p>
        <DialogFooter>
          <DefaultButton text="Cancel" onClick={ this.props.cancel } />
          <PrimaryButton text="Sign in with Azure" onClick={ this.props.confirm } />
        </DialogFooter>
      </Dialog>
    );
  }

  private onLearnMoreLUIS = () => {
    this.props.onAnchorClick('http://aka.ms/bot-framework-emulator-LUIS-docs-home');
  }
  private onLearnMoreQnAMaker = () => {
    this.props.onAnchorClick('http://aka.ms/bot-framework-emulator-qna-docs-home');
  }
  private onLearnMoreDispatch = () => {
    this.props.onAnchorClick('https://aka.ms/bot-framework-emulator-create-dispatch');
  }
}
