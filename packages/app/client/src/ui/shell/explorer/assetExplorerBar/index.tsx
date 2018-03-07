import * as React from 'react';
import { getBotById } from '../../../../data/botHelpers';
import { ExplorerBarHeader, Title, Accessories } from '../explorerBarHeader';
import { ExplorerBarBody } from '../explorerBarBody';
import { getBotDisplayName } from '@bfemulator/app-shared';
import { CommandService } from '../../../../platform/commands/commandService';
import LiveChatExplorer from '../liveChatExplorer';
import BotNotOpenExplorer from '../botNotOpenExplorer';
import TranscriptExplorer from '../transcriptExplorer';

export class IAssetExplorerBarProps {
  activeBot: string;
}

export default class AssetExplorerBar extends React.Component<IAssetExplorerBarProps> {

  constructor(props, context) {
    super(props, context);
    this.onClickSettings = this.onClickSettings.bind(this);
  }

  onClickSettings(e) {
    const bot = getBotById(this.props.activeBot);
    CommandService.call('bot:settings:open', bot);
  }

  render() {
    const bot = getBotById(this.props.activeBot);
    return (
      <>
        <ExplorerBarHeader>
          <Title>
            { this.props.activeBot ? getBotDisplayName(bot) : false }
          </Title>
          <Accessories>
            { this.props.activeBot ? <span className="accessory bot-settings-icon" onClick={ this.onClickSettings } /> : false }
          </Accessories>
        </ExplorerBarHeader>
        <ExplorerBarBody>
          { this.props.activeBot ? (
            <>
              <LiveChatExplorer />
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
