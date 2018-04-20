import { IQnAService } from '@bfemulator/sdk-shared';
import * as React from 'react';
import { ComponentClass, MouseEventHandler, SyntheticEvent } from 'react';
import { ServicePane, ServicePaneProps } from '../servicePane';
import { QnaMakerEditorContainer } from './qnaMakerEditor';

export interface QnaMakerProps extends ServicePaneProps {
  qnaMakerServices?: IQnAService[];
  launchQnaMakerEditor: (qnaMakerEditor: ComponentClass<any>) => void;
  openQnaMakerDeepLink: (qnaMakerService: IQnAService) => void;
}

export class QnaMakerExplorer extends ServicePane<QnaMakerProps> {
  public state = {} as { expanded?: boolean };

  constructor(props, context) {
    super(props, context);
  }

  protected get links() {
    const { qnaMakerServices = [] } = this.props;
    return qnaMakerServices
      .map((model, index) => {
        return <li key={ index } onClick={ this.onLinkClick } data-index={ index }>{ model.name }</li>;
      });
  }

  protected onLinkClick: MouseEventHandler<HTMLLIElement> = (event: SyntheticEvent<HTMLLIElement>): void => {
    const { currentTarget } = event;
    const { index } = currentTarget.dataset;
    const { [index]: qnaMakerService } = this.props.qnaMakerServices;
    this.props.openQnaMakerDeepLink(qnaMakerService);
  };

  protected onContextMenuOverLiElement(li: HTMLLIElement) {
    super.onContextMenuOverLiElement(li);
    const { index } = li.dataset;
    const { [index]: qnaMakerService } = this.props.qnaMakerServices;
    this.props.openContextMenu(qnaMakerService, QnaMakerEditorContainer);
  }

  protected onAddIconClick = (event: SyntheticEvent<HTMLButtonElement>): void => {
    this.props.launchQnaMakerEditor(QnaMakerEditorContainer);
  };
}
