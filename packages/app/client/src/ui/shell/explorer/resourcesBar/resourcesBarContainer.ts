import { connect } from "react-redux";

import { RootState } from "../../../../data/store";

import { ResourcesBar, ResourcesBarProps } from "./resourcesBar";

const mapStateToProps = (
  state: RootState,
  ownProps: ResourcesBarProps
): ResourcesBarProps => ({
  chatFiles: state.resources.chats,
  chatsPath: state.resources.chatsPath,
  transcripts: state.resources.transcripts,
  transcriptsPath: state.resources.transcriptsPath,
  ...ownProps
});

export const ResourcesBarContainer = connect(mapStateToProps)(ResourcesBar);
