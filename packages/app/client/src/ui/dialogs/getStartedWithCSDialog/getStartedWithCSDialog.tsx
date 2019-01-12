import {
  DefaultButton,
  Dialog,
  DialogFooter,
  PrimaryButton
} from "@bfemulator/ui-react";
import { ServiceTypes } from "botframework-config/lib/schema";
import * as React from "react";
import { Component, ReactNode } from "react";

import { serviceTypeLabels } from "../../../utils/serviceTypeLables";
import * as styles from "../dialogStyles.scss";

export interface GetStartedWithCSDialogProps {
  cancel: () => void;
  confirm: () => void;
  launchConnectedServiceEditor: () => void;
  authenticatedUser?: string;
  serviceType?: ServiceTypes;
  showNoModelsFoundContent?: boolean;
}

const titleMap = {
  [ServiceTypes.Luis]: "Create a LUIS app",
  [ServiceTypes.Dispatch]: "Connect to a Dispatch model",
  [ServiceTypes.QnA]: "Create a QnA Maker knowledge base",
  [ServiceTypes.BlobStorage]: "Create a Blob Storage Container"
};

const buttonTextMap = {
  [ServiceTypes.Luis]: "LUIS",
  [ServiceTypes.Dispatch]: "LUIS",
  [ServiceTypes.QnA]: "QnA Maker",
  [ServiceTypes.BlobStorage]: "Blob Storage"
};

export class GetStartedWithCSDialog extends Component<
  GetStartedWithCSDialogProps,
  {}
