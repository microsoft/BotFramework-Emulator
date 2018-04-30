import * as React from 'react';

import { CommandService } from '../../../../platform/commands/commandService';
import { EndpointExplorerContainer } from '../endpointExplorer';
import { ExplorerBarBody } from '../explorerBarBody';
import { ExplorerBarHeader, Title, Accessories } from '../explorerBarHeader';
import { getBotDisplayName } from '@bfemulator/app-shared';
import { TranscriptExplorer } from '../transcriptExplorer';
import * as botHelpers from '../../../../data/botHelpers';
import BotNotOpenExplorer from '../botNotOpenExplorer';

export class IAssetExplorerBarProps {
  activeBot: string;
}

export default class AssetExplorerBar extends React.Component<IAssetExplorerBarProps> {

  constructor(props, context) {
    super(props, context);
    this.onClickSettings = this.onClickSettings.bind(this);
  }

  onClickSettings(e) {
    CommandService.call('bot-settings:open', this.props.activeBot);
  }

  render() {
    const activeBot = botHelpers.getActiveBot();
    return (
      <>
        <ExplorerBarHeader>
          <Title>
            Bot Explorer
          </Title>
          <Accessories>
            { this.props.activeBot ? <span className="accessory bot-settings-icon" onClick={ this.onClickSettings } /> : false }
          </Accessories>
        </ExplorerBarHeader>
        <ExplorerBarBody>
          { this.props.activeBot ? (
            <>
              <EndpointExplorerContainer title="Endpoint" />
              <TranscriptExplorer />
            </>
          )
            :
            (
              <BotNotOpenExplorer />
            )
          }
        </ExplorerBarBody>
      </>
    );
  }
}
