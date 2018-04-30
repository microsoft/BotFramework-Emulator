import { IQnAService } from 'msbot/bin/schema';
import * as React from 'react';
import { ComponentClass, MouseEventHandler, SyntheticEvent } from 'react';
import { ServicePane, ServicePaneProps } from '../servicePane';
import { DispatchEditorContainer } from './dispatchEditor';

export interface DispatchProps extends ServicePaneProps {
  dispatchServices?: IQnAService[];
  launchDispatchEditor: (dispatchEditor: ComponentClass<any>) => void;
  openDispatchDeepLink: (dispatchService: IQnAService) => void;
}

export class DispatchExplorer extends ServicePane<DispatchProps> {
  public state = {} as { expanded?: boolean };

  constructor(props, context) {
    super(props, context);
  }

  protected get links() {
    const { dispatchServices = [] } = this.props;
    return dispatchServices
      .map((model, index) => {
        return <li key={ index } onClick={ this.onLinkClick } data-index={ index }>{ model.name }</li>;
      });
  }

  protected onLinkClick: MouseEventHandler<HTMLLIElement> = (event: SyntheticEvent<HTMLLIElement>): void => {
    const { currentTarget } = event;
    const { index } = currentTarget.dataset;
    const { [index]: dispatchService } = this.props.dispatchServices;
    this.props.openDispatchDeepLink(dispatchService);
  };

  protected onContextMenuOverLiElement(li: HTMLLIElement) {
    super.onContextMenuOverLiElement(li);
    const { index } = li.dataset;
    const { [index]: dispatchService } = this.props.dispatchServices;
    this.props.openContextMenu(dispatchService, DispatchEditorContainer);
  }

  protected onAddIconClick = (event: SyntheticEvent<HTMLButtonElement>): void => {
    this.props.launchDispatchEditor(DispatchEditorContainer);
  };
}
