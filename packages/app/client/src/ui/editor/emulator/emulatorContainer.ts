import { connect } from "react-redux";

import { RootState } from "../../../data/store";

import { Emulator } from "./emulator";

const mapStateToProps = (state: RootState, ownProps: any[]) => ({
  url: state.clientAwareSettings.serverUrl,
  ...ownProps
});

export const EmulatorContainer = connect(mapStateToProps)(Emulator);
