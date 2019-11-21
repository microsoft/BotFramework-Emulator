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
  IConnectedService,
  ServiceTypes,
  IAzureService,
  IBlobStorageService,
  ICosmosDBService,
} from 'botframework-config/lib/schema';
import * as React from 'react';
import { ComponentClass } from 'react';
import { MouseEventHandler, SyntheticEvent } from 'react';
import { LinkButton } from '@bfemulator/ui-react';

import {
  ConnectedServicePickerPayload,
  ContextMenuCoordinates,
} from '../../../../state/actions/connectedServiceActions';
import { serviceTypeLabels } from '../../../../utils/serviceTypeLables';
import {
  AzureLoginFailedDialogContainer,
  AzureLoginSuccessDialogContainer,
  ConnectServicePromptDialogContainer,
  GetStartedWithCSDialogContainer,
  ProgressIndicatorContainer,
} from '../../../dialogs';
import { ServicePane, ServicePaneProps } from '../servicePane/servicePane';

import { ConnectedServiceEditorContainer } from './connectedServiceEditor';
import { ConnectedServicePickerContainer } from './connectedServicePicker/connectedServicePickerContainer';
import * as styles from './servicesExplorer.scss';
import * as icons from './serviceTypeIcons';

const iconMap = {
  [ServiceTypes.AppInsights]: icons.appInsightsIcon,
  [ServiceTypes.BlobStorage]: icons.blobStorageIcon,
  [ServiceTypes.Bot]: icons.azureBotServiceIcon,
  [ServiceTypes.CosmosDB]: icons.cosmosDbIcon,
  [ServiceTypes.Dispatch]: icons.cognitiveServicesIcon,
  [ServiceTypes.Generic]: icons.genericService,
  [ServiceTypes.Luis]: icons.cognitiveServicesIcon,
  [ServiceTypes.QnA]: icons.cognitiveServicesIcon,
};

export interface ServicesExplorerProps extends ServicePaneProps {
  services?: IConnectedService[];
  toAnimate?: { [serviceId: string]: boolean };
  launchEndpointEditor: (serverEditor: ComponentClass<any>) => Promise<void>;
  onAnchorClick: (url: string) => void;
  openAddServiceContextMenu: (
    payload: ConnectedServicePickerPayload,
    menuCoords?: ContextMenuCoordinates
  ) => Promise<void>;
  openSortContextMenu: (menuCoords?: ContextMenuCoordinates) => void;
  openServiceDeepLink: (service: IConnectedService) => void;
}

export class ServicesExplorer extends ServicePane<ServicesExplorerProps> {
  public state = {} as ServicesExplorerProps;

  public static getDerivedStateFromProps(
    newProps: ServicesExplorerProps,
    existingProps: ServicesExplorerProps
  ): ServicesExplorerProps {
    if (!Object.keys(existingProps).length) {
      return newProps;
    }
    const { services: newServices, sortCriteria = 'name' } = newProps;
    const { services = [] } = existingProps;
    const state = { ...newProps };
    if (newServices.length > services.length) {
      state.expanded = true;
      state.toAnimate = {};
      const servicesMap = services.reduce((map, service) => ((map[service.id] = true), map), {});
      newServices.forEach(service => {
        if (!servicesMap[service.id]) {
          state.toAnimate[service.id] = true;
        }
      });
    }

    // Basic descending sort
    state.services.sort((a, b) => {
      if (a[sortCriteria] < b[sortCriteria]) {
        return -1;
      }
      if (a[sortCriteria] > b[sortCriteria]) {
        return 1;
      }
      return 0;
    });
    return state;
  }

  private createAnchorClickHandler = url => () => this.props.onAnchorClick(url);

  private onDispatchDocsClick = this.createAnchorClickHandler('https://aka.ms/bot-framework-emulator-create-dispatch');

  private onEmulatorServicesClick = this.createAnchorClickHandler('https://aka.ms/bot-framework-emulator-services');

  private onLuisDocsClick = this.createAnchorClickHandler('http://aka.ms/bot-framework-emulator-LUIS-docs-home');

  private onQnADocsClick = this.createAnchorClickHandler('http://aka.ms/bot-framework-emulator-qna-docs-home');

