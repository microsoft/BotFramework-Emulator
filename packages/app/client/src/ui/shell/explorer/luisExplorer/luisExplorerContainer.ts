import { ServiceType } from '@bfemulator/sdk-shared';
import { ComponentClass } from 'react';
import { connect } from 'react-redux';
import { launchLuisModelsViewer } from '../../../../data/action/luisAuthActions';
import { openLuisDeepLink, openLuisExplorerContextMenu } from '../../../../data/action/luisServicesActions';
import { IRootState } from '../../../../data/store';
import { LuisExplorer } from './luisExplorer';

const mapStateToProps = (state: IRootState, ownProps: {}) => {
  const { services } = state.bot.activeBot;
  return {
    services: services.filter(service => service.type === ServiceType.Luis),
    window,
    ...ownProps
  };
};

const mapDispatchToProps = dispatch => {
  return {
    launchServiceViewer: (luisModelViewer: ComponentClass<any>) => dispatch(launchLuisModelsViewer(luisModelViewer)),
    openDeepLink: luisService => dispatch(openLuisDeepLink(luisService)),
    openContextMenu: luisService => dispatch(openLuisExplorerContextMenu(luisService))
  };
};

export const LuisExplorerContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(LuisExplorer) as any;
