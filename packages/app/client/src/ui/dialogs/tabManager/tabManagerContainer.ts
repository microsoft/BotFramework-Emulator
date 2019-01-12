import { connect } from "react-redux";

import * as EditorActions from "../../../data/action/editorActions";
import { RootState } from "../../../data/store";

import { TabManager, TabManagerProps } from "./tabManager";
const mapStateToProps = (
  state: RootState,
  ownProps: { [propName: string]: any }
): TabManagerProps => ({
  recentTabs: state.editor.editors[state.editor.activeEditor].recentTabs,
  window,
  ...ownProps
});

const mapDispatchToProps = (dispatch): TabManagerProps => ({
  setActiveTab: (tab: string) => {
    dispatch(EditorActions.setActiveTab(tab));
  }
});

export const TabManagerContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(TabManager) as any;
