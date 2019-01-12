import { SharedConstants } from "@bfemulator/app-shared";
import { BotConfigWithPathImpl } from "@bfemulator/sdk-shared";
import { connect } from "react-redux";

import { beginAdd } from "../../../data/action/notificationActions";
import { RootState } from "../../../data/store";
import { CommandServiceImpl } from "../../../platform/commands/commandServiceImpl";
import { DialogService } from "../service";

import { BotSettingsEditor, BotSettingsEditorProps } from "./botSettingsEditor";

const mapStateToProps = (
  state: RootState,
  ownProps: {}
): Partial<BotSettingsEditorProps> => {
  return {
    window,
    bot: BotConfigWithPathImpl.fromJSON(state.bot.activeBot), // Copy only
    ...ownProps
  };
};

const mapDispatchToProps = dispatch => ({
  cancel: () => DialogService.hideDialog(0),
  sendNotification: notification => dispatch(beginAdd(notification)),
  onAnchorClick: (url: string) => {
    CommandServiceImpl.remoteCall(
      SharedConstants.Commands.Electron.OpenExternal,
      url
    ).catch();
  }
});

export const BotSettingsEditorContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(BotSettingsEditor);
