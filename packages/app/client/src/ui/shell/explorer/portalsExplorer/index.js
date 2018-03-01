import { css } from 'glamor';
import React from 'react';

import ExpandCollapse, { Controls as ExpandCollapseControls, Content as ExpandCollapseContent } from '../../../layout/expandCollapse';
import * as Colors from '../../../styles/colors';
import ExplorerItem from '../explorerItem';
import { EXPLORER_CSS } from '../explorerStyle';

const CONVO_CSS = css({
  display: 'flex',
  flexDirection: 'column',
  listStyleType: 'none',
  margin: 0,
  padding: 0,
  overflowY: 'auto',
  overflowX: 'hidden',
});

export default class PortalsExplorer extends React.Component {
  render() {
    return (
      <div className={ EXPLORER_CSS }>
        <ExpandCollapse
          initialExpanded={ true }
          title="Portals"
        >
          <ExpandCollapseContent key={ this.props.changeKey }>
            <ul className={ CONVO_CSS }>
              <ExplorerItem active={ false }>
                <span>Bot Framework</span>
              </ExplorerItem>
              <ExplorerItem active={ false }>
                <span>Chat Logs</span>
              </ExplorerItem>
              <ExplorerItem active={ false }>
                <span>LUIS</span>
              </ExplorerItem>
              <ExplorerItem active={ false }>
                <span>QnA Maker</span>
              </ExplorerItem>
            </ul>
          </ExpandCollapseContent>
        </ExpandCollapse>
      </div>
    );
  }
}
