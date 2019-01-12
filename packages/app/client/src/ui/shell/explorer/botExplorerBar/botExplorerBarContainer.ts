import { connect } from "react-redux";

import { RootState } from "../../../../data/store";
import { BotSettingsEditorContainer } from "../../../dialogs";
import { DialogService } from "../../../dialogs/service";

import BotExplorerBar from "./botExplorerBar";

const mapStateToProps = (state: RootState) => {
  return {
    openBotSettings: () => {
      DialogService.showDialog(BotSettingsEditorContainer, {
        bot: state.bot.activeBot
      }).catch();
    }
  };
};
export const BotExplorerBarContainer = connect(mapStateToProps)(BotExplorerBar);