  protected get emptyContent(): JSX.Element {
    return (
      <div>
        <p className={styles.emptyContent}>
          {'You can connect your bot to services such as '}
          <LinkButton className={styles.explorerLink} linkRole={true} onClick={this.onLuisDocsClick}>
            {'Language Understanding (LUIS), '}
          </LinkButton>
          <LinkButton className={styles.explorerLink} linkRole={true} onClick={this.onQnADocsClick}>
            {'QnA Maker, '}
          </LinkButton>
          {'and '}
          <LinkButton className={styles.explorerLink} linkRole={true} onClick={this.onDispatchDocsClick}>
            Dispatch.
          </LinkButton>
        </p>
        <p className={styles.emptyContent}>
          <LinkButton className={styles.explorerLink} linkRole={true} onClick={this.onEmulatorServicesClick}>
            Learn more about using services.
          </LinkButton>
        </p>
      </div>
    );
  }

  protected get additionalContent(): JSX.Element {
    return this.emptyContent;
  }

  protected get links() {
    const { services = [], toAnimate = {} } = this.state;

    return services.map((service, index) => {
      let label = service.name;
      let containerName = '';

      if (service.type === ServiceTypes.BlobStorage || service.type === ServiceTypes.CosmosDB) {
        // Both IBlobStorageService and ICosmosDBService extend IAzureService
        label = (service as IAzureService).serviceName;
        containerName += `-  ${(service as IBlobStorageService).container ||
          (service as ICosmosDBService).collection} `;
      }

      if ('version' in service) {
        label += `, v${(service as any).version}`;
      }

      return (
        <li
          key={index}
          className={`${styles.link} ${toAnimate[service.id] ? styles.animateHighlight : ''} `}
          onDoubleClick={this.onLinkClick}
          onKeyPress={this.onKeyPress}
          data-index={index}
          tabIndex={0}
          title={service.name}
        >
          {iconMap[service.type]}
          {label}{' '}
          <span>
            {' '}
            {containerName}- {serviceTypeLabels[service.type]}
          </span>
        </li>
      );
    });
  }

  protected onContextMenuOverLiElement(li: HTMLLIElement) {
    super.onContextMenuOverLiElement(li);
    const { index } = li.dataset;
    const { [+index]: connectedService } = this.props.services;
    this.props.openContextMenuForService(connectedService, ConnectedServiceEditorContainer);
  }

  protected onKeyPress = (e): void => {
    if (e.key === 'Enter') {
      this.onLinkClick(e);
    }
  };

  protected onLinkClick: MouseEventHandler<HTMLLIElement> = (event: SyntheticEvent<HTMLLIElement>): void => {
    const { currentTarget } = event;
    const { index } = currentTarget.dataset;
    const { [+index]: connectedService } = this.props.services;
    this.props.openServiceDeepLink(connectedService);
  };

  protected onSortClick = (_event: SyntheticEvent<HTMLButtonElement>) => {
    const sortIconRect = this.sortIconButtonRef.getBoundingClientRect();
    const contextMenuCoords: ContextMenuCoordinates = { x: sortIconRect.left, y: sortIconRect.bottom };
    this.props.openSortContextMenu(contextMenuCoords);
  };

  protected onAddIconClick = async (_event: SyntheticEvent<HTMLButtonElement>): Promise<void> => {
    const addIconRect = this.addIconButtonRef.getBoundingClientRect();
    const contextMenuCoords: ContextMenuCoordinates = { x: addIconRect.left, y: addIconRect.bottom };
    await this.props.openAddServiceContextMenu(
      {
        azureAuthWorkflowComponents: {
          loginFailedDialog: AzureLoginFailedDialogContainer,
          loginSuccessDialog: AzureLoginSuccessDialogContainer,
          promptDialog: ConnectServicePromptDialogContainer,
        },
        getStartedDialog: GetStartedWithCSDialogContainer,
        editorComponent: ConnectedServiceEditorContainer,
        pickerComponent: ConnectedServicePickerContainer,
        progressIndicatorComponent: ProgressIndicatorContainer,
      },
      contextMenuCoords
    );

    this.addIconButtonRef && this.addIconButtonRef.focus();
  };
}
