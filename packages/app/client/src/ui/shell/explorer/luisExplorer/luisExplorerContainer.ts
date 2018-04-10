import { ComponentClass } from 'react';
import { connect } from 'react-redux';
import { launchLuisModelsViewer } from '../../../../data/action/luisAuthActions';
import { IRootState } from '../../../../data/store';
import { LuisExplorer } from './luisExplorer';

const mapStateToProps = (state: IRootState) => {
  const { addedLuisModels } = state.luisModel;
  return {
    addedLuisModels
  };
};

const mapDispatchToProps = dispatch => {
  return { launchLuisModelsViewer: (luisModelViewer: ComponentClass<any>) => dispatch(launchLuisModelsViewer(luisModelViewer)) };
};

export const LuisExplorerContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(LuisExplorer) as any;
