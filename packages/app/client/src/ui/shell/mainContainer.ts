import * as PresentationActions from '../../data/action/presentationActions';
import * as Constants from '../../constants';
import { connect } from 'react-redux';
import { IRootState } from "../../data/store";
import { Main, MainProps } from './main';

const mapStateToProps = (state: IRootState): MainProps => ({
  presentationModeEnabled: state.presentation.enabled,
  primaryEditor: state.editor.editors[Constants.EditorKey_Primary],
  secondaryEditor: state.editor.editors[Constants.EditorKey_Secondary],
  showingExplorer: state.explorer.showing,
  navBarSelection: state.navBar.selection
});

const mapDispatchToProps = (dispatch): MainProps => ({
  exitPresentationMode: (e:KeyboardEvent) => {
    if (e.key === 'Escape') {
      dispatch(PresentationActions.disable());
    }
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Main);
