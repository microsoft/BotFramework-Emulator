import { IEndpointService } from "botframework-config/lib/schema";
import { connect } from "react-redux";

import { RootState } from "../../../../../data/store";

import { Chat } from "./chat";

const mapStateToProps = (state: RootState, { document }) => ({
  currentUserId: state.clientAwareSettings.users.currentUserId,
  locale: state.clientAwareSettings.locale || "en-us",
  endpoint: ((state.bot.activeBot && state.bot.activeBot.services) || []).find(
    s => s.id === document.endpointId
  ) as IEndpointService
});

export const ChatContainer = connect(
  mapStateToProps,
  null
)(Chat);
