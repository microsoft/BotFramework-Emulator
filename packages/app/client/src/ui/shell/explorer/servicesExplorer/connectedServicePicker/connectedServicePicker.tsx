//
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
//
// Microsoft Bot Framework: http://botframework.com
//
// Bot Framework Emulator Github:
// https://github.com/Microsoft/BotFramwork-Emulator
//
// Copyright (c) Microsoft Corporation
// All rights reserved.
//
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

import {
  Checkbox,
  DefaultButton,
  Dialog,
  DialogFooter,
  PrimaryButton
} from "@bfemulator/ui-react";
import {
  IConnectedService,
  ServiceTypes
} from "botframework-config/lib/schema";
import * as React from "react";
import { ChangeEvent, ChangeEventHandler, Component, ReactNode } from "react";

import * as styles from "./connectedServicePicker.scss";

const titleMap = {
  [ServiceTypes.Luis]: "Connect to your LUIS apps",
  [ServiceTypes.Dispatch]: "Connect to a Dispatch model",
  [ServiceTypes.QnA]: "Connect to your QnA Maker knowledge base",
  [ServiceTypes.Bot]: "Connect to an Azure Bot Service",
  [ServiceTypes.AppInsights]:
    "Connect to an Azure Application Insights resource",
  [ServiceTypes.BlobStorage]: "Connect to an Azure Storage account",
  [ServiceTypes.CosmosDB]: "Connect to an Azure Cosmos DB account"
};

const connected = "connected";

interface ConnectedServicesPickerProps {
  authenticatedUser: string;
  serviceType: ServiceTypes;

  connectedServices: IConnectedService[];
  availableServices: IConnectedService[];
  launchServiceEditor: () => void;
  connectServices: (models: IConnectedService[]) => void;
  cancel: () => void;
}

interface ConnectedServicesPickerState {
  // false if the model is not selected
  // connected if the model is already connected
  // IConnectedService if the model is selected
  [selectedLuisModelId: string]: IConnectedService | boolean | "connected";

  checkAllChecked: boolean;
}

export class ConnectedServicePicker extends Component<
  ConnectedServicesPickerProps,
  ConnectedServicesPickerState
