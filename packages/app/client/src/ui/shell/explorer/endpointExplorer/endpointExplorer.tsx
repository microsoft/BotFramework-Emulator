import { IEndpointService } from 'msbot/bin/schema';
import * as React from 'react';
import { ComponentClass, MouseEventHandler, SyntheticEvent } from 'react';
import { ServicePane, ServicePaneProps } from '../servicePane';
import { EndpointEditorContainer } from './endpointEditor';

export interface EndpointProps extends ServicePaneProps {
  endpointServices?: IEndpointService[];
  launchEndpointEditor: (endpointEditor: ComponentClass<any>) => void;
  openEndpointDeepLink: (endpointService: IEndpointService) => void;
}

export class EndpointExplorer extends ServicePane<EndpointProps> {
  public state = { expanded: true } as { expanded?: boolean };

  constructor(props, context) {
    super(props, context);
  }

  protected get links() {
    const { endpointServices = [] } = this.props;
    return endpointServices
      .map((model, index) => {
        return <li key={ index } onClick={ this.onLinkClick } data-index={ index }>{ model.name }</li>;
      });
  }

  protected onLinkClick: MouseEventHandler<HTMLLIElement> = (event: SyntheticEvent<HTMLLIElement>): void => {
    const { currentTarget } = event;
    const { index } = currentTarget.dataset;
    const { [index]: endpointService } = this.props.endpointServices;
    this.props.openEndpointDeepLink(endpointService);
  };

  protected onContextMenuOverLiElement(li: HTMLLIElement) {
    super.onContextMenuOverLiElement(li);
    const { index } = li.dataset;
    const { [index]: endpointService } = this.props.endpointServices;
    this.props.openContextMenu(JSON.parse(JSON.stringify(endpointService)), EndpointEditorContainer);
  }

  protected onAddIconClick = (event: SyntheticEvent<HTMLButtonElement>): void => {
    this.props.launchEndpointEditor(EndpointEditorContainer);
  };
}
