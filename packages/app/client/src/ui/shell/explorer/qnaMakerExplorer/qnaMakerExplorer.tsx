import { IQnAService } from '@bfemulator/sdk-shared';
import { css, StyleAttribute } from 'glamor';
import * as React from 'react';
import { MouseEventHandler, SyntheticEvent } from 'react';
import { ServicePane, ServicePaneProps } from '../servicePane';

const emptyContentCss = css({
  margin: '12px 25px',
  fontSize: '13px',
  color: 'rgba(255, 255, 255, .5)'
});

interface QnaMakerProps extends ServicePaneProps {
  qnaMakerServices?: IQnAService[];
  openQnaMakerDeepLink: (qnaMakerService: IQnAService) => void;
}

export class QnaMakerExplorer extends ServicePane<QnaMakerProps> {
  public state = {} as { expanded?: boolean };

  constructor(props, context) {
    super(props, context);
  }

  protected get title(): string {
    return 'QNA MAKER';
  }

  protected get componentCss(): StyleAttribute {
    const componentCss = super.componentCss;
    const overrides = css({
      '> button': {
        display: 'none'
      }
    });

    return css(componentCss, overrides);
  }

  protected get emptyContent(): JSX.Element {
    return (
      <p { ...emptyContentCss }>You have not saved any QnA Maker apps to this bot.</p>
    );
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
    this.props.openContextMenu(qnaMakerService);
  }
}
