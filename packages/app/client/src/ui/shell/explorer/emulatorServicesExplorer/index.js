import { css } from 'glamor';
import React from 'react';

import { Colors, ExpandCollapse, ExpandCollapseControls, ExpandCollapseContent } from '@bfemulator/ui-react';
import { ExplorerItem } from '../explorerItem';
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

export default class EmulatorServicesExplorer extends React.Component {
  render() {
    return (
      <div className={ EXPLORER_CSS }>
        <ExpandCollapse
          expanded={ true }
          title="Emulator Services"
        >
          <ExpandCollapseContent key={ this.props.changeKey }>
            <ul className={ CONVO_CSS }>
              <ExplorerItem active={false}>
                <span>Attachment Cache</span>
              </ExplorerItem>
              <ExplorerItem active={false}>
                <span>State Service</span>
              </ExplorerItem>
            </ul>
          </ExpandCollapseContent>
        </ExpandCollapse>
      </div>
    );
  }
}
