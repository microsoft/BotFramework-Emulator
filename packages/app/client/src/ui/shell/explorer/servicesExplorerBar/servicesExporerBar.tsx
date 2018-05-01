import * as React from 'react';
import { Component } from 'react';
import { ExplorerBarBody } from '../explorerBarBody';
import { ExplorerBarHeader, Title } from '../explorerBarHeader';
import { LuisExplorerContainer } from '../luisExplorer';
import { DispatchExplorerContainer } from '../dispatchExplorer';
import { QnaMakerExplorerContainer } from '../qnaMakerExplorer';
import { AzureBotServiceExplorerContainer } from '../azureBotServiceExplorer';

export default class ServicesExplorerBar extends Component<{ activeBotExists: boolean }> {

  constructor(props, context) {
    super(props, context);
  }

  private get explorerBodyChildren(): JSX.Element {
    const { activeBotExists } = this.props;
    if (activeBotExists) {
      return (
        <>
          <AzureBotServiceExplorerContainer title="Azure Bot Service" />
          <DispatchExplorerContainer title="Dispatch" />
          <LuisExplorerContainer title="LUIS" />
          <QnaMakerExplorerContainer title="QnA Maker" />
        </>
      );
    }
    return null;
  }

  render() {
    return (
      <>
        <ExplorerBarHeader>
          <Title>
            Services
          </Title>
        </ExplorerBarHeader>
        <ExplorerBarBody>
          {this.explorerBodyChildren}
        </ExplorerBarBody>
      </>
    );
  }
}
