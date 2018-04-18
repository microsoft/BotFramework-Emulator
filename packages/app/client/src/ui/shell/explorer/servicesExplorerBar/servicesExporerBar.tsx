import * as React from 'react';
import { Component } from 'react';
import { ExplorerBarBody } from '../explorerBarBody';
import { ExplorerBarHeader, Title } from '../explorerBarHeader';
import { LuisExplorerContainer } from '../luisExplorer';
import { PortalsExplorer } from '../portalsExplorer';
import { QnaMakerExplorerContainer } from '../qnaMakerExplorer';

export default class ServicesExplorerBar extends Component<{ activeBotExists: boolean }> {

  constructor(props, context) {
    super(props, context);
  }

  private get explorerBodyChildren(): JSX.Element {
    const { activeBotExists } = this.props;
    if (activeBotExists) {
      return (
        <>
          <LuisExplorerContainer/>
          <QnaMakerExplorerContainer/>
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
          <PortalsExplorer/>
          { this.explorerBodyChildren }
        </ExplorerBarBody>
      </>
    );
  }
}
