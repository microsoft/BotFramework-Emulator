import { connect } from 'react-redux';
import { addedLuisModelsUpdated } from '../../../../../data/action/luisModelsActions';
import { IRootState } from '../../../../../data/store';
import { LuisModelsViewer } from './luisModelsViewer';

const mapStateToProps = (state: IRootState) => {
  const { addedLuisModels, availableLuisModels } = state.luisModel;
  return {
    addedLuisModels,
    availableLuisModels
  };
};

const mapDispatchToProps = dispatch => {
  return { addLuisModels: updatedLuisModels => dispatch(addedLuisModelsUpdated(updatedLuisModels)) };
};

export const LuisModelsViewerContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(LuisModelsViewer as any) as any;