> {
  public state: ConnectedServicesPickerState = { checkAllChecked: false };

  public static getDerivedStateFromProps(
    nextProps: ConnectedServicesPickerProps,
    prevState: ConnectedServicesPickerState
  ) {
    const state = {} as ConnectedServicesPickerState;
    const { availableServices, connectedServices } = nextProps;
    connectedServices.forEach(service => (state[service.id] = connected));
    availableServices.forEach(service => {
      const { id } = service;
      if (prevState[id] !== connected && state[service.id] !== connected) {
        state[id] = prevState[id] || false;
      }
    });
    state.checkAllChecked = Object.keys(state).every(key => !!state[key]);
    return state;
  }

  public render(): ReactNode {
    return (
      <Dialog
        title={titleMap[this.props.serviceType]}
        className={styles.connectedServicePicker}
        cancel={this.props.cancel}
      >
        <div className={styles.listContainer}>
          {this.headerElements}
          {this.selectAllCheckbox}
          <ul>{this.serviceListElements}</ul>
          {this.contentElements}
        </div>
        <DialogFooter>
          <DefaultButton text="Cancel" onClick={this.props.cancel} />
          <PrimaryButton
            text="Add"
            onClick={this.onAddClick}
            disabled={!this.addButtonEnabled}
          />
        </DialogFooter>
      </Dialog>
    );
  }

  private get serviceListElements(): ReactNode[] {
    const { state, onChange } = this;
    const { availableServices } = this.props;
    return availableServices.map((service, index) => {
      const { id, name: label } = service;
      const checkboxProps = {
        label,
        checked: !!state[id],
        id: `service_${id}`,
        onChange,
        disabled: state[id] === connected,
        "data-index": index
      };
      return (
        <li key={index}>
          <Checkbox {...checkboxProps} className={styles.checkboxOverride} />
          {"version" in service ? (
            <span>v{(service as any).version}</span>
          ) : null}
        </li>
      );
    });
  }

  private get addButtonEnabled(): boolean {
    const { state } = this;
    const { checkAllChecked: _discarded, ...selectedModels } = state;
    return Object.keys(selectedModels).some(
      key => !!state[key] && state[key] !== connected
    );
  }

  private onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { checkAllChecked: _discarded, ...newState } = this.state;
    const { index } = event.target.dataset;
    const service = this.props.availableServices[index];
    newState[service.id] = !this.state[service.id] ? service : false;
    newState.checkAllChecked = Object.keys(newState).every(
      key => !!newState[key]
    );
    this.setState(newState);
  };

  private onSelectAllChange: ChangeEventHandler<any> = () => {
    const { availableServices = [] } = this.props;
    const { checkAllChecked: _discarded, ...state } = this.state;
    const newState = {} as ConnectedServicesPickerState;
    const checked = (newState.checkAllChecked = !this.state.checkAllChecked);

    availableServices.forEach(service => {
      if (state[service.id] !== connected) {
        newState[service.id] = checked ? service : false;
      }
    });

    this.setState(newState);
  };

  private onAddClick: ChangeEventHandler<any> = () => {
    const { checkAllChecked: _discarded, ...services } = this.state;
    const reducer = (models, serviceId) => {
      if (typeof services[serviceId] === "object") {
        models.push(services[serviceId]);
      }
      return models;
    };
    const addedModels: IConnectedService[] = Object.keys(services).reduce(
      reducer,
      []
    );
    this.props.connectServices(addedModels);
  };

  private get selectAllCheckbox(): ReactNode {
    if (this.props.availableServices.length < 2) {
      return null;
    }
    return (
      <div className={styles.selectAll}>
        <Checkbox
          onChange={this.onSelectAllChange}
          checked={this.state.checkAllChecked}
          id="select-all-services"
          label="Select all"
        />
      </div>
    );
  }

  // --------------------------------
  // Header specific to
  private get headerElements(): ReactNode {
    switch (this.props.serviceType) {
      case ServiceTypes.Luis:
        return this.luisServiceHeader;

      case ServiceTypes.QnA:
        return this.qnaServiceHeader;

      case ServiceTypes.Dispatch:
        return this.dispatchServiceHeader;

      case ServiceTypes.AppInsights:
        return this.appInsightsHeader;

      case ServiceTypes.BlobStorage:
        return this.blobStorageHeader;

      case ServiceTypes.CosmosDB:
        return this.cosmosDbHeader;

      default:
        return null;
    }
  }

  private get luisServiceHeader(): ReactNode {
    return (
      <p>
        {"Select a LUIS app below to store the app ID in your bot file or "}
        <a href="javascript:void(0);" onClick={this.props.launchServiceEditor}>
          add a LUIS app manually
        </a>
        {" by entering the app ID and key"}
      </p>
    );
  }

  private get qnaServiceHeader(): ReactNode {
    return (
      <p>
        {
          " Select a knowledge base below to store the knowledge base Id in your bot file or "
        }
        <a href="javascript:void(0);" onClick={this.props.launchServiceEditor}>
          connect to a knowledge base manually
        </a>
        {" by entering the knowledge base ID and key."}
      </p>
    );
  }

  private get dispatchServiceHeader(): ReactNode {
    return (
      <p>
        {"Select a Dispatch app below to store the app ID in your bot file or "}
        <a href="javascript:void(0);" onClick={this.props.launchServiceEditor}>
          connect to a Dispatch app manually
        </a>
        {" by entering the app ID and key."}
      </p>
    );
  }

  private get appInsightsHeader(): ReactNode {
    return (
      <p>
        {"Select a resource below or "}
        <a href="javascript:void(0);" onClick={this.props.launchServiceEditor}>
          connect to an Applications Insights resource manually.
        </a>
      </p>
    );
  }

  private get blobStorageHeader(): ReactNode {
    return (
      <p>
        {"Select a storage account below or "}
        <a href="javascript:void(0);" onClick={this.props.launchServiceEditor}>
          connect to an Azure storage account manually.
        </a>
      </p>
    );
  }

  private get cosmosDbHeader(): ReactNode {
    return (
      <p>
        {"Select an account below or "}
        <a href="javascript:void(0);" onClick={this.props.launchServiceEditor}>
          connect to an Azure storage account manually.
        </a>
      </p>
    );
  }

  // --------------------------------------
  // Content specific to the service
  private get contentElements(): ReactNode {
    switch (this.props.serviceType) {
      case ServiceTypes.Luis:
        return this.luisServiceContent;

      case ServiceTypes.QnA:
        return this.qnaServiceContent;

      case ServiceTypes.Dispatch:
        return this.dispatchServiceContent;

      case ServiceTypes.BlobStorage:
        return this.blobStorageServiceContent;

      case ServiceTypes.AppInsights:
        return this.appInsightsServiceContent;

      case ServiceTypes.CosmosDB:
        return this.cosmosDbServiceContent;

      default:
        return null;
    }
  }

  private get luisServiceContent(): ReactNode {
    return (
      <>
        <a
          href="http://aka.ms/bot-framework-emulator-create-luis-app"
          className={styles.paddedLink}
        >
          Create a new LUIS app
        </a>
        <p>
          {`Signed in as ${
            this.props.authenticatedUser
          }. You can link apps from a different LUIS `}
          {
            "account to this Azure account by adding yourself as a collaborator."
          }
          <a href="http://aka.ms/bot-framework-emulator-luis-collaboration">
            Learn more about collaborating.
          </a>
        </p>
      </>
    );
  }

  private get qnaServiceContent(): ReactNode {
    return (
      <>
        <a
          href="http://aka.ms/bot-framework-emulator-create-qna-kb"
          className={styles.paddedLink}
        >
          Create a new knowledge base.
        </a>
        <p>{` Signed in as ${this.props.authenticatedUser}.`}</p>
      </>
    );
  }

  private get dispatchServiceContent(): ReactNode {
    return (
      <>
        <a
          href="https://aka.ms/bot-framework-emulator-create-dispatch"
          className={styles.paddedLink}
        >
          Learn more about using Dispatch apps.
        </a>
        <p>
          {` Signed in as ${
            this.props.authenticatedUser
          }. You can link apps from a different LUIS `}
          {
            "account to this Azure account by adding yourself as a collaborator. "
          }
          <a href="http://aka.ms/bot-framework-emulator-luis-collaboration">
            Learn more about collaborating.
          </a>
        </p>
      </>
    );
  }

  private get blobStorageServiceContent(): ReactNode {
    return (
      <>
        <a
          href="https://aka.ms/bot-framework-emulator-create-storage"
          className={styles.paddedLink}
        >
          Create a new Azure storage account
        </a>
        <p>{` Signed in as ${this.props.authenticatedUser}.`}</p>
      </>
    );
  }

  private get appInsightsServiceContent(): ReactNode {
    return (
      <>
        <a
          href="https://aka.ms/bot-framework-emulator-create-appinsights"
          className={styles.paddedLink}
        >
          Create a new Azure storage account
        </a>
        <p>{` Signed in as ${this.props.authenticatedUser}.`}</p>
      </>
    );
  }

  private get cosmosDbServiceContent(): ReactNode {
    return (
      <>
        <a
          href="https://aka.ms/bot-framework-emulator-create-storage"
          className={styles.paddedLink}
        >
          Create a new Azure Cosmos DB account.
        </a>
        <p>{` Signed in as ${this.props.authenticatedUser}.`}</p>
      </>
    );
  }
}
