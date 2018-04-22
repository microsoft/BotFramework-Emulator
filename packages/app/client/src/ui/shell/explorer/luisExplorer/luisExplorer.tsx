import { IQnAService } from '@bfemulator/sdk-shared';
import * as React from 'react';
import { ComponentClass, MouseEventHandler, SyntheticEvent } from 'react';
import { ServicePane, ServicePaneProps } from '../servicePane';
import { LuisEditorContainer } from './luisEditor';

export interface LuisProps extends ServicePaneProps {
  luisServices?: IQnAService[];
  launchLuisEditor: (luisEditor: ComponentClass<any>) => void;
  openLuisDeepLink: (luisService: IQnAService) => void;
}

export class LuisExplorer extends ServicePane<LuisProps> {
  public state = {} as { expanded?: boolean };

  constructor(props, context) {
    super(props, context);
  }

  protected get links() {
    const { luisServices = [] } = this.props;
    return luisServices
      .map((model, index) => {
        return <li key={ index } onClick={ this.onLinkClick } data-index={ index }>{ model.name }</li>;
      });
  }

  protected onLinkClick: MouseEventHandler<HTMLLIElement> = (event: SyntheticEvent<HTMLLIElement>): void => {
    const { currentTarget } = event;
    const { index } = currentTarget.dataset;
    const { [index]: luisService } = this.props.luisServices;
    this.props.openLuisDeepLink(luisService);
  };

  protected onContextMenuOverLiElement(li: HTMLLIElement) {
    super.onContextMenuOverLiElement(li);
    const { index } = li.dataset;
    const { [index]: luisService } = this.props.luisServices;
    this.props.openContextMenu(luisService, LuisEditorContainer);
  }

  protected onAddIconClick = (event: SyntheticEvent<HTMLButtonElement>): void => {
    this.props.launchLuisEditor(LuisEditorContainer);
  };
}
