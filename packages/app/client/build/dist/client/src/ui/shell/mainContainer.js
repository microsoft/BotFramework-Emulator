import * as PresentationActions from '../../data/action/presentationActions';
import * as Constants from '../../constants';
import { connect } from 'react-redux';
import { Main } from './main';
const mapStateToProps = (state) => ({
    presentationModeEnabled: state.presentation.enabled,
    primaryEditor: state.editor.editors[Constants.EDITOR_KEY_PRIMARY],
    secondaryEditor: state.editor.editors[Constants.EDITOR_KEY_SECONDARY],
    showingExplorer: state.explorer.showing,
    navBarSelection: state.navBar.selection
});
const mapDispatchToProps = (dispatch) => ({
    exitPresentationMode: (e) => {
        if (e.key === 'Escape') {
            dispatch(PresentationActions.disable());
        }
    }
});
export default connect(mapStateToProps, mapDispatchToProps)(Main);
//# sourceMappingURL=mainContainer.js.map