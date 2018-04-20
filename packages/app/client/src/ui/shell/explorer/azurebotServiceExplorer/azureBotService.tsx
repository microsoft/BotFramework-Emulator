import { IAzureBotService } from '@bfemulator/sdk-shared';
import { css, StyleAttribute } from 'glamor';
import * as React from 'react';
import { ComponentClass, MouseEventHandler, SyntheticEvent } from 'react';
import { ServicePane, ServicePaneProps } from '../servicePane';

interface AzureBotServiceExplorerProps extends ServicePaneProps {
  services: IAzureBotService[];
  launchServiceViewer: (viewer: ComponentClass<any>) => void;
}

export class AzureBotServiceExplorer extends ServicePane<AzureBotServiceExplorerProps> {
  constructor(props, context) {
    super(props, context);
  }

  protected get links(): JSX.Element[] {
    const { services = [] } = this.props;
    return services.map((model, index) => {
      return <li key={ index } onClick={ this.onLinkClick } data-index={ index }>{ model.name }</li>;
    });
  }

  protected get componentCss(): StyleAttribute {
    const componentCss = super.componentCss;
    const overrides = css({
      '& .addIconButton': {
        display: 'none'
      }
    });

    return css(componentCss, overrides);
  }

  protected onLinkClick: MouseEventHandler<HTMLLIElement> = (event: SyntheticEvent<HTMLLIElement>): void => {
    const { currentTarget } = event;
    const { index } = currentTarget.dataset;
    const { [index]: abs } = this.props.services;
    // Unimplemented - future feature
  };

  protected onContextMenuOverLiElement(li: HTMLLIElement) {
    super.onContextMenuOverLiElement(li);
    const { index } = li.dataset;
    const { [index]: service } = this.props.services;
    this.props.openContextMenu(service);
  }

  protected onAddIconClick = (event: SyntheticEvent<HTMLButtonElement>): void => {
    // Unimplemented future feature
  };
}
