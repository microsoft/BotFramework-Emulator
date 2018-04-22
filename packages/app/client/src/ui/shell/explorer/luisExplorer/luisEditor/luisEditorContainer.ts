import { connect } from 'react-redux';
import { IRootState } from '../../../../../data/store';
import { DialogService } from '../../../../dialogs/service';
import { LuisEditor } from './luisEditor';

const mapStateToProps = (state: IRootState, ownProps: { [propName: string]: any }) => {
  return {
    ...ownProps
  };
};

const mapDispatchToProps = dispatch => {
  return {
    updateLuisService: updatedLuisService => DialogService.hideDialog(updatedLuisService),
    cancel: () => DialogService.hideDialog()
  };
};

export const LuisEditorContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(LuisEditor) as any;
