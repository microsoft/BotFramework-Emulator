import { css } from 'glamor';
import React from 'react';

import ExpandCollapse, { Controls as ExpandCollapseControls, Content as ExpandCollapseContent } from '../../../layout/expandCollapse';
import * as Colors from '../../../styles/colors';
import ExplorerItem from '../explorerItem';

const CSS = css({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  listStyleType: 'none',
  margin: 0,
  padding: 0,
  backgroundColor: Colors.EXPLORER_BACKGROUND_DARK,
  color: Colors.EXPLORER_FOREGROUND_DARK,

  '& .empty-list': {
    margin: '4px 4px 4px 16px',
    whiteSpace: 'nowrap',
  }
});

const CONVO_CSS = css({
  display: 'flex',
  flexDirection: 'column',
  listStyleType: 'none',
  margin: 0,
  padding: 0,
});

export default class EmulatorServicesExplorer extends React.Component {
  render() {
    return (
      <ul className={ CSS }>
        <li>
          <ExpandCollapse
            initialExpanded={ true }
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
        </li>
      </ul>
    );
  }
}
