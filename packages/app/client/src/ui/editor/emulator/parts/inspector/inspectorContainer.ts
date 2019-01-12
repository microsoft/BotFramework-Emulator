import { connect } from "react-redux";

import { RootState } from "../../../../../data/store";

import { Inspector } from "./inspector";

const mapStateToProps = (state: RootState, ownProps: any) => {
  const { bot, theme, clientAwareSettings } = state;
  const cwdAsBase = !(clientAwareSettings.cwd || "").startsWith("/")
    ? `/${clientAwareSettings.cwd}`
    : clientAwareSettings.cwd;
  return {
    ...ownProps,
    botHash: bot.activeBotDigest,
    activeBot: bot.activeBot,
    themeInfo: theme,
    cwdAsBase
  };
};

export const InspectorContainer = connect(
  mapStateToProps,
  null
)(Inspector);
