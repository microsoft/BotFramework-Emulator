import { IQnAService } from '@bfemulator/sdk-shared';
import * as React from 'react';
import { ComponentClass, MouseEventHandler, SyntheticEvent } from 'react';
import { ServicePane, ServicePaneProps } from '../servicePane';
import { AzureBotServiceEditorContainer } from './azureBotServiceEditor';

export interface AzureBotServiceProps extends ServicePaneProps {
  azureBotServiceServices?: IQnAService[];
  launchAzureBotServiceEditor: (azureBotServiceEditor: ComponentClass<any>) => void;
  openAzureBotServiceDeepLink: (azureBotServiceService: IQnAService) => void;
}

export class AzureBotServiceExplorer extends ServicePane<AzureBotServiceProps> {
  public state = {} as { expanded?: boolean };

  constructor(props, context) {
    super(props, context);
  }

  protected get links() {
    const { azureBotServiceServices = [] } = this.props;
    return azureBotServiceServices
      .map((model, index) => {
        return <li key={ index } onClick={ this.onLinkClick } data-index={ index }>{ model.name }</li>;
      });
  }

  protected onLinkClick: MouseEventHandler<HTMLLIElement> = (event: SyntheticEvent<HTMLLIElement>): void => {
    const { currentTarget } = event;
    const { index } = currentTarget.dataset;
    const { [index]: azureBotServiceService } = this.props.azureBotServiceServices;
    this.props.openAzureBotServiceDeepLink(azureBotServiceService);
  };

  protected onContextMenuOverLiElement(li: HTMLLIElement) {
    super.onContextMenuOverLiElement(li);
    const { index } = li.dataset;
    const { [index]: azureBotServiceService } = this.props.azureBotServiceServices;
    this.props.openContextMenu(azureBotServiceService, AzureBotServiceEditorContainer);
  }

  protected onAddIconClick = (event: SyntheticEvent<HTMLButtonElement>): void => {
    this.props.launchAzureBotServiceEditor(AzureBotServiceEditorContainer);
  };
}
