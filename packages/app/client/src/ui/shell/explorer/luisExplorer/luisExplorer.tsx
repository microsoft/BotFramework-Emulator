import { ILuisService } from '@bfemulator/sdk-shared';
import { css } from 'glamor';
import * as React from 'react';
import { ComponentClass, MouseEventHandler, SyntheticEvent } from 'react';
import { ServicePane, ServicePaneProps } from '../servicePane';
import { LuisModelsViewerContainer } from './luisModelsViewerDialog';

const emptyContentCss = css({
  margin: '12px 25px',
  fontSize: '13px',
  color: 'rgba(255, 255, 255, .5)'
});

interface LuisExplorerProps extends ServicePaneProps {
  luisServices: ILuisService[];
  openLuisDeepLink: (luisService: ILuisService) => void;
  launchLuisModelsViewer: (viewer: ComponentClass<any>) => void;
}

export class LuisExplorer extends ServicePane<LuisExplorerProps> {
  constructor(props, context) {
    super(props, context);
  }

  protected get title(): string {
    return 'LUIS';
  }

  protected get emptyContent(): JSX.Element {
    return (
      <p { ...emptyContentCss }>You have not saved any LUIS apps to this bot.</p>
    );
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
    const { [index]: luisModel } = this.props.luisServices;
    this.props.openLuisDeepLink(luisModel);
  };

  protected onContextMenuOverLiElement(li: HTMLLIElement) {
    super.onContextMenuOverLiElement(li);
    const { index } = li.dataset;
    const { [index]: luisService } = this.props.luisServices;
    this.props.openContextMenu(luisService);
  }

  protected onAddIconClick = (event: SyntheticEvent<HTMLButtonElement>): void => {
    this.props.launchLuisModelsViewer(LuisModelsViewerContainer);
  };
}
