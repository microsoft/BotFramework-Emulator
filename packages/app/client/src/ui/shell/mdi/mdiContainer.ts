import { connect } from "react-redux";

import { RootState } from "../../../data/store";

import { MDIComponent } from "./mdi";

export interface MDIProps {
  owningEditor?: string;
  presentationModeEnabled?: boolean;
}

const mapStateToProps = (state: RootState, ownProps: MDIProps): MDIProps => ({
  ...ownProps,
  presentationModeEnabled: state.presentation.enabled
});

export const MDI = connect(
  mapStateToProps,
  null
)(MDIComponent);
