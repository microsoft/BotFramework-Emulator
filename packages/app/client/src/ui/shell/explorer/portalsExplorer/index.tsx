import { css } from 'glamor';
import * as React from 'react';

import { ExpandCollapse, Controls as ExpandCollapseControls, Content as ExpandCollapseContent } from '../../../layout';
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

export class PortalsExplorer extends React.Component {
  render() {
    return (
      <div { ...EXPLORER_CSS }>
        <ExpandCollapse
          expanded={ true }
          title="Portals"
        >
          <ExpandCollapseContent>
            <ul { ...CONVO_CSS }>
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