> {
  public render() {
    return (
      <Dialog
        className={styles.dialogMedium}
        cancel={this.props.cancel}
        title={titleMap[this.props.serviceType]}
      >
        {this.content}
        <DialogFooter>
          <DefaultButton text="Cancel" onClick={this.props.cancel} />
          <PrimaryButton
            text={`Go to ${buttonTextMap[this.props.serviceType]}`}
            onClick={this.props.confirm}
          />
        </DialogFooter>
      </Dialog>
    );
  }

  private get content(): ReactNode {
    const { serviceType } = this.props;

    switch (serviceType) {
      case ServiceTypes.Luis:
        return this.luisContent;

      case ServiceTypes.Dispatch:
        return this.dispatchContent;

      case ServiceTypes.QnA:
        return this.qnaContent;

      case ServiceTypes.BlobStorage:
        return this.blobContent;

      case ServiceTypes.CosmosDB:
        return this.cosmosDbContent;

      default:
        return null;
    }
  }

  private get luisContent(): ReactNode {
    if (this.props.showNoModelsFoundContent) {
      return this.luisNoModelsFoundContent;
    }
    return (
      <>
        <p>
          {"Language Understanding Service (LUIS) is a matching learning-based service for adding language " +
            "understanding to bots, applications and IoT devices."}
        </p>
        <p>
          {`You have not signed up for a LUIS account under ${
            this.props.authenticatedUser
          } `}
          <a href="http://aka.ms/bot-framework-emulator-LUIS-docs-home">
            Learn more about LUIS
          </a>
        </p>
        <p>
          {"Alternatively, you can "}
          <a
            href="javascript:void(0);"
            onClick={this.props.launchConnectedServiceEditor}
          >
            connect to a LUIS app manually
          </a>
          {" if you know the app ID, version, and authoring key."}
        </p>
      </>
    );
  }

  private get luisNoModelsFoundContent(): ReactNode {
    const label = serviceTypeLabels[this.props.serviceType];
    return (
      <>
        <p>Signed in as {this.props.authenticatedUser}.</p>
        <p>
          {"You do not have any {label} models associated with this account. "}
          <a href="javascript:void(0)">
            Connect to a {label} model manually
          </a>{" "}
          by entering the app ID and key.
        </p>
        <p>
          <a href="javascript:void(0)">Learn more about {label} models</a>
          <br />
        </p>
        <p>
          {"You can link apps from a different {label} account to this Azure account by adding " +
            "yourself as a collaborator."}
          <a href="http://aka.ms/bot-framework-emulator-luis-collaboration">
            Learn more about collaborating
          </a>
        </p>
      </>
    );
  }

  private get dispatchContent(): ReactNode {
    if (this.props.showNoModelsFoundContent) {
      return this.dispatchNoModelsFoundContent;
    }

    return (
      <>
        <p>
          {"A Dispatch model is a LUIS model that enables your bot to dispatch intents across multiple LUIS " +
            "apps and QnAMaker knowledge bases. "}
          <a href="https://aka.ms/bot-framework-emulator-create-dispatch">
            Learn more about Dispatch models
          </a>
        </p>
        <p>
          {`You have not signed up for a LUIS account under ${
            this.props.authenticatedUser
          } `}
          <a href="http://aka.ms/bot-framework-emulator-LUIS-docs-home">
            Learn more about LUIS
          </a>
        </p>
        <br />
        {"Alternatively, you can "}
        <a
          href="javascript:void(0);"
          onClick={this.props.launchConnectedServiceEditor}
        >
          connect to a Dispatch app manually
        </a>
        {" if you know the app ID, version, and authoring key."}
      </>
    );
  }

  private get dispatchNoModelsFoundContent(): ReactNode {
    return (
      <>
        <p>Signed in as {this.props.authenticatedUser}.</p>
        <p>
          {"You do not have any Dispatch models associated with this account. "}
          <a
            href="javascript:void(0)"
            onClick={this.props.launchConnectedServiceEditor}
          >
            Connect to a Dispatch model manually
          </a>
          {" by entering this app ID and key."}
        </p>
        <p>
          <a href="https://aka.ms/bot-framework-emulator-create-dispatch">
            Learn more about Dispatch models
          </a>
        </p>
        <p>
          {"You can link apps from a different Dispatch account to this Azure account by adding " +
            "yourself as a collaborator. "}
          <a href="http://aka.ms/bot-framework-emulator-luis-collaboration">
            Learn more about collaborating
          </a>
        </p>
      </>
    );
  }

  private get qnaContent(): ReactNode {
    return (
      <>
        <p>
          {
            "QnA Maker is a service that creates a question-and-answer knowledge base from FAQs and product manuals."
          }
        </p>
        <p>
          {`You have not signed up for a QnA Maker account under ${
            this.props.authenticatedUser
          }. `}
          <a href="https://aka.ms/bot-framework-emulator-qna-docs-home">
            Get started with QnA Maker
          </a>
        </p>
        <p>
          {" Alternatively, you can "}
          <a
            href="https://aka.ms/bot-framework-emulator-qna-docs-home"
            onClick={this.props.launchConnectedServiceEditor}
          >
            connect to a knowledge base manually
          </a>
          {" if you know the ID and subscription key."}
        </p>
      </>
    );
  }

  private get blobContent(): ReactNode {
    return (
      <>
        <p>
          {"Blob Storage is a service that allows you to store unstructured " +
            "data and is commonly used to store a Bot's transcripts."}
        </p>
        <p>
          {`You have do not have a Blob container under ${
            this.props.authenticatedUser
          }. `}
          <a href="https://azure.microsoft.com/en-us/services/storage/blobs/">
            Get started with Blob Storage
          </a>
        </p>
        <p>
          {" Alternatively, you can "}
          <a
            href="javascript:void(0);"
            onClick={this.props.launchConnectedServiceEditor}
          >
            connect to a Blob container manually
          </a>
          {
            " if you know the ID, subscription key, container name and connection string."
          }
        </p>
      </>
    );
  }

  private get cosmosDbContent(): ReactNode {
    return (
      <>
        <p>
          {
            "CosmosDB is a multi-model database service commonly used to store a bot's state."
          }
        </p>
        <p>
          {`You have do not have any CosmosDB collections under ${
            this.props.authenticatedUser
          }. `}
          <a href="https://azure.microsoft.com/en-us/services/cosmos-db/">
            Get started with CosmosDB
          </a>
        </p>
        <p>
          {" Alternatively, you can "}
          <a
            href="javascript:void(0);"
            onClick={this.props.launchConnectedServiceEditor}
          >
            connect to a CosmosDB collection manually
          </a>
          {
            " if you know the ID, subscription key, collection and database name."
          }
        </p>
      </>
    );
  }
}
