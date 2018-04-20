import * as React from 'react';
import { Component } from 'react';
import { EndpointExplorerContainer } from '../endpointExplorer';
import { ExplorerBarBody } from '../explorerBarBody';
import { ExplorerBarHeader, Title } from '../explorerBarHeader';
import { DispatchExplorerContainer, LuisExplorerContainer } from '../luisExplorer';
import { QnaMakerExplorerContainer } from '../qnaMakerExplorer';
import {AzureBotServiceExplorerContainer} from '../azurebotServiceExplorer';

export default class ServicesExplorerBar extends Component<{ activeBotExists: boolean }> {

  constructor(props, context) {
    super(props, context);
  }

  private get explorerBodyChildren(): JSX.Element {
    const { activeBotExists } = this.props;
    if (activeBotExists) {
      return (
        <>
          <DispatchExplorerContainer title="Dispatch"/>
          <EndpointExplorerContainer title="Endpoint"/>
          <LuisExplorerContainer title="LUIS"/>
          <QnaMakerExplorerContainer title="QnA Maker"/>
          <AzureBotServiceExplorerContainer title="Azure Bot Service"/>
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
          { this.explorerBodyChildren }
        </ExplorerBarBody>
      </>
    );
  }
}
