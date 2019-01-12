import { BotInfo, SharedConstants } from "@bfemulator/app-shared";
import { connect } from "react-redux";

import { getBotInfoByPath } from "../../../data/botHelpers";
import { RootState } from "../../../data/store";
import { CommandServiceImpl } from "../../../platform/commands/commandServiceImpl";
import { DialogService } from "../service";

import { ResourcesSettings, ResourcesSettingsProps } from "./resourcesSettings";

const mapStateToProps = (
  state: RootState,
  ownProps: ResourcesSettingsProps
) => {
  const { path } = state.bot.activeBot;
  const botInfo: BotInfo = getBotInfoByPath(path);
  const { transcriptsPath, chatsPath } = botInfo;
  return { transcriptsPath, chatsPath, path, ...ownProps };
};

const mapDispatchToProps = _dispatch => ({
  save: (settings: Partial<BotInfo>) => DialogService.hideDialog(settings),
  showOpenDialog: () =>
    CommandServiceImpl.remoteCall(
      SharedConstants.Commands.Electron.ShowOpenDialog,
      { properties: ["openDirectory"] }
    ),
  cancel: () => DialogService.hideDialog(0)
});
export const ResourcesSettingsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ResourcesSettings);
