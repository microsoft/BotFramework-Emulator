import { connect } from 'react-redux';

import { ResourcesSettings, ResourcesSettingsProps } from './resourcesSettings';
import { RootState } from '../../../data/store';
import { BotInfo, SharedConstants } from '@bfemulator/app-shared';
import { getBotInfoByPath } from '../../../data/botHelpers';
import { DialogService } from '../service';
import { CommandServiceImpl } from '../../../platform/commands/commandServiceImpl';

const mapStateToProps = (state: RootState, ownProps: ResourcesSettingsProps) => {
  const { path } = state.bot.activeBot;
  const botInfo: BotInfo = getBotInfoByPath(path);
  const { transcriptsPath, chatsPath } = botInfo;
  return { transcriptsPath, chatsPath, path, ...ownProps };
};

const mapDispatchToProps = _dispatch => ({
  save: (settings: Partial<BotInfo>) => DialogService.hideDialog(settings),
  showOpenDialog: () => CommandServiceImpl.remoteCall(SharedConstants.Commands.Electron.ShowOpenDialog,
    { properties: ['openDirectory'] }),
  cancel: () => DialogService.hideDialog(0)
});
export const ResourcesSettingsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ResourcesSettings);
